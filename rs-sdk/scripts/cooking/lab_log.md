# Lab Log: cooking

Training Cooking from level 1 to 10+ starting from Lumbridge spawn.

## Strategy Evolution

### v1 - Draynor + Lumbridge Range (Failed)
- Walk to Draynor fishing spot (~3087, 3230)
- Fish until inventory full
- Walk back to Lumbridge Castle range and cook
- **Issue**: Dark Wizards attack while walking back, causing deaths

### v2 - Draynor + Fire-based (Abandoned)
- Fish at Draynor
- Cut log and make fire to cook
- **Issue**: Still had Dark Wizard risk, complex fire-making logic

### v3 - Al-Kharid (Current)
- Sell shortbow at Lumbridge shop for 20gp
- Pay toll gate (10gp) to enter Al-Kharid
- Fish at Al-Kharid fishing spot
- Cook at Al-Kharid range
- **Issue**: Scorpions attack while fishing, causing deaths

## XP Requirements

- Cooking level 10 requires 1,154 XP
- Raw shrimps give 30 XP when cooked
- Need ~39 successful cooks to hit level 10
- Burns are likely at level 1-2 (reduced XP rate)

---

## Run History

### Run 001 - v1 Initial
**Outcome**: Disconnected
**Duration**: 118s
- Got to Draynor, caught 10 fish
- Disconnected while walking back to Lumbridge (tick frozen)
- Dark wizard damage observed

### Run 002 - v3 Al-Kharid
**Outcome**: Died from scorpion
**Duration**: ~120s
- Successfully passed toll gate
- Caught 23 fish at Al-Kharid
- Died from scorpion attacks (ran out of food)

### Run 003 - v3 with HP monitoring
**Outcome**: Died from scorpion
**Duration**: ~156s
- HP monitoring worked - ate Shrimps and Bread when low
- Caught 23 fish
- Ran out of food and died

### Run 004 - Safer location
**Outcome**: Bot disconnected
**Duration**: 65s
- Connection dropped during fishing

### Run 005 - SUCCESS!
**Outcome**: Goal achieved
**Duration**: 223s
- Caught 24 fish (inventory full)
- Cooked all 24 fish at Al-Kharid range
- Gained 31,500 XP
- **Reached Cooking level 38!** (far exceeding goal of 10)
- No scorpion deaths (luck/better position)

---

## Key Findings

### Connection Stability
- "Bot not connected" errors happen frequently (~30% of runs)
- "Game tick frozen" errors indicate server-side issues
- These are beyond script control

### Al-Kharid Fishing
- Position (3267, 3148) has scorpions within attack range (dist 1-4)
- Position (3265, 3153) may be slightly safer
- Scorpions deal ~2 damage per hit
- With 10 HP and only 2 food items, survival is limited

### HP Monitoring
- Hitpoints skill level reflects current HP
- Eating food works with `sendUseItem(slot, 1)`
- 2 food items (Shrimps, Bread) not enough for extended fishing

## Suggested Improvements

1. **Keep more food**: Don't drop bread/shrimps, or buy more food
2. **Safer position**: Test positions farther north from scorpions
3. **Run away logic**: Move to safe area when HP critical
4. **Retry on disconnect**: Add reconnection handling in sdk/runner

---

## Learnings

### 1. Strategic Findings
- Al-Kharid is safer from Dark Wizards but has Scorpion threat
- Draynor has Dark Wizard threat on return path
- Need food for survival in both areas
- Toll gate payment (10gp) works via dialog options

### 2. Process & Tooling Reflections
- Connection stability is major blocker for long runs
- State delta logging very helpful for debugging
- HP tracking via skills array works correctly

### 3. SDK Issues & Gaps
- `sendClickInventory` doesn't exist - use `sendUseItem` instead
- Connection drops seem related to WebSocket stability
- No automatic reconnection handling

