/**
 * CNMI Tree STAFF photo uploader (separate Apps Script project).
 * Deploy as a Web App, Execute as: Me, Access: signed-in Google users.
 * Set ALLOWED_EMAILS and PHOTO_FOLDER_ID before deploying.
 * Never combine with the public read-only endpoint.
 */
const CONFIG = {
  PHOTO_FOLDER_ID: '1Jk7AT7VaUbdhnlIJ3k1wufTJ5oj3oQ6Z',
  ALLOWED_EMAILS: ['REPLACE_WITH_YOUR_GOOGLE_EMAIL'],
  MASTER_ID: '1VSjMe8JJY5DZZVlb7v-AuaSB0wfAz21sdA4_8vAM4No',
  MAX_BYTES: 6 * 1024 * 1024
};

function requireStaff_() {
  const email = String(Session.getActiveUser().getEmail() || '').toLowerCase().trim();
  if (!email || !CONFIG.ALLOWED_EMAILS.map(x => x.toLowerCase()).includes(email)) {
    throw new Error('บัญชี Google นี้ไม่ได้รับอนุญาตให้อัปโหลดภาพ (หรือระบบไม่สามารถตรวจสอบอีเมลได้)');
  }
  return email;
}

function doGet(e) {
  requireStaff_();
  const uid = String((e && e.parameter && e.parameter.tree) || '').trim();
  const tpl = HtmlService.createTemplateFromFile('Upload');
  tpl.uid = uid;
  return tpl.evaluate().setTitle('CNMI Tree | อัปโหลดภาพเจ้าหน้าที่')
    .addMetaTag('viewport','width=device-width,initial-scale=1');
}

function savePhoto(input) {
  const email = requireStaff_();
  const uid = String(input && input.tree_uid || '').trim();
  if (!/^CNMI-T\d{6}$/.test(uid)) throw new Error('Tree_UID ไม่ถูกต้อง');
  const registry = SpreadsheetApp.openById(CONFIG.MASTER_ID).getSheetByName('Tree_Registry').getDataRange().getValues();
  if (!registry.slice(1).some(row => String(row[0] || '').trim() === uid)) throw new Error('ไม่พบ Tree_UID ในทะเบียน');
  const data = String(input && input.base64 || '');
  const mime = String(input && input.mime || '');
  if (!['image/jpeg','image/png','image/webp'].includes(mime)) throw new Error('รับเฉพาะ JPEG, PNG หรือ WebP');
  const bytes = Utilities.base64Decode(data);
  if (bytes.length > CONFIG.MAX_BYTES) throw new Error('ภาพใหญ่เกิน 6 MB กรุณาย่อภาพก่อน');
  const extension = {'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[mime];
  const name = uid + '_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss') + '.' + extension;
  const folder = DriveApp.getFolderById(CONFIG.PHOTO_FOLDER_ID);
  const file = folder.createFile(Utilities.newBlob(bytes,mime,name));
  file.setDescription('CNMI Tree_UID: '+uid+'; uploaded by '+email);
  const props = PropertiesService.getScriptProperties();
  // Logging in a separate sheet is the next step; Drive description preserves the association for the pilot.
  return {ok:true,fileId:file.getId(),name:file.getName(),tree_uid:uid};
}
