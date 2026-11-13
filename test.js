// Regression tests for the rules engine. Run: npm install && npm test
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
let pass = 0, fail = 0;
function make() {
  const dom = new JSDOM(fs.readFileSync(__dirname + '/index.html', 'utf8'), { url: 'https://test.local/', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: new VirtualConsole() });
  const w = dom.window, d = w.document, $ = (id) => d.getElementById(id);
  const ev = (e, t = 'input') => e.dispatchEvent(new w.Event(t, { bubbles: true }));
  const api = {
    w, d, $,
    set(id, v) { const e = $(id); if (e.type === 'checkbox') { e.checked = !!v; ev(e, 'change'); } else { e.value = v; ev(e); } },
    fam(rel, conds, evAge, cAge) {
      $('addMember').click(); const rows = d.querySelectorAll('[data-fid]'); const row = rows[rows.length - 1];
      row.querySelector('[data-f="rel"]').value = rel; conds.forEach(k => { row.querySelector('[data-cond="' + k + '"]').checked = true; }); ev(row.querySelector('[data-f="rel"]'), 'change');
      if (evAge != null) { const a = row.querySelector('[data-f="evAge"]'); a.value = evAge; ev(a); }
      if (cAge != null) { const a = row.querySelector('[data-f="cAge"]'); a.value = cAge; ev(a); }
    },
    level(title) { const r = [...d.querySelectorAll('.risk')].find(x => x.querySelector('h3').textContent === title); return r ? r.querySelector('.pill').textContent : null; },
    tests() { return [...d.querySelectorAll('.test .name')].map(x => x.textContent); },
    text() { return $('results').textContent.replace(/\s+/g, ' '); }
  };
  return api;
}
function t(name, fn) { try { fn(); pass++; console.log('ok   ' + name); } catch (e) { fail++; console.log('FAIL ' + name + ': ' + e.message); } }
function eq(a, b, m) { if (a !== b) throw new Error((m || '') + ' expected ' + JSON.stringify(b) + ' got ' + JSON.stringify(a)); }
function yes(c, m) { if (!c) throw new Error(m || 'expected true'); }

