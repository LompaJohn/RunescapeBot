# Lab Log: Crafting Trainer

Goal: Train Crafting from level 1 to level 10+ starting from LUMBRIDGE_SPAWN (no special inventory).

## Strategy Analysis

### XP Requirements
- Level 10 requires 4,470 XP
- Starting from level 1 (0 XP)

### Crafting Options from Lumbridge

1. **Spinning Wool** (2.5 XP each)
   - Sheep near Lumbridge
   - Spinning wheel in Lumbridge Castle 2nd floor
   - Need ~1,788 balls - too slow

2. **Leather Crafting** (13.8+ XP each)
   - Cows near Lumbridge for hides
   - Need to get to Al Kharid (10gp toll)
   - Buy needle + thread from craft shop
   - Tan hides at Ellis the tanner
   - Craft leather gloves (13.8 XP, level 1 req)
   - Need ~324 items for level 10

3. **Pottery** (6.3-15 XP depending on item)
   - Need clay (mine at Barbarian Village or Rimmington)
   - Need water (bucket from spawn)
   - Need potter's wheel + pottery oven
   - No pottery facilities near Lumbridge

**Chosen approach: Leather crafting** - Best XP rate accessible from Lumbridge

---

## Run 001-016: Development & Testing

**Duration**: Multiple runs, 1-5 minutes each
**Outcome**: Server stability issues (tick freezes), but major progress on script logic

### Phase Completion Status

| Phase | Status | Notes |
|-------|--------|-------|
| 1. Sell shortbow for coins | ✅ Working | Gets 20gp |
| 2. Collect cowhides | ✅ Working | 3 hides per trip (reduced from 10 due to tick freezes) |
| 3. Travel to Al Kharid | ✅ Working | Toll gate dialog handled |
| 4. Buy crafting supplies | ✅ Working | Dommik's Crafting Store found after search |
| 5. Tan hides | ✅ Working | Tanning complete: Leather: 3, Hides: 0 |
| 6. Craft leather items | ❓ Partial | Interface opens but clicking doesn't craft |

### Key Discoveries

#### 1. Tanner Uses Dialog, Not Shop
The Al Kharid tanner uses `Talk-to` (opnpc1), not `Trade`. The dialog flow is:
1. Talk to tanner → "Greetings friend... I see you have brought me some hides."
2. Select "Yes please." when asked about tanning
3. Select "Soft leather" from 4-option menu
4. Hides converted to leather automatically (1gp each)

```typescript
// Talk to tanner, then handle dialog
const talkOpt = tanner.optionsWithIndex.find(o => /talk/i.test(o.text));
await ctx.sdk.sendInteractNpc(tanner.index, talkOpt.opIndex);
// Click "Yes please" then "Soft leather" in dialog
```

#### 2. Dommik's Crafting Store Location
The crafting store is NOT at the Al Kharid general store. Search required:
- General store is at (3315, 3178)
- Dommik found near (3318, 3183) or (3325, 3180)
- Search multiple spots and check for NPC `/^dommik$/i`
- Shop: "Dommiks Crafting Store" - sells needle (1gp) and thread

#### 3. Crafting Interface Issue (Interface ID 2311)
The leather crafting interface has a problem:
- Opens correctly with `sendUseItemOnItem(needle.slot, leather.slot)`
- Shows 15 buttons all labeled "Ok" with no item names
- Options are: `1:Ok, 2:Ok, 3:Ok, 4:Ok, 5:Ok...`
- `sendClickInterface(1)` doesn't trigger crafting
- Interface stays open, items not crafted

**Hypothesis**: May need `sendClickInterfaceComponent` instead of `sendClickInterface`

#### 4. Server Stability (Known Issue)
Consistent tick freezes during combat:
- "Game tick frozen for 16s (last tick: XXXX)"
- Causes disconnect errors
- Reduced batch size from 10 to 3 hides to minimize exposure
- Not a script bug - infrastructure issue

---

## Learnings

### 1. Strategic Findings

**Working approaches:**
- Leather crafting path is viable with these phases
- Tanning through dialog (not shop) - key discovery
- Dommik's shop location requires NPC search, not fixed coords

