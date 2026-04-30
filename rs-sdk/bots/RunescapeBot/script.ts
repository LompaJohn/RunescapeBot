import { runScript } from '../../sdk/runner';
import { createGroq } from '@ai-sdk/groq';
import { generateText, tool } from 'ai';
import { z } from 'zod';

import { readFile } from 'fs/promises';
import { BotSDK } from '../../sdk';

const TOTAL_ITERATIONS = 20;
const TIMEOUT_PER_ITERATION_SECS = 60;

const API_KEY = await readFile('./API_KEY.env', { encoding: 'utf8' });
if (API_KEY == null)
    throw "Arquivo './API_KEY.env' de API Key do groq nao encontrado. Ele deve ser criado no diretorio rs-sdk/bots/RunescapeBot.";

const groq = createGroq({ apiKey: API_KEY });
const llm = groq.languageModel('llama-3.1-8b-instant');

// SPECS
const InventoryItemSpec = z.object({
    slot: z.number(),
    id: z.number(),
    name: z.string(),
    count: z.number(),
    optionsWithIndex: z.array(
        z.object({ text: z.string(), opIndex: z.number() })
    ),
});

const ActionResultSpec = z
    .object({
        success: z.boolean(),
        message: z.string(),
        data: z.any().or(z.null()),
    })
    .describe('The result of trying to perform an action.');

const ShopInteractionSpec = z
    .object({
        success: z.boolean(),
        message: z.string(),
        amountSold: z.number().or(z.null()),
        rejected: z.boolean().or(z.null()),
    })
    .describe(
        'The result of trying to interact ( sell or buy ) an item to/from a shop.'
    );

async function getLLMFriendlyState(sdk: BotSDK) {
    let state = sdk.getState()!;
    let inventory = new Array();
    let nearbyNpcs = new Array();
    let nearbyLocs = new Array();

    for (let item of state.inventory) {
        inventory.push({
            name: item.name,
            slot: item.slot,
            amount: item.count,
        });
    }
    for (let npc of state.nearbyNpcs) {
        nearbyNpcs.push({ name: npc.name });
    }

    for (let loc of state.nearbyLocs) {
        nearbyLocs.push({ name: loc.name });
    }

    return {
        player: {
            hp: state.player?.hp,
            maxHp: state.player?.maxHp,
            x: state.player?.x,
            z: state.player?.z,
        },
        inventory: inventory,
        nearbyNpcs: nearbyNpcs,
        nearbyLocs: nearbyLocs,
        shop: state.shop,
    };
}

