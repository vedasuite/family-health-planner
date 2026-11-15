// Family Health Planner: test-team receiver for a private Google Sheet.
// Paste into Extensions > Apps Script of the Sheet, then Deploy > New deployment > Web app:
//   Execute as: Me.  Who has access: Anyone.   Copy the Web app URL.
var HEADERS = ['received_at','test_code','version','clear_1to5','matched','comments','age','sex','profile_json','family_json','results_json'];
function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    if (!d || d.consent !== true) return ContentService.createTextOutput('no consent');
    var sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
    var p = d.profile || {}, f = d.feedback || {};
    sh.appendRow([new Date(), String(d.code || '').slice(0, 20), String(d.version || '').slice(0, 20),
      String(f.clear || ''), String(f.match || ''), String(f.comments || '').slice(0, 1500),
      p.age || '', p.sex || '',
      JSON.stringify(p).slice(0, 45000), JSON.stringify(d.family || []).slice(0, 45000), JSON.stringify(d.results || {}).slice(0, 45000)]);
    return ContentService.createTextOutput('ok');
  } catch (err) { return ContentService.createTextOutput('error'); }
}
function doGet() { return ContentService.createTextOutput('Family Health Planner receiver is running.'); }
