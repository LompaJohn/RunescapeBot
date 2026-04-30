# Lab Log: mining-trainer

Goal: Maximize Mining level in 5 minutes starting from a fresh character.

## Strategy

- Spawn directly at SE Varrock mine (pathfinding from Lumbridge failed)
- Bronze pickaxe only, Mining level 1
- Mine tin/copper rocks continuously (1750 XP each - server has 100x rates)
- Drop ore when inventory full (28 slots)

---

## Run 001 - 2026-01-24 (v1/v2 - pathfinding failed)

**Outcome**: timeout (no mining occurred)
**Duration**: 5 minutes

### What Happened
- Spawned at Lumbridge with TUTORIAL_COMPLETE preset
- Tried to walk to SE Varrock mine (160 tiles) - pathfinder failed
- Tried Lumbridge Swamp mine (70 tiles) - also failed
- Bot stuck at (3244, 3270), never found any rocks

### Root Cause
Pathfinder couldn't find paths to distant locations. Possible causes:
- Pathfinder search radius too limited (~100 tiles)
- Missing collision data in some areas
- Buildings/obstacles blocking direct paths

### Fix
v3: Spawn directly at the mine using custom saveConfig instead of walking there.

---

## Run 002 - 2026-01-24 23:53 (v3 - success!)

**Outcome**: success (ran full 5 minutes)
**Duration**: 5m 0s

### Results
| Metric | Start | End |
|--------|-------|-----|
| Mining Level | 1 | 44 |
| Mining XP | 0 | 57,750 |
| Ores Mined | 0 | ~33 |

### What Worked
- Spawning at mine bypassed pathfinding issues
- Rock detection worked (found "Rocks" at distance 1)
- Mining action worked (sendInteractLoc with "Mine" option)
- Dialog dismissal worked (level-up popups closed)
- Inventory management worked (dropped 27 ores when full)
- XP-based success detection worked reliably

### XP Rates
Server has 100x XP rates: 1750 XP per tin ore instead of 17.5

### Mining Speed Analysis
- 33 ores in 300 seconds = ~9 seconds per ore
- This includes:
  - Mining animation (~4-5 seconds)
  - Rock respawn wait
  - Movement to next rock
  - Occasional level-up dialogs

### Optimization Ideas
1. **Mine iron ore at level 15+** - Higher XP per ore (3500 XP at 100x)
2. **Power-mine closest rock** - Reduce movement time
3. **Better pickaxe** - Faster mining speed (if available)
4. **Prospect rocks** - Identify highest-value rocks nearby

---

## Run 003 - 2026-01-25 00:00 (v4 - regression)

**Outcome**: partial success (wandered from mine)
**Duration**: 5m 0s

### Results
| Metric | Start | End |
|--------|-------|-----|
| Mining Level | 1 | 36 |
| Mining XP | 0 | 26,250 |

### What Happened
- Bot drifted to (3245, 3270) - 40 tiles from mine!
- Random wandering logic accumulated over time
- Got stuck in cow/duck area with no rocks nearby

### Root Cause
The "wander to find rocks" logic when no rocks available sent the bot progressively further from the mine.

---

## Run 004 - 2026-01-25 00:06 (v5 - success!)

**Outcome**: success (ran full 5 minutes at mine)
**Duration**: 5m 0s

### Results
| Metric | Start | End |
|--------|-------|-----|
| Mining Level | 1 | 44 |
| Mining XP | 0 | 57,750 |
| Ores Mined | 0 | ~33 |

### What Worked
- Fixed drift by returning to mine center if >5 tiles away
- Waiting for rock respawn instead of wandering
- Bot stayed at (3284, 3365) throughout the run

---

## Script Evolution

| Version | Change | Result |
|---------|--------|--------|
| v1 | Walk from Lumbridge to SE Varrock | Failed (path not found) |
| v2 | Walk to Lumbridge Swamp mine | Failed (path not found) |
| v3 | Spawn at SE Varrock mine | Success! Level 44 |
| v4 | Prioritize closest rock + clean up | Regression: Level 36 (drifted away) |
| v5 | Fix drift with mine center reset | Success! Level 44 |

---

## Run 005 - 2026-01-25 03:49 (v8 - Al Kharid route)

**Outcome**: partial success (died to scorpions)
**Duration**: 5m 0s (timeout)

### What Happened
- Walked from Lumbridge → General Store → Toll Gate → Al Kharid mine
- Sold Bronze sword for 10gp toll
- Reached copper/tin area and started mining
- **Died to scorpions** (level 14 aggressive) - respawned in Lumbridge
- Spent rest of time walking back

### Results
| Metric | Start | End |
|--------|-------|-----|
| Mining Level | 1 | 21 |
| Mining XP | 0 | 5,250 |

### Learning
- Al Kharid mine has aggressive scorpions (level 14)
- Low-level characters die quickly without combat gear/food
- Need safer mine for level 1 characters

---

## Run 006 - 2026-01-25 03:57 (v9 - SE Varrock, honest walk)

**Outcome**: success (full 5 minutes mining)
**Duration**: 5m 0s

### Strategy
- Walk from Lumbridge to SE Varrock mine using waypoints
- No teleporting/spawning at mine (honest approach)
- Mine tin/copper rocks continuously

### Results
| Metric | Start | End |
|--------|-------|-----|
| Mining Level | 1 | 37 |
| Mining XP | 0 | 28,000 |
| Ores Mined | 0 | 16+ |

### What Worked
- Waypoint-based walking reached mine (~45s travel time)
- Prospecting identified rock types (tin, copper, etc.)
- Ore caching avoided re-prospecting same rock IDs
- No death (SE Varrock has no aggressive mobs)
- Inventory management (dropped 11 ores when full)

### Comparison: Honest vs Spawn-at-Mine
| Approach | Final Level | XP | Notes |
|----------|-------------|-----|-------|
| Spawn at mine | 44 | 57,750 | "Cheating" - instant start |
| Honest walk | 37 | 28,000 | ~45s travel time |

---

## Script Evolution (Full)

| Version | Change | Result |
|---------|--------|--------|
| v1-v2 | Walk from Lumbridge | Failed (path not found) |
| v3-v5 | Spawn at SE Varrock mine | Success: Level 44 |
| v6-v7 | Waypoint navigation (south) | Failed (blocked paths) |
| v8 | Al Kharid via toll gate | Died to scorpions: Level 21 |
| v9 | SE Varrock via waypoints | Success: Level 37 (honest!) |

## Final Summary

**Best Honest Result**: Mining Level 37 (28,000 XP) in 5 minutes
**Best Overall Result**: Mining Level 44 (57,750 XP) when spawning at mine

### Key Learnings
1. Server pathfinder has ~100 tile search radius - use waypoints for long distances
2. Some routes blocked (Lumbridge south) - needed to go north
3. Al Kharid mine has aggressive scorpions - dangerous for low levels
4. Prospecting identifies ore types - essential for finding copper/tin
5. Ore ID caching prevents re-prospecting same rock types
