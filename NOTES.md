After each save point, push it to GitHub.
The AI key comes from getKey().
OpenAI model: gpt-5.6-luna

## E-RideSafe Version 1

- Expo SDK: 58 (keep this version while the phone uses Expo Go SDK 58).
- App: `expo-app/` with Home, hotspot map, rules/traffic/emergency, and Ask AI screens.
- Nearby alerts request location and notification permissions, include a demo alert, and clearly say warnings are not guarantees.
- The AI request is in `server/ai-helper.js`; it reads `BRIEF.md` as system instructions, gets the key only through `getKey()`, and keeps the key on this computer.
- The phone helper address is currently `http://192.168.0.211:8787`; the phone and computer must be on the same Wi-Fi.

## How to run

1. In the project folder, run `node server/ai-helper.js`.
2. In a second terminal, run `cd expo-app` and then `npx expo start`.
3. Scan the Expo QR code with Expo Go. If using a tunnel, the phone may not reach the local AI helper; use LAN mode on the same Wi-Fi and keep `HELPER_URL` in `expo-app/App.js` pointed at the computer’s Wi-Fi address.

## What is next

Replace demo hotspot records with verified local records, add verified local traffic updates and bike-shop contacts, review privacy with a parent/teacher/qualified adult, and test on a real phone before public use.

## Maybe Later

- Teen-specific safety tips.
- Report a new accident location.
- Notification preferences.
- Safety-tip history.
- Pre-ride check reminders.
- Safe-riding habits list.
- Feedback on notification accuracy.
- Notification time preferences.
- Temporarily disable notifications when not riding.
- Night visibility tips.
