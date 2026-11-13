# Rules and sources register

Every rule in the planner has a tag on screen: **Guideline** (written in a published guideline), **Scored tool** (a published, validated score), **General advice** (common advice with no single guideline) or **Prototype rule** (a grouping written for this tool). This file lists them in one place. Sources were last re-checked on **13 Nov 2026**.

| Area | Rule | Strength | Source |
|---|---|---|---|
| Diabetes | Indian Diabetes Risk Score (age, waist, activity, parents). 60 or more is higher | Scored tool | IDRS, Madras Diabetes Research Foundation |
| Diabetes | National programme screens everyone from 30; ICMR lists age over 30 with overweight and a risk factor, and PCOS, as reasons to test | Guideline | MoHFW NP-NCD; ICMR STW T2DM |
| Heart | Family history, Lp(a) once, LDL 190 or more flagged, Indian targets | Guideline | CSI 2023 dyslipidemia; ACC/AHA risk enhancers |
| Heart | Premature family event cut-off of 65 | General advice | ACC/AHA uses 55 men / 65 women, CSI uses 60 for women; this tool uses 65 |
| Blood pressure | Risk factors, yearly checks at 30 and above, 180/120 flagged same day | Guideline | MoHFW hypertension STG; NP-NCD |
| Kidney | eGFR by CKD-EPI 2021 (no race term); screening factors | Guideline | ICMR STW CKD; AAFP 2023 review |
| Prostate | After 50 with life expectancy over 10 to 15 years, PSA with rectal exam for men at risk; PSA 4 as a point for further evaluation | Guideline | Urological Society of India 2022 (executive summary) |
| Prostate | Every 2 years 50 to 69 at average risk; from 45 with family history; yearly if a relative was under 65 or more than one is affected | Guideline (international) | American Cancer Society |
| Thyroid | TSH with free T4 and TPO antibodies; reasons to treat subclinical hypothyroidism | Guideline | ICMR STW Hypothyroidism |
| Thyroid | TSH range 0.4 to 4.0; who to screen | General advice | No source gives a range or a screening rule; labs differ |
| Blood | Haemoglobin 13 men / 12 non-pregnant women; bands 11 / 8; pregnancy cut-offs; yearly check for women 20 to 49 | Guideline | Anemia Mukt Bharat |
| Blood | B12 with vegetarian diet or metformin; vitamin D | General advice | No Indian guideline asks everyone to be tested |
| Liver | Alcohol and fatty liver advice; fatty liver screening in type 2 diabetes | Guideline | ICMR-NIN 2024; news summary of an Indian MASLD diabetes guideline |
| Cancer screening | Mouth, breast, cervical every 5 years from 30 | Guideline | MoHFW NP-NCD |
| Colon | Screening 45 to 75 for average risk (India has no national colon programme) | Guideline (international) | US Preventive Services Task Force |
| Colon | Relative diagnosed under 60: start 10 years earlier or at 40, colonoscopy every 5 years; 60 or older: start at 40 | Guideline (international) | US Multi-Society Task Force |
| Breast | Earlier screening and genetic counselling with a close relative | General advice | None |
| Insurance | Waiting period cap 36 months, moratorium 60 months, portability timelines, no entry-age cap, cashless decision in 1 hour | Guideline | IRDAI Master Circular on Health Insurance, 29 May 2024 |
| Tax | Section 80D preventive check-up limit | General advice | Consumer summary, not the Act |
| Levels | Higher / Moderate / Lower groupings and the order of tests | Prototype rule | Written for this tool |

## Known weak points
- No doctor has reviewed the rules yet. `review.html` is the sheet for that.
- Colon and breast family rules, vitamin D and B12 advice have no Indian guideline behind them.
- The Urological Society of India summary gives no testing interval, so intervals come from the American Cancer Society.
- Section 80D is from a consumer summary.
- Tele-MANAS details come from an April 2023 press release. Government portal links in "Find care" were not opened by the author's tools.

## How a rule is changed
1. Find the source and read the original text, not a summary where possible.
2. Change the rule in `index.html` and its tag and source link.
3. Add or update a test in `test.js` and run `npm test`.
4. Update this file, `CHANGELOG.md`, `APP_VERSION` and `RULES_DATE` in `index.html`.
5. Copy the change to the Claude-hosted version if there is one.

## Re-check schedule
All sources are re-checked every 6 months, and sooner when a guideline in the table above is revised. The date at the bottom of the app is updated each time.

## Getting a doctor's review
Send `review.html` (a link to /review on the live site) to a physician, and a urologist for the prostate section. They tick Agree, Disagree or Unsure for the 25 rules and 34 scenarios and copy the text back. Record the reviewer's name, specialty and date here once done.
