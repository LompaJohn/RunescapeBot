# Lab Log: magic

Magic training script using combat spells on NPCs.

## Goal
Train Magic to level 10+ from a fresh Lumbridge spawn using Wind Strike on chickens.

## Starting Conditions (LUMBRIDGE_SPAWN preset)
- Air rune x25
- Mind rune x15
- Water rune x6
- Earth rune x4
- Body rune x2

## XP Analysis
- Wind Strike = 1 Air + 1 Mind = 5.5 XP per cast
- 15 Mind runes = max 15 Wind Strikes = 82.5 XP max
- Level 10 requires 1,154 XP = ~210 Wind Strikes
- With 15 runes, can only reach ~level 2-3

**Limitation**: The preset doesn't provide enough runes to reach level 10 with magic alone.

---

## Run 001 - Initial Test

**Outcome**: SUCCESS
**Duration**: 32.1s
**Final Level**: 11 (from 1)

### What Happened
- Script walked to chicken coop successfully
- Cast Wind Strike 3 times
- Each hit gave 475 XP (not 5.5 XP - server has boosted rates)
- Hit level 11 with only 3 runes used
- Dialog handling worked correctly (dismissed level-up dialogs)

### Key Discovery
**Server XP rates are ~86x normal** - Wind Strike gives 475 XP per hit instead of 5.5 XP.
This completely changes the calculation:
- 15 Mind runes = 15 casts = 7,125 XP potential (if all hit)
- Can easily reach level 10+ with starting runes

### What Worked Well
1. `sendSpellOnNpc()` worked correctly
2. Dialog dismissal handled level-up popups
3. Target selection found chickens
4. Progress tracking was accurate

### Remaining runes
Air=22, Mind=12, Water=6, Earth=4 (12 runes left = plenty for future use)

---

## Run 002 - Verification Run

**Outcome**: SUCCESS
**Duration**: 105.2s
**Final Level**: 11 (from 1)

### What Happened
- Script worked reliably on fresh browser start
- Cast 31 times, hit 4 times (87% splash rate at low levels)
- XP per hit varied: 275, 375, 375, 475 XP
- Still reached level 11 despite high splash rate

### Observations
1. XP per hit scales with damage dealt (not fixed)
2. Splash rate is high at level 1 (expected - low magic accuracy)
3. Even with many splashes, goal achieved comfortably
4. Rune usage: 4 successful hits used 4 of each rune (21 air, 11 mind remaining)

### Browser Note
Had to kill stuck browser between runs - shared browser mode can get stuck sometimes.

---

## Learnings

### 1. Strategic Findings
- **XP rates are boosted** - ~50-100x normal rates on this server
- **Splash rate is high at low levels** - expected, but hits still give enough XP
- **Chickens are ideal targets** - easy to find, don't fight back hard, weak
- **Dialog handling is essential** - level-up dialogs block all actions

### 2. Process & Tooling Reflections
- Script-runner infrastructure worked well for logging
- Dialog dismissal loop is critical for combat magic training
- `sendSpellOnNpc()` API is straightforward and reliable

### 3. SDK Issues & Gaps
- None encountered - the magic combat API works correctly
- `sendSpellOnNpc(npcIndex, spellComponent)` is intuitive
- Spell constants should be documented somewhere (currently in save-generator.ts)

---

## Run 003 - Gate Fix

**Outcome**: ISSUE IDENTIFIED
**Issue**: "I can't reach that" errors - chicken coop gate was closed

### Root Cause
The chicken coop at Lumbridge has a gate that can be closed. When closed, the player can't cast spells on chickens inside due to line-of-sight blocking (fence).

### Fix Applied
1. Open the gate after walking to the chicken coop using `bot.openDoor(/gate/i)`
2. Walk inside the coop after opening
3. Handle "can't reach" errors by trying to open the gate again

```typescript
// Open the gate to get inside the coop
ctx.log('Opening gate...');
const gateResult = await ctx.bot.openDoor(/gate/i);
if (gateResult.success) {
    await ctx.bot.walkTo(CHICKEN_COOP.x - 3, CHICKEN_COOP.z);
}
```

---

## Run 004 - Verification After Fix

**Outcome**: SUCCESS
**Duration**: 39.6s
**Final Level**: 10 (from 1)

### What Worked
- Gate opened successfully: `Gate opened: Opened Gate`
- Casting from inside coop at dist=1
- 5 casts, 3 hits (2 splashes at low level is normal)
- No "can't reach" errors

### Key Learning
- **Gates/fences block line-of-sight for magic** - must be inside the area
- `bot.openDoor(/gate/i)` handles gates as well as doors
- Always consider obstacles when casting spells on NPCs in enclosed areas

---

## Run 005 - New `castSpellOnNpc` API

**Outcome**: SUCCESS
**Duration**: 110.2s
**Final Level**: 10 (from 1)

### What Changed
Added high-level `bot.castSpellOnNpc()` method to bot-actions.ts that:
1. Sends the spell
2. Waits for result (XP gain = hit, error message = blocked, timeout = splash)
3. Returns structured result with `hit`, `xpGained`, `reason`

```typescript
const result = await ctx.bot.castSpellOnNpc(target, spell.spell);
if (result.success) {
    if (result.hit) {
        ctx.log(`HIT! ${result.message}`);  // "Hit Chicken for 275 Magic XP"
    }
} else if (result.reason === 'out_of_reach') {
    // Try opening gate
}
```

### Benefits
- **Structured error handling** - `reason: 'out_of_reach' | 'no_runes' | 'npc_not_found'`
- **Hit/splash detection** - via XP gain, not just message parsing
- **Cleaner script code** - no manual game message parsing needed
- **Consistent with other bot methods** - follows `attackNpc` pattern

### Results
- 23 casts, 3 hits (20 splashes - normal at low magic level)
- Goal reached successfully
- Gate handling ready if needed
