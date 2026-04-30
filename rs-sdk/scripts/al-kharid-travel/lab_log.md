# Lab Log: al-kharid-travel

Goal: Reach Al Kharid as fast as possible from Lumbridge (starting with 0gp).

## Key Finding

**There is NO free route** - the toll gate is the only entrance to Al Kharid. You must pay 10gp.

## Final Solution

**Time: ~33-41 seconds** (from 0gp start)

1. Walk to Lumbridge general store
2. Sell bronze sword (gives exactly 10gp)
3. Walk to toll gate
4. Pay toll and pass through

---

## Phase 1: Toll Route Only (with 10gp)

### Run 001-010
- Tested toll gate mechanics
- Found that `openDoor()` doesn't work for toll gates
- Need direct `sendInteractLoc` + dialog handling
- After paying, need retry loop for walking through
- **Result: ~17-18s** with 10gp start

---

## Phase 2: Long Route Testing

### Run 011-017
- Tested going around the toll gate
- All routes blocked by fences/walls
- Confirmed: Al Kharid is fully enclosed, toll is mandatory

---

## Phase 3: Coin Sourcing

### Run 018 - Selling Items
- Used `bot.openShop()` and `bot.sellToShop()`
- Bronze sword sells for 10gp (exactly what we need!)
- **Result: 32-41s** from 0gp start

### Breakdown
| Step | Time |
|------|------|
| Walk to shop | ~8s |
| Open shop + sell sword | ~7s |
| Walk to gate | ~8s |
| Pay toll + walk through | ~10s |
| **Total** | **~33s** |

---

## Learnings

### 1. Strategic Findings
- **No free route** - toll gate is the only entrance
- Bronze sword sells for exactly 10gp at general store
- Selling is faster than combat for sourcing coins
- Gate requires: click → dialog → pay → retry walk

### 2. Process & Tooling Reflections
- `bot.openShop()` and `bot.sellToShop()` work well
- Shop sells are instant, combat takes 4-5s per kill
- Dialog handling needs click-through for "continue" prompts

### 3. SDK Issues & Gaps
- `openDoor()` doesn't work for toll-style gates
- `walkTo` can fail on recently-opened gates (needs retry)
