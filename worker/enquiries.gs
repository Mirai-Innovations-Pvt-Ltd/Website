/**
 * Layer pilot enquiries. The website's Worker (worker/index.js) posts each pilot sheet here as JSON; this adds a row
 * to the spreadsheet the script is bound to and mails the enquiry to hello@. Bound to the "Layer pilot enquiries"
 * sheet and deployed as a web app (execute as me, anyone can access); the web app's /exec URL is the Worker's
 * FORM_HOOK secret. After changing this file, paste it into the sheet's Apps Script editor and deploy a new version
 * of the same deployment, so the URL stays the same.
 * @OnlyCurrentDoc
 */
const TO = 'hello@miraiinnovations.tech';
const COLS = ['Received', 'Role', 'Name', 'Company', 'City', 'Phone', 'Email', 'Dates or campaign', 'Country', 'Site'];

function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  const s = (k, max) => String(d[k] || '').slice(0, max || 200);
  // a value starting with = + - @ would run as a formula in the sheet: keep it as text
  const cell = (v) => (/^[=+\-@]/.test(v) ? "'" + v : v);
  const sheet = SpreadsheetApp.getActive().getSheets()[0];
  if (sheet.getLastRow() === 0) sheet.appendRow(COLS);
  sheet.appendRow([new Date()].concat(['role', 'name', 'company', 'city', 'phone', 'email', 'when', 'country', 'site'].map((k) => cell(s(k)))));
  const email = s('email');
  const who = [s('name'), s('role'), s('company')].filter(String).join(' · ');
  const test = /(^|\.)miraiinnovations\.tech$/.test(s('site')) ? '' : ' [test: ' + s('site') + ']';
  MailApp.sendEmail({
    to: TO,
    subject: 'Layer pilot: ' + who + test,
    body: (s('message', 1500) || who) + '\n\nAll enquiries: ' + SpreadsheetApp.getActive().getUrl(),
    replyTo: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : TO,
    name: 'Layer website',
  });
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}