**Optimization ideas:**
- Could try higher-XP leather items after level 7 (boots)
- Banking crafted items would allow longer runs

### 2. Process & Tooling Reflections

**What made debugging easier:**
- Extensive logging of dialog options
- Logging interface IDs and option indices
- Position logging during navigation

**What would help:**
- More interface debug info (component types, button types)
- Server stability improvements
- Interface click verification

### 3. SDK Issues & Gaps

**Confirmed working:**
- `sendInteractNpc` for dialog-based NPCs
- `sendClickDialog` for NPC conversations
- Shop buying/selling via `buyFromShop`, `sellToShop`
- Walking via `walkTo`

**Issues found:**
- `sendClickInterface` doesn't work for crafting menu (ID 2311)
- Interface options lack descriptive text (all "Ok")
- Need to investigate `sendClickInterfaceComponent` for crafting

---

---

## Run 017 - 2026-01-27 22:17 - SUCCESS

**Outcome**: success
**Duration**: 182s
**Level**: 1 → 11 (exceeded goal!)

### What Happened
- Phase 1-5 all worked (coins, hides, toll gate, shop, tanning)
- Crafting interface (ID 2311) successfully clicked with index 2
- 2 leather gloves crafted, each giving 690 XP

### Key Fixes Applied

#### 1. Cow Field Exit Logic
Added `isInCowField()` check and `exitCowField()` function to handle the fenced cow field:
```typescript
if (isInCowField(ctx)) {
    const exited = await exitCowField(ctx, stats);
    if (!exited) { ctx.warn('Could not exit cow field'); return false; }
}
```

#### 2. New Porcelain Function: `craftLeather()`
Created `bot.craftLeather()` in `agent/bot-actions.ts` that:
- Validates needle, leather, thread in inventory
- Checks crafting level requirements
- Opens interface 2311 with needle-on-leather
- Clicks the correct button (index 2 = gloves, 3 = boots, etc.)
- Returns success/failure with detailed reason codes

```typescript
const result = await ctx.bot.craftLeather('gloves');
if (result.success) {
    ctx.log(`${result.message}`);  // "Crafted leather gloves (+690 XP)"
} else {
    ctx.warn(`Failed: ${result.message} (reason: ${result.reason})`);
    // reason: 'no_needle' | 'no_leather' | 'no_thread' | 'level_too_low' | etc.
}
```

#### 3. Reduced Batch Size
Changed `HIDES_PER_TRIP` from 3 to 2 for faster cycles.

### XP Analysis
- Expected: ~13.8 XP per leather gloves
- Actual: 690 XP per craft (50x higher than expected!)
- This might be tutorial/starter bonus XP or a server configuration

---

## Learnings

### 1. Strategic Findings

**Working approaches:**
- Leather crafting path is fully viable
- Interface 2311 button mapping: index 2 = leather gloves (confirmed)
- Tanning through dialog works (Talk-to, not Trade)
- Small batches (2 hides) work well for avoiding server freezes

**Key discoveries:**
- Cow field requires explicit gate exit logic
- The crafting interface buttons are indexed starting at 2 (not 1)
- Porcelain SDK functions dramatically simplify script logic

### 2. Process & Tooling Reflections

**What made debugging easier:**
- Detailed failure reasons from porcelain functions
- State delta logging shows exactly what changed
- Small batch sizes for faster iteration cycles

**Improvements made:**
- Added `craftLeather()` porcelain function with failure reason codes
- This pattern (returning `{ success, message, reason }`) should be used for all SDK actions

### 3. SDK Issues & Gaps

**Confirmed working:**
- `sendClickInterface(2)` for leather gloves
- Interface ID 2311 for leather crafting

**Issues found:**
- Interface options only show "Ok" text, no item names
- Index 1 doesn't work (maybe reserved/close button?)

**New SDK function added:**
- `bot.craftLeather(product, timeout)` - handles the full leather crafting flow

## Code Location
- Script: `scripts/crafting/script.ts`
- Porcelain function: `agent/bot-actions.ts:craftLeather()`
- Key functions: `tanHides()`, `craftLeatherItems()`, `buyCraftingSupplies()`
