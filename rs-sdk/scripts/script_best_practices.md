# Script Best Practices

Lessons learned from developing automation scripts. Reference this when writing new scripts to avoid common pitfalls.

## Dialogs & UI Blocking

### Level-Up Dialogs
When a player gains enough XP to level up, a congratulations dialog appears that **blocks all actions**. Your script must handle this:

```typescript
// Check for and dismiss dialogs in your main loop
if (currentState.dialog.isOpen) {
    ctx.log('Dismissing dialog...');
    await ctx.sdk.sendClickDialog(0);
    continue;
}
```

All BotActions methods automatically dismiss blocking UI (level-up dialogs, etc.). Manual dismissal is only needed when using low-level sdk methods directly:
```typescript
await ctx.bot.dismissBlockingUI();
```

### Other Blocking Dialogs
- Welcome messages on login
- NPC conversation dialogs
- Shop interfaces
- Bank interfaces
## State & Activity Detection

### Animation State
The SDK exposes animation IDs for both player and NPCs:

```typescript
// Player animation (-1 = idle/none)
state.player?.animId      // Current animation sequence ID
state.player?.spotanimId  // Spot animation (spell effects, combat hits, etc.)

// NPC animation
const npc = state.nearbyNpcs[0];
npc.animId      // -1 = idle
npc.spotanimId  // -1 = none
```

**Common animation checks:**
```typescript
// Check if player is doing something (not idle)
const isActive = state.player?.animId !== -1;

// Check if player is idle
const isIdle = state.player?.animId === -1;
```

Note: Animation IDs are raw sequence IDs from the game. -1 always means idle/none.

### Other Ways to Detect Player Activity
Animation state is useful, but you can also detect activity through:
- **XP changes** - check if skill XP increased
- **Inventory changes** - check if items appeared/disappeared
- **Game messages** - check `state.gameMessages` for "You catch...", "You mine...", etc.
- **Just keep clicking** - the game queues actions, so continuous clicking often works best


## Inventory Management

### Drop Items to Make Space
For gathering skills, drop items when inventory fills:

```typescript
if (currentState.inventory.length > 20) {
    for (const item of itemsToDrop) {
        await ctx.sdk.sendDropItem(item.slot);
        await new Promise(r => setTimeout(r, 100));
    }
}
```