t('blank start shows no results and no prefilled values', () => { const a = make(); yes(/Start with your age/.test(a.text()) || a.$('results').textContent.includes('Start with your age')); eq(a.$('age').value, ''); });
t('IDRS adds up: 38M waist 96, inactive, father diabetes = 70', () => { const a = make(); a.set('age', 38); a.set('height', 172); a.set('weight', 78); a.set('waist', 96); a.set('activity', '30'); a.fam('father', ['dm']); yes(/Risk Score: 70 out of 100/.test(a.text()), 'IDRS total'); eq(a.level('Diabetes'), 'Higher'); });
t('premature heart: father event at 52 gives Higher', () => { const a = make(); a.set('age', 32); a.fam('father', ['cvd'], 52); eq(a.level('Heart and stroke'), 'Higher'); yes(a.tests().includes('Lipoprotein(a), once in life')); });
t('heart event at 66 is not premature for a father', () => { const a = make(); a.set('age', 40); a.fam('father', ['cvd'], 66); eq(a.level('Heart and stroke'), 'Moderate'); });
t('BP 185/112 is flagged same day', () => { const a = make(); a.set('age', 50); a.set('sys', 185); a.set('dia', 112); eq(a.level('Blood pressure'), 'Check today'); });
t('eGFR is worked out (male 55, creatinine 1.6 is about 51)', () => { const a = make(); a.set('age', 55); a.set('creat', 1.6); yes(/eGFR of about 51/.test(a.text())); eq(a.level('Kidney'), 'See a doctor'); });
t('eGFR female 40, creatinine 0.8 is about 95', () => { const a = make(); a.set('age', 40); a.set('sex', 'F'); a.set('creat', 0.8); yes(/eGFR of about 95/.test(a.text())); });
t('prostate card is only for men', () => { const a = make(); a.set('age', 40); a.set('sex', 'F'); eq(a.level('Prostate and urinary'), null); a.set('sex', 'M'); yes(a.level('Prostate and urinary') !== null); });
t('prostate cancer in father before 65 means yearly PSA from 45', () => { const a = make(); a.set('age', 52); a.fam('father', ['pros'], null, 60); yes(/every year until 69/.test(a.text())); eq(a.level('Prostate and urinary'), 'Higher'); });
t('prostate cancer in father at 72 means every 2 years', () => { const a = make(); a.set('age', 52); a.fam('father', ['pros'], null, 72); yes(/every 2 years until 69/.test(a.text())); });
t('younger than 45 with a prostate cancer relative is told to ask about 45', () => { const a = make(); a.set('age', 43); a.fam('father', ['pros'], null, 60); yes(/Ask about starting at 45/.test(a.text())); });
t('blood in urine says see a doctor', () => { const a = make(); a.set('age', 55); a.set('o-blood', true); eq(a.level('Prostate and urinary'), 'See a doctor'); });
t('PSA 5.2 says confirm it', () => { const a = make(); a.set('age', 55); a.set('psa', 5.2); eq(a.level('Prostate and urinary'), 'Confirm it'); });
t('urinary infection note never claims a cause for cancer', () => { const a = make(); a.set('age', 50); a.set('o-usym', true); yes(/not established/.test(a.text())); yes(!/cause[sd] prostate cancer/.test(a.text())); });
t('TSH outside range says confirm it', () => { const a = make(); a.set('age', 40); a.set('tsh', 6.2); eq(a.level('Thyroid'), 'Confirm it'); });
t('LDL 195 is flagged', () => { const a = make(); a.set('age', 44); a.set('ldl', 195); eq(a.level('Heart and stroke'), 'Higher'); yes(a.tests().includes('Doctor review of a very high LDL')); });
t('breast cancer in mother at 44 gives Higher cancer card', () => { const a = make(); a.set('age', 33); a.set('sex', 'F'); a.fam('mother', ['brca'], null, 44); eq(a.level('Cancer in the family'), 'Higher'); });
t('daily alcohol gives Higher liver', () => { const a = make(); a.set('age', 36); a.set('alcohol', 'daily'); eq(a.level('Liver'), 'Higher'); });
t('low haemoglobin for a woman', () => { const a = make(); a.set('age', 29); a.set('sex', 'F'); a.set('hb', 10.5); eq(a.level('Blood and vitamins'), 'Confirm it'); });
t('national cancer screening appears from 30 only', () => { const a = make(); a.set('age', 29); eq(a.level('Cancer screening for your age'), null); a.set('age', 30); yes(a.level('Cancer screening for your age') !== null); });
t('age 30 to 34 gets the Indian diabetes screening advice', () => { const a = make(); a.set('age', 32); yes(/screens everyone from 30/.test(a.text())); });
t('every tag with a known source is a link', () => { const a = make(); a.set('age', 45); a.set('sex', 'F'); yes(a.d.querySelectorAll('.tag a').length > 5); });
t('tests are grouped by priority', () => { const a = make(); a.set('age', 38); a.fam('father', ['dm', 'cvd'], 52); yes(a.d.querySelector('.grp') !== null); });
t('linked relative uses the saved profile', () => {
  const a = make();
  a.$('profileNew').click(); a.set('age', 68); a.set('o-dm', true); a.set('o-cvd', true); a.set('o-evage', 52); a.set('profileName', 'Papa'); a.$('profileSave').click();
  a.$('profileNew').click(); a.set('age', 40); a.$('addMember').click();
  const ls = a.d.querySelector('[data-f="link"]'); ls.value = 'Papa'; ls.dispatchEvent(new a.w.Event('change', { bubbles: true }));
  eq(a.level('Heart and stroke'), 'Higher'); yes(/Father had a heart or stroke event at 52/.test(a.text()));
});
t('emergency card text includes entered details', () => { const a = make(); a.set('age', 70); a.set('ec-name', 'Papa'); a.set('ec-blood', 'B+'); yes(/Name: Papa/.test(a.$('ecPreview').textContent)); yes(/Blood group: B\+/.test(a.$('ecPreview').textContent)); });
t('delete everything clears saved data', () => { const a = make(); a.set('age', 30); a.set('profileName', 'X'); a.$('profileSave').click(); a.$('wipeBtn').click(); a.$('wipeBtn').click(); eq(a.w.localStorage.getItem('family-health-planner-profiles-v1'), null); });

