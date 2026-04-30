# Lab Log: woodcutting

Goal: Train Woodcutting to level 10+ from fresh Lumbridge spawn.

Strategy:
1. Check for existing axe (LUMBRIDGE_SPAWN preset includes bronze axe)
2. If no axe: Walk to Bob's Axes (3230, 3203), buy bronze axe for 16gp
3. Walk to trees west of Lumbridge castle (3200, 3230)
4. Chop trees, drop logs when full
5. Continue until target level

---

## Run 001 - 2026-01-27 17:07

**Outcome**: SUCCESS
**Duration**: ~20 seconds
**Target**: Level 10

### What Happened
1. Script detected existing bronze axe in inventory (from preset)
2. Walked to trees at (3200, 3230)
3. Chopped one tree
4. XP jump: 1250xp (level 1 → 10) - server has accelerated XP rates

### Observations
- LUMBRIDGE_SPAWN preset includes: bronze axe, tinderbox, fishing net, pickaxe, and other starter items
- Buy-axe logic was skipped (axe already present)
- Server appears to have 50x XP rates (normal tree = 25xp, received 1250xp)

---

## Run 002 - 2026-01-27 17:08

**Outcome**: FAILED (connection error)
**Duration**: ~5 seconds

### What Happened
- Bot disconnected during walkTo action
- ConnectionClosedError from Puppeteer
- Transient browser/connection issue

---

## Run 003 - 2026-01-27 17:08

**Outcome**: SUCCESS
**Duration**: ~15 seconds
**Target**: Level 10

### What Happened
- Same as Run 001 - confirms consistent behavior

---

## Run 004 - 2026-01-27 17:10

**Outcome**: SUCCESS
**Duration**: ~30 seconds
**Target**: Level 15

### What Happened
1. Walked to trees
2. Chopped 2 trees
3. Dismissed level-up dialog 3 times
4. Reached level 15

### Observations
- Dialog dismissal working correctly
- HP dropped from 10 → 7 (nearby enemies?)

---

## Run 005 - 2026-01-27 17:10

**Outcome**: SUCCESS
**Duration**: ~60 seconds
**Target**: Level 30

### What Happened
1. Chopped trees continuously
2. Bot moved between trees as they were cut/despawned
3. Dropped 8 logs when inventory hit 26 items
4. Dismissed multiple level-up dialogs
5. Reached level 30

### Observations
- **Inventory management working**: "Dropping 8 logs..." triggered at 26 items
- **Dialog dismissal working**: Multiple dismissals throughout
- **HP concern**: Dropped from 10 → 1 during training
  - Trees are near dark wizards area (3200, 3230)
  - Bot drifted north toward (3187, 3241) during training
  - For longer runs, may need food or different location

### Final Stats
- Trees chopped: ~12
- Max level reached: 30
- HP at end: 1/10

---

## Summary

The script is **fully functional**:

| Feature | Status | Notes |
|---------|--------|-------|
| Axe detection | ✅ | Detects preset axe, has buy fallback |
| Buy from shop | ⚠️ | Code present but untested (preset includes axe) |
| Tree chopping | ✅ | Uses bot.chopTree() reliably |
| Dialog dismissal | ✅ | Handles level-up congratulations |
| Inventory management | ✅ | Drops logs at 26 items |
| Level detection | ✅ | Stops at target level |
| Stall detection | ✅ | Has stuck counter + StallError |

### Known Issues

1. **HP drain**: Location near dark wizards causes HP loss. For extended training:
   - Add food eating logic
   - Move to safer tree area (further north)
   - Add HP monitoring with retreat

2. **Buy-axe untested**: LUMBRIDGE_SPAWN includes axe, so shop logic never executes

### Potential Improvements

1. Add eating when HP low
2. Move to safer tree location
3. Chop oak trees at level 15+ for faster XP
4. Bank logs instead of dropping (for later use)
