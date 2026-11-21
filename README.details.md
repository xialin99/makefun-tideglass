# TIDEGLASS

Bellwether Observatory recorded the night the tide gate opened. Recover the tide log and signed gate order, then take both to the skiff. The extraction unlocks the turbine hall, where a gate relay readout identifies the override crew before the next tide.

Run `node serve.ts` and open http://localhost:8080 in desktop Chrome. Move with WASD or the arrow keys, hold Shift for quiet movement, and press E at an instrument, control, or exit. Click to toss a steel washer at the cursor, or press Q to toss in your direction of travel. M toggles sound and R restarts the current mission. Use 1 and 2 or the mission buttons to switch between unlocked missions. Unlocks and clears persist in the browser.

The west arcade leads to the first recording. The exposed upper gallery connects the two instruments, while the meridian walk offers shorter cuts between patrols. On the way out, the service catwalk goes below the central seawall. Amber marks routine vision, pink marks suspicion, and rings show sound. Watches investigate the last location they detected and return to patrol after searching.

In the turbine hall, E at the light relay dims the marked section for 14 seconds once per attempt. Guards inside the marked area have shorter cones, but the relay makes a noise that nearby guards can investigate. Use that window to cross between the turbines, or take the longer catwalk and time the east patrol with the lights on.

## Iterations

1. Built the observatory around the recording platforms, central lens, and tide gate. Collision, guard sight, and cone rendering share the same cover bounds. Klei’s postmortem informed the decision to make guard state and sound visible during play. [Mark of the Ninja postmortem](https://www.gamedeveloper.com/design/classic-postmortem-klei-entertainment-s-i-mark-of-the-ninja-i-)
2. The first headless run recovered the tide log and lured a guard, then failed on the upper crossing. A second run still failed with a faster crossing. Moved patrol turning points deeper into the hall and gave crouching more time to break sight. Retained the exposed crossing and a quieter return through the catwalk.
3. Increased label clarity, added instrument scales and water reflections, and moved the skiff label clear of the player marker. The final headless run captured the opening, a live investigation, the unlocked exit, and the mission conclusion.
4. Compared the public previews of Mothlight and Moonlit Vault. Mothlight makes suspicion explicit and Moonlit Vault advertises multiple heists. The second edition adds a visually distinct mission and makes its route tradeoff visible through the zone outline, altered cones, sound pulse, and countdown. [Public leaderboard](https://make.fun/api/competitions/best-stealth-game-20261121-1759/leaderboard)
5. The lit bypass initially left the player exposed on the upper turn. Added a baffle to give the bypass a recovery point while retaining an exposed approach. The relay route crosses the turbines under shortened cones, while the bypass route uses the bottom catwalk and the east baffle.

## Local verification

`node verify-play.mjs` plays both missions with real keyboard and mouse input on a disposable headless Chrome profile and regenerates the four gameplay JPEGs. Set `TIDEGLASS_CHROME` if Chrome is installed elsewhere. The run checks investigation and recovery, extraction with and without the relay, persisted progress, cone clipping and range, detection, restart, mute, the 768 × 480 layout, browser errors, and local-only page requests. The four committed captures are 1152 × 720 and below 256 KiB each.

Run `main.ts` with `MAKEFUN_OUTPUT_DIR` pointing to a fresh directory to generate the contest package. Two independent output directories produced byte-identical dossiers that also matched an independent rebuild with the kit vendor. The vendor matches the starter byte for byte.
