# Zain OS — Static Content
Store this in `lib/content/*.ts` as typed constants. Arabic text must be copied **exactly** (with harakat). Always show the English meaning under Arabic.

## 1. Duas (Why Card → Victory Hour section)

**After Fajr (after the salam)** — Ibn Mājah 925
> اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا
> "O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds."

**Against laziness (morning)** — Ṣaḥīḥ al-Bukhārī 6369
> اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ، وَغَلَبَةِ الرِّجَالِ
> "O Allah, I seek refuge in You from worry and grief, from incapacity and laziness, from miserliness and cowardice, from the burden of debt and from being overpowered by men."

**Start of the Big Rock** — shown on the button's final beat
> بِسْمِ اللَّهِ
> "In the name of Allah."

## 2. Reflection cards (shown on a kept day, rotating; also available to the coach in P2)

| Arabic | Meaning | Source |
|---|---|---|
| أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ | "The most beloved of deeds to Allah are the most consistent of them, even if they are small." | Bukhārī 6464 · Muslim 783 |
| الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ … احْرِصْ عَلَى مَا يَنْفَعُكَ وَاسْتَعِنْ بِاللَّهِ وَلَا تَعْجَزْ | "The strong believer is better and more beloved to Allah than the weak believer… Be eager for what benefits you, seek Allah's help, and do not give up." | Muslim 2664 |
| اللَّهُمَّ بَارِكْ لِأُمَّتِي فِي بُكُورِهَا | "O Allah, bless my ummah in its early mornings." | Abū Dāwūd 2606 · Tirmidhī 1212 |
| مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ | "Charity does not decrease wealth." | Muslim 2588 |
| مَنْ سَرَّهُ أَنْ يُبْسَطَ لَهُ فِي رِزْقِهِ، وَيُنْسَأَ لَهُ فِي أَثَرِهِ، فَلْيَصِلْ رَحِمَهُ | "Whoever would love for his provision to be expanded and his life to be extended, let him maintain the ties of kinship." | Bukhārī 5986 |
| — | "Hold yourselves to account before you are held to account." | ʿUmar ibn al-Khaṭṭāb (reported by al-Tirmidhī) |
| — | "Do not belittle any good deed." | Muslim 2626 |

## 3. The 12 Laws (Law of the day: rotate by day-of-cycle mod 12)
1. **Salah is the schedule.** Every habit is anchored to a prayer you already never miss.
2. **Never miss twice.** One miss is an accident. Two is the start of a new habit.
3. **Big Rock before messages.** No feeds, news or inbox until 90 minutes of deep work are done.
4. **Decide at night, execute at dawn.** The morning never gets a vote on whether to start.
5. **Minimum on bad days, target on good days.** Consistency beats intensity.
6. **One goal per cycle.** Everything else is parked, not forgotten.
7. **Track inputs, not feelings.** Hours, reps, actions shipped. Feelings follow the numbers.
8. **Make starting stupidly easy.** 5-4-3-2-1. Just five minutes.
9. **The phone sleeps outside.** Out of the bedroom, off the dinner table, silent during the Big Rock.
10. **Celebrate every tap.** Alhamdulillah. A habit is wired in by the feeling right after it.
11. **Someone sees the score.** Every Sunday, one person you respect sees the truth.
12. **Rest is part of the work.** Qailulah, Sunday, and sleep straight after Isha.

## 4. Streak copy

| State / event | Copy |
|---|---|
| Day kept overlay | **Alhamdulillah** (Amiri: الحمد لله) · "Day kept · 🔥 {n}" |
| At risk (header tooltip) | "Missed yesterday. Keep today and the streak lives." |
| Comeback | "Comeback. Streak restored · 🔥 {n}" |
| Freeze used | "A freeze covered yesterday. {k} left." |
| Freeze earned | "7 kept days. You earned a freeze ❄️" |
| Reset | "The chain reset. Best: {best}. Day 1 starts now." (never shaming) |
| Milestone 3 | "First spark · 3 days" |
| Milestone 7 | "One week · 7 days" |
| Milestone 14 | "Two weeks · 14 days" |
| Milestone 21 | "Three weeks · 21 days" |
| Milestone 40 | "Forty days · 40" (special card) |
| Milestone 66 | "66 days: the habit is forming" (special card) |
| Milestone 84 | "Full cycle · 84 days" |
| Milestone 100 | "100 days" |
| Shrink hint | "{habit} broke the chain {x} times in 2 weeks. Shrink it to {smaller} for now?" |

## 5. Notification copy
Use exactly the copy in spec §6. Keep the title ≤ 40 chars and the body ≤ 90 chars. Put the streak number in the body when relevant.

## 6. Muhasaba flow copy
- Step titles: **Tick** · **Muhasaba** · **Plan tomorrow**
- Energy: "Energy today" (1–5) · Khushu: "Khushu in salah" (1–3: scattered / some / present)
- Prompts:
  - "What went well?"
  - "What didn't, and why?"
  - "What do I own about today?"
  - "Shukr or istighfar (optional)"
- Barrier chips: forgot · procrastinated · tired · overcommitted · distracted
- Focusing Question: "What's the ONE thing tomorrow that makes everything else easier?"
- Big Rock first action placeholder: "e.g. Open PayClock repo, finish the paywall screen"
- If-then placeholder: "If I wake up tired, then I still do 45 minutes of the Big Rock first."
- Save button: "Close the day" → toast "Saved. Sleep well."

## 7. Sunday review lite copy
- Three numbers: "🔥 Streak · Deep work {h} h · Weekly score {x}%" → "Week won" / "Week lost: what's the one fix?"
- Roles check: "Family evenings" · "Called or visited parents / kin" · "One act of service" · "Thanked someone on the team"
- Phone rules: "Phone slept outside the bedroom" · "Kept to two social windows"
- "Next week's focus (one line)"
- Share button: "Share scorecard"

## 8. Onboarding copy
1. "Assalamu alaikum, Zain. Five salah, five checkpoints, one streak."
2. Install (iOS, not standalone): "Add Zain OS to your Home Screen: tap Share, then Add to Home Screen. Reminders only work after this."
3. Notifications: "Allow reminders. At most 8 a day, plus your prayers. Nothing after 21:45 except Tahajjud."
4. Masjid times: "Confirm your masjid's jamaat times. The app recalculates them every day."
5. Identity: "Your identity line. Edit it into your own words."
6. Done: "Day 1 starts now. Bismillah."

## 9. Library
The 31 book entries (category, title, author, gist, practical move, "In Zain OS") are in `docs/reference/playbook.html` in the `B` array inside the page script. Extract them into `lib/content/library.ts` as typed data (used in P2).