/* ---- v0.7 hardening and new features ---- */
t('prostate: Urological Society of India is cited and PSA 4 wording is used', () => { const a = make(); a.set('age', 56); a.set('psa', 4.6); yes(/Urological Society of India says a PSA of 4/.test(a.text())); yes(a.d.querySelector('.tag a[href*="36568450"]') !== null, 'USI link'); });
t('prostate: average risk at 52 cites USI then ACS', () => { const a = make(); a.set('age', 52); yes(/Urological Society of India says that after 50/.test(a.text())); yes(/every 2 years from 50 to 69/.test(a.text())); });
t('haemoglobin 7.2 is severe and says see a doctor', () => { const a = make(); a.set('age', 35); a.set('sex', 'F'); a.set('hb', 7.2); eq(a.level('Blood and vitamins'), 'See a doctor'); });
t('haemoglobin 12.5 for a man is low and cites the national programme', () => { const a = make(); a.set('age', 40); a.set('hb', 12.5); eq(a.level('Blood and vitamins'), 'Confirm it'); yes(a.d.querySelector('.tag a[href*="AMB-Abhiyaan"]') !== null, 'AMB link'); });
t('women 20 to 49 get a yearly haemoglobin check; men do not', () => { const a = make(); a.set('age', 30); a.set('sex', 'F'); yes(a.tests().includes('Haemoglobin (anaemia check)')); a.set('sex', 'M'); yes(!a.tests().includes('Haemoglobin (anaemia check)')); });
t('colon: relative diagnosed at 52 means start at 40, colonoscopy every 5 years', () => { const a = make(); a.set('age', 38); a.fam('father', ['crc'], null, 52); yes(/every 5 years starting at 40/.test(a.text())); });
t('colon: relative diagnosed at 44 means start at 34', () => { const a = make(); a.set('age', 36); a.fam('mother', ['crc'], null, 44); yes(/starting at 34/.test(a.text())); yes(/already at that age/.test(a.text())); });
t('colon: relative diagnosed at 66 means start at 40 with average-risk intervals', () => { const a = make(); a.set('age', 33); a.fam('father', ['crc'], null, 66); yes(/same task force advises starting at 40/.test(a.text())); });
t('colon: says India has no national colon screening', () => { const a = make(); a.set('age', 50); yes(/not colon/.test(a.text())); });
t('thyroid: ICMR workflow reason is shown and out-of-range TSH asks for free T4', () => { const a = make(); a.set('age', 40); a.set('tsh', 7.5); yes(/free T4/.test(a.text())); yes(a.d.querySelector('.tag a[href*="hypothyroidism"]') !== null); });
t('insurance text uses the IRDAI master circular numbers', () => { const a = make(); a.set('age', 40); yes(/at most 36 months/.test(a.text())); yes(/60 continuous months/.test(a.text())); yes(/within 72 hours/.test(a.text())); });
t('typed-value warnings: BP swapped, mmol LDL, creatinine in micromol', () => {
  const a = make(); a.set('age', 45); a.set('sys', 80); a.set('dia', 120); a.set('ldl', 3.1); a.set('creat', 88);
  const w = a.d.querySelector('.warnbox'); yes(w !== null, 'warnbox'); const x = w.textContent; yes(/not higher than the bottom/.test(x)); yes(/mmol\/L/.test(x)); yes(/divide by 88.4/.test(x));
});
t('no warning box for ordinary values', () => { const a = make(); a.set('age', 45); a.set('sys', 128); a.set('dia', 82); eq(a.d.querySelector('.warnbox'), null); });
t('report reader: finds values, skips HbA1c for haemoglobin, flags mmol', () => {
  const a = make(); a.set('age', 50);
  a.$('rpText').value = 'Haemoglobin 13.2 g/dL 13.0 - 17.0\nGlycosylated Hemoglobin (HbA1c) 6.1 %\nLDL Cholesterol 3.4 mmol/L\nSerum Creatinine 1.1 mg/dL\nTSH (Ultrasensitive) 2.8 uIU/mL\nPSA, Total 1.4 ng/mL\nPSA Free 0.3 ng/mL\nBlood Pressure 132/84 mmHg\nMCH 28 pg';
  a.$('rpFind').click();
  const got = {}; a.d.querySelectorAll('[data-rpv]').forEach((i, n) => { got[i.closest('.rp-row').querySelector('label').textContent.trim()] = i.value; });
  eq(got['Haemoglobin (g/dL)'], '13.2'); eq(got['HbA1c (%)'], '6.1'); eq(got['Creatinine (mg/dL)'], '1.1'); eq(got['TSH (mIU/L)'], '2.8'); eq(got['PSA total (ng/mL)'], '1.4'); eq(got['BP top'], '132'); eq(got['BP bottom'], '84');
  const ldlRow = [...a.d.querySelectorAll('.rp-row')].find(r => /LDL/.test(r.textContent)); yes(/different unit/.test(ldlRow.textContent)); yes(!ldlRow.querySelector('[data-rp]').checked, 'mmol row unticked');
});
t('report reader: apply fills only ticked values', () => {
  const a = make(); a.set('age', 50);
  a.$('rpText').value = 'Haemoglobin 11.9 g/dL\nTSH 9.1 mIU/L'; a.$('rpFind').click();
  a.d.querySelectorAll('[data-rp]')[1].checked = false; a.$('rpApply').click();
  eq(a.$('hb').value, '11.9'); eq(a.$('tsh').value, '');
});
t('report reader: nothing found gives an honest message', () => { const a = make(); a.$('rpText').value = 'hello world'; a.$('rpFind').click(); yes(/No values found/.test(a.$('rpOut').textContent)); });
t('backup code round trip adds profiles and renames clashes', () => {
  const a = make(); a.$('profileNew').click(); a.set('age', 61); a.set('o-dm', true); a.set('profileName', 'Papa'); a.$('profileSave').click();
  a.$('bkMake').click(); const code = a.$('bkOut').value; yes(code.startsWith('FHP1.'));
  a.$('bkIn').value = code; a.$('bkImport').click();
  const st = JSON.parse(a.w.localStorage.getItem('family-health-planner-profiles-v1')); yes('Papa' in st && 'Papa (imported)' in st, Object.keys(st).join(','));
  yes(st['Papa (imported)'].v.age === '61');
});
t('backup import rejects junk and does not break', () => { const a = make(); a.$('bkIn').value = 'FHP1.not-base64!!'; a.$('bkImport').click(); yes(/could not be read|does not look/.test(a.$('bkStatus').textContent)); a.$('bkIn').value = 'hello'; a.$('bkImport').click(); yes(/does not look like/.test(a.$('bkStatus').textContent)); });
t('find care section has Tele-MANAS and emergency numbers', () => { const a = make(); const x = a.$('careBox').textContent; yes(/14416/.test(x) && /112/.test(x) && /eSanjeevani/.test(x)); });
t('version is 0.7.0', () => { const a = make(); yes(/version 0\.7\.0/.test(a.$('foot').textContent)); });

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
