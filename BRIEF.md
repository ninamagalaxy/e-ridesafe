# Project brief: E-RideSafe

## Competition

- Presidential SI Challenge, Standard Track, national K–12 competition.
- Target age group: high school, grades 9–12.
- Judges score a written entry (PDF up to 10 pages) and a video (up to 4 minutes). They reward a clear understanding of the problem and sensible use of AI.
- Deadlines: Dec 18 and Dec 23.

## Problem and impact

People in the community struggle with e-bike and e-scooter safety because of a lack of awareness. The impact area is safety and kindness. The project should help reduce injuries and deaths, bridge generations, educate riders, and reduce reckless riding.

Evidence: In 2024, an estimated 79,300 people went to U.S. emergency rooms because of e-scooter injuries: https://www.cpsc.gov/s3fs-public/Micromobility_Products-Related_Deaths_Injuries_and_Hazard_Patterns_2017-2024.pdf?utm_source=chatgpt.com

Community feedback:

- Person A: “I think schools should have safety presentations, posters, and maybe short videos explaining the rules. Students would pay more attention if the information was easy to understand.”
- Person B: “I've seen students riding really fast on sidewalks and sometimes riding with two people on one scooter. It can be dangerous for pedestrians.”

## Solution and difference

The AI sends real-time notifications and safety tips when e-bike and e-scooter riders approach high-traffic areas or accident hotspots. This is more useful than a one-time lecture because the reminder arrives at the place and time it is needed. It should help riders recognize danger, stay alert, and make safer decisions before an accident.

BikeMaps.org (https://bikemaps.org/en/?utm_source=chatgpt.com) provides cycling safety information but its alerts are monthly, not automatic warnings near a hotspot. E-RideSafe is different through 24/7 automatic warnings, teen-friendly safety tips, and an automatic community accident-hotspot map.

## Safety, privacy, and legal plan

- Physical safety: warnings can be wrong or missing. Use trusted records, explain that warnings are not guaranteed, and tell riders to follow signs, watch the road, and use judgment.
- Data security: collect as little information as possible. Do not ask for names, home addresses, phone numbers, or school schedules. Do not store individual riding histories.
- Children’s safety: refuse requests to track another person. Include parent/teacher guidance, age-appropriate explanations, and clear privacy rules.
- Consider COPPA, FERPA, and FTC children’s online privacy guidance. These are requirements to review with a parent, teacher, and qualified adult before testing with children, not a claim of compliance.
- Never tell riders to look at their phones while moving.
- Never share a child’s location or riding history with other users.
- Never pretend an accident warning is guaranteed to be accurate.
- Always use friendly, respectful, age-appropriate language.

## MVP features, in order

1. Real-time safety notifications when approaching high-risk areas.
2. Community accident hotspot map for e-bike and e-scooter riders.
3. Local traffic rules and regulations for e-bikes.
4. Alerts about local events or changes in traffic patterns.
5. Emergency contact information for local authorities or bike shops.
6. AI gives correct, safe answers to real questions.

Build Version 1 with these MVP features only. Start with feature 1, the main job, so a target user can use the AI part from start to finish. Make the difference from existing tools easy to see, follow the safety plan from the start, and make every feature easy to show in a short video.

## Maybe later (not Version 1)

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

## AI instructions

The AI talks to e-bike and e-scooter riders and concerned non-riders. It should be formal but friendly, use simple language for high school students, and usually answer in 3–6 sentences. It should answer safety rules, signs, traffic rules, facts, and guidelines; warn about hazards; and provide real-time safety notifications.

It must use trusted accident records and verified community reports, reliable traffic information, current location only when necessary, official safety guidelines, automatic warnings 24 hours a day, teen-friendly reminders about helmets, signals, cars, and alertness, the hotspot map, accuracy limitations, privacy protection, COPPA/FERPA/FTC considerations, emergency safety, and human judgment.

It must never leak private information, track another person, guarantee a warning, tell riders to use a phone while moving, or invent an answer. If it does not know, it must say so. Notifications should be audible or reviewed only after stopping safely. Send these AI instructions as system instructions with every AI message, and ask the AI only at the moment described in the final brief.

## Technical constraints

- Use React Native with Expo.
- Expo Go on the phone supports SDK 58. Create with `npx create-expo-app@latest` using the blank template for SDK 58 (for example `--template blank@sdk-58`), then run `npx expo install --fix` and `npx expo-doctor`. Only change SDK if Expo Go changes.
- Keep data on the phone for now.
- The real OpenAI AI must run through a small Node.js helper on the computer. The key comes only from `getKey()` and must never enter the app, page, logs, or source.
- The phone reaches the helper through the computer’s local Wi-Fi address. If Expo runs through a tunnel, explain the alternative.
- Keep the AI request in one small clearly named file. While waiting, show “Thinking…” and disable the button.
- If AI fails, show the `error.message` from `getKey()` when available, otherwise a friendly Wi-Fi/helper message. Do not retry in a loop.
- Keep `.env` in `.gitignore`.

## Delivery checklist

Update `NOTES.md` after every big change. It must explain what is done, what is next, and how to start both the helper and Expo. When finished, list every MVP feature with whether it works and two steps to check it. Make a save point and push it to GitHub. Start Expo in the background with live reload, provide the `exp://` link as plain text, save the QR code as an image or web page, and open it for scanning.
