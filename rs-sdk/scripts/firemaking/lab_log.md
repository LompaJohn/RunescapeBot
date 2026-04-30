# Lab Log: firemaking

Training Firemaking from level 1 to level 10+ starting from Lumbridge.

## Strategy

1. Use LUMBRIDGE_SPAWN preset (includes tinderbox + bronze axe)
2. Chop trees near Lumbridge castle to get logs
3. Burn logs with tinderbox
4. Repeat until Firemaking level 10

## Run Log

---

## Run 001 - 2026-01-27 17:06

**Outcome**: SUCCESS
**Duration**: 122s

### What Happened
- Script started at Lumbridge (3222, 3218)
- Chopped 5 logs from trees near Lumbridge castle
- Woodcutting leveled from 1 to 22 (XP is very fast!)
- Burned just 1 log
- Firemaking jumped from level 1 to level 13 with 2000 XP from a single log

### Observations
- XP rates are very generous - skills level extremely fast
- Only needed to burn 1 log to exceed level 10 target
- `bot.chopTree()` and `bot.burnLogs()` worked reliably
- Level-up dialogs were handled automatically by `dismissDialogs()` helper

### What Worked
- LUMBRIDGE_SPAWN preset includes tinderbox + bronze axe (perfect for this task)
- Trees near spawn are easily accessible
- The BotActions methods handle the mechanics well

---

## Learnings

### 1. Strategic Findings
- XP rates in this server are very fast - single actions give substantial XP
- For firemaking training, the bottleneck is chopping logs (takes longer than burning)
- Burning logs is instant (one `burnLogs()` call completes quickly)
- Trees respawn quickly near Lumbridge

### 2. Process & Tooling Reflections
- The sdk/runner framework works well out of the box
- Final state output is helpful for understanding what happened
- Bot actions like `chopTree()` and `burnLogs()` abstract away complexity nicely

### 3. SDK Issues & Gaps
- None encountered - the SDK worked as expected for this simple task