// RUN
await runScript(async (ctx) => {
    const { bot, sdk } = ctx;

    let llmLogs = new Array(20);
    let llmNextTask: string | null = null;

    // TOOLS
    const chopTreeTool = tool({
        description:
            'Chop a tree and wait for the logs to enter the inventory given a nearby location.',
        inputSchema: z.object({
            name: z
                .string()
                .describe(
                    "A string with a regex pattern describing the name of a wanted nearby location, will be passed to `Regexp({}, 'i')`"
                ),
        }),
        outputSchema: z
            .object({
                success: z.boolean(),
                logs: InventoryItemSpec.or(z.null()),
                message: z.string(),
            })
            .describe('The result of attempting to chop a Tree.'),
        execute: async (nearbyloc) => {
            return await bot.chopTree(nearbyloc.name);
        },
    });

    const burnLogsTool = tool({
        description:
            'Burn logs present in inventory for XP. Requires a tinderbox in the inventory.',
        inputSchema: z.any().or(z.null()),
        outputSchema: z
            .object({
                success: z.boolean(),
                xpGained: z.number(),
                message: z.string(),
            })
            .describe('The result of attempting to burn logs.'),
        execute: async (anything) => {
            return await bot.burnLogs();
        },
    });

    const saveLogTool = tool({
        description:
            'Save a log, can be any useful information for future descisions. Max of 20 logs can be kept at a time, the underlying list of logs acts as a window.',
        inputSchema: z.object({
            logContent: z.string(),
        }),
        execute: async (log) => {
            if (llmLogs.length >= 20) {
                llmLogs.splice(0, 1);
            }
            llmLogs.push(log.logContent);
        },
    });

    const setNextTaskTool = tool({
        description: 'Set the expected next task to be performed.',
        inputSchema: z.object({ taskContent: z.string() }),
        execute: async (task) => {
            llmNextTask = task.taskContent;
        },
    });

    const walkToTool = tool({
        description:
            'Walk to a given coordinate, automatically opening any doors, should not be too far from the player position.',
        inputSchema: z.object({
            x: z.number(),
            y: z.number(),
            tolerance: z.number().or(z.null()),
        }),
        outputSchema: ActionResultSpec,
        execute: async (walk_input) => {
            return await bot.walkTo(
                walk_input.x,
                walk_input.y,
                walk_input.tolerance
            );
        },
    });

    const equipItemTool = tool({
        description: 'Equip a certain item from your inventory.',
        inputSchema: z.object({
            name: z
                .string()
                .describe(
                    "A string with a regex pattern describing the name of the wanted inventory item, will be passed to `Regexp({}, 'i')`"
                ),
        }),
        outputSchema: z
            .object({
                success: z.boolean(),
                message: z.string(),
            })
            .describe('The result of trying to equip an item.'),
        execute: async (equip_input) => {
            return await bot.equipItem(equip_input.name);
        },
    });

    const eatFoodTool = tool({
        description: 'Eat food from your inventory to regain hit points.',
        inputSchema: z.object({
            name: z
                .string()
                .describe(
                    "A string with a regex pattern describing the name of the wanted inventory item, will be passed to `Regexp({}, 'i')`"
                ),
        }),
        outputSchema: z
            .object({
                success: z.boolean(),
                message: z.string(),
            })
            .describe('The result of trying to eat an item.'),
        execute: async (eat_input) => {
            return await bot.eatFood(eat_input.name);
        },
    });

    const openShopTool = tool({
        description: 'Open the shop of a nearby NPC.',
        inputSchema: z.object({
            name: z
                .string()
                .describe(
                    "A string with a regex pattern describing the name of the wanted nearby npc, will be passed to `Regexp({}, 'i')`"
                ),
        }),
        outputSchema: ActionResultSpec,
        execute: async (nearby_npc) => {
            return await bot.openShop(nearby_npc.name);
        },
    });

    const closeShopTool = tool({
        description: 'Close the currently opened shop.',
        inputSchema: z.object({
            timeout: z.number().or(z.null()),
        }),
        outputSchema: ActionResultSpec,
        execute: async (timeout) => {
            return await bot.closeShop(timeout.timeout);
        },
    });

    const sellToShopTool = tool({
        description: 'Sell an item to the opened shop.',
        inputSchema: z.object({
            item: z
                .string()
                .describe(
                    "A string with a regex pattern describing the name of the item you want to sell, will be passed to `Regexp({}, 'i')`"
                ),
            amount: z.literal([1, 5, 10, 'all']),
        }),
        outputSchema: ShopInteractionSpec,
        execute: async (sell_spec) => {
            return await bot.sellToShop(sell_spec.item, sell_spec.amount);
        },
    });

    const buyFromShopTool = tool({
        description: 'Buy an item from the opened shop.',
        inputSchema: z.object({
            item: z
                .string()
                .describe(
                    "A string with a regex pattern describing the name of the item you want to buy, will be passed to `Regexp({}, 'i')`"
                ),
            amount: z.literal([1, 5, 10, 'all']),
        }),
        outputSchema: ShopInteractionSpec,
        execute: async (sell_spec) => {
            return await bot.sellToShop(sell_spec.item, sell_spec.amount);
        },
    });

    const dropItemTool = tool({
        description: 'drop an item from your inventory to the ground.',
        inputSchema: z.object({
            slot: z
                .number()
                .describe('The slot the item occupies in your inventory.'),
        }),
        outputSchema: ActionResultSpec,
        execute: async (slot) => {
            return await sdk.sendDropItem(slot.slot);
        },
    });

    await bot.skipTutorial();

    for (let i = 0; i < TOTAL_ITERATIONS; ++i) {
        let llmState = getLLMFriendlyState(sdk);

        let result = await generateText({
            model: llm,
            tools: {
                chopTree: chopTreeTool,
                burnLogs: burnLogsTool,
                walkTo: walkToTool,
                saveLog: saveLogTool,
                setNextTask: setNextTaskTool,
                equipItem: equipItemTool,
                eatFood: eatFoodTool,
                openShop: openShopTool,
                closeShop: closeShopTool,
                buyFromShop: buyFromShopTool,
                sellToShop: sellToShopTool,
                dropItem: dropItemTool,
            },
            system: '',
            prompt: '',
        });

        console.log(JSON.stringify(result, null, 4));

        await new Promise((r) =>
            setTimeout(r, TIMEOUT_PER_ITERATION_SECS * 1000)
        );
    }
});
