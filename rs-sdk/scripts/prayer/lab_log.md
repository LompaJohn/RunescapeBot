# Lab Log: prayer

## Goal
Train Prayer from level 1 to level 10+ by killing chickens near Lumbridge and burying their bones.

## Strategy
1. Spawn fresh character in Lumbridge with TestPresets.LUMBRIDGE_SPAWN
2. Equip bronze sword and wooden shield for faster kills
3. Walk to chicken coop east of Lumbridge castle (~3237, 3295)
4. Enter through the gate
5. Kill chickens → pick up bones → bury bones → repeat
6. Continue until Prayer level 10

## XP Math
- Prayer XP per bone: 4.5 XP
- XP needed for level 10: 1,154 XP
- Bones needed: ~257 bones

---

## Run 001 - Initial test

**Outcome**: stall
**Duration**: ~3min (external timeout)

### Observations
- Script walked to chicken coop successfully
- Hit "I can't reach that!" error - fence blocks access

### Root Cause
Chicken coop is fenced. Need to open the gate to enter.

### Fix
Added gate opening logic:
1. Walk to entrance coordinates (3237, 3295)
2. Call `ctx.bot.openDoor(/gate/i)`
3. Walk inside to (3232, 3295)

---

## Run 002 - With gate fix

**Outcome**: partial success (level 7, 675 XP)
**Duration**: ~3min (external timeout)

### Observations
- Gate opening worked
- Entered coop successfully
- Bones collected and buried
- Reached level 7 before external timeout

### What Worked
- Gate entry
- Combat with chickens
- Bone pickup
- Bone burying

---

## Run 003 - Dialog issue

**Outcome**: stall
**Duration**: ~3min (external timeout)

### Observations
- Collected bones (4+)
- Prayer stayed at 0 XP
- Dialog was open at exit
- Bones not being buried

### Root Cause
Level-up or other dialog blocking bury action. Dialog handling not aggressive enough.

### Fix
1. Added `dismissDialog()` helper function
2. Enhanced dialog dismissal in main loop (multiple clicks)
3. Added dialog checks in `buryAllBones()`

---

## Run 004 - Better dialog handling

**Outcome**: stall
**Duration**: ~2min (external timeout)

### Observations
- 20 items in inventory
- 4 bones collected
- Prayer still 0 XP
- Bones not being buried

### Root Cause
Burying threshold too high. Condition was `bonesInInv.length >= 5 || inventory.length >= 25`.
With 20 items and 4 bones, neither condition met.

### Fix
Changed to bury immediately when bones >= 1:
```typescript
if (bonesInInv.length >= 1) {
    await buryAllBones(ctx, stats);
}
```

---

## Run 005 - SUCCESS!

**Outcome**: success
**Duration**: ~2-3min

### What Happened
- Equipped sword and shield
- Walked to chicken coop entrance
- Opened gate
- Entered coop
- Killed chickens, picked up bones, buried bones
- Reached Prayer level 10 with 1350 XP

### What Worked
- Immediate bone burying (don't accumulate)
- Gate handling
- Dialog dismissal
- Combat flow

---

## Learnings

### 1. Strategic Findings
- **Bury immediately**: Don't wait to accumulate bones. Burying one at a time is just as efficient as batching, and prevents dialog/state issues.
- **Chickens are ideal**: Level 1 NPCs die very fast, drop bones every kill, and chicken coop is nearby.
- **Gate navigation**: Lumbridge chicken coop requires opening a gate to enter.

### 2. Process & Tooling Reflections
- External timeouts can be misleading - "Bot not connected" errors were from shell timeout, not script issues.
- The `[delta]` logs are very helpful for seeing what changed.
- Running with shorter timeouts initially (2-3 min) is good for quick iteration.

### 3. SDK Issues & Gaps
- None encountered - the SDK handled everything well.
- `bot.openDoor()` worked perfectly for the gate.
- `sdk.sendUseItem()` for burying bones worked as expected.
