/**
 * CNMI Tree PUBLIC read-only endpoint.
 * Deploy as Web App: Execute as Me; Who has access: Anyone.
 * All returned fields are approved for public release. Do not add staff/private fields.
 * No write methods, no credentials in GitHub.
 */
const CNMI_PUBLIC = Object.freeze({
  masterId: '1VSjMe8JJY5DZZVlb7v-AuaSB0wfAz21sdA4_8vAM4No',
  inventoryId: '18iFwJQC4N0Ms-lSiupaM3x6ART9U2RHKtGLvEi1MNgQ',
  cacheSeconds: 300
});

function doGet(e) {
  const callback = String((e && e.parameter && e.parameter.callback) || '');
  // JSONP is needed because GitHub Pages cannot use Apps Script ContentService
  // as a normal cross-origin JSON API reliably after redirects.
  if (!/^cnmiTreeCallback_[A-Za-z0-9_]{1,60}$/.test(callback)) {
    return ContentService.createTextOutput('Invalid callback').setMimeType(ContentService.MimeType.TEXT);
  }
  try {
    const cache = CacheService.getScriptCache();
    let json = cache.get('cnmi_public_v1');
    if (!json) {
      json = JSON.stringify(buildPublicData_());
      // Apps Script cache entries are limited to 100 KB; large inventories skip cache.
      if (json.length < 90000) cache.put('cnmi_public_v1', json, CNMI_PUBLIC.cacheSeconds);
    }
    return ContentService.createTextOutput(callback + '(' + json + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  } catch (err) {
    return ContentService.createTextOutput(callback + '(' + JSON.stringify({error:'Public data temporarily unavailable'}) + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function buildPublicData_() {
  const master = SpreadsheetApp.openById(CNMI_PUBLIC.masterId);
  const treeSheet = master.getSheetByName('Tree');
  const registrySheet = master.getSheetByName('Tree_Registry');
  const summarySheet = SpreadsheetApp.openById(CNMI_PUBLIC.inventoryId).getSheetByName('Summary');
  if (!treeSheet || !registrySheet || !summarySheet) throw new Error('Required sheet missing');
  const treeRows = treeSheet.getDataRange().getValues();
  const registryRows = registrySheet.getDataRange().getValues();
  const lookup = {};
  for (let i=1;i<registryRows.length;i++) {
    const row=registryRows[i],uid=String(row[0]||'').trim(),id=String(row[1]||'').trim();
    if(uid && id) lookup[id]=uid;
  }
  const trees=[],areaCarbon={},seen={};
  for (let i=1;i<treeRows.length;i++) {
    const r=treeRows[i],id=String(r[1]||'').trim();
    if (!id) continue;
    if (seen[id]) throw new Error('Duplicate Tree_ID: '+id);
    seen[id]=true;
    const uid=lookup[id];
    if(!uid) throw new Error('Missing UID: '+id);
    const pos=String(r[3]||'').split(/[,，]/).map(x=>Number(x.trim()));
    const geo=pos.length===2 && pos.every(Number.isFinite) && Math.abs(pos[0])<=90 && Math.abs(pos[1])<=180;
    const area=String(r[0]||'').trim();
    trees.push({
      tree_uid:uid,tree_id:id,area_id:area,species:String(r[2]||'').trim(),
      latitude:geo?pos[0]:null,longitude:geo?pos[1]:null,
      height_m:num_(r[4]),crown_m:num_(r[5]),stem_count:num_(r[6]),dbh_max_cm:num_(r[7])
    });
    const c=num_(r[8]);
    if(c!==null && c>0)areaCarbon[area]=(areaCarbon[area]||0)+c;
  }
  // Use the source workbook's existing summary formulas, not a new counting rule.
  const summary=summarySheet.getRange('A3:C3').getValues()[0];
  const total=Number(summary[0]),measured=Number(summary[1]),carbonTotal=Number(summary[2]);
  if(![total,measured,carbonTotal].every(Number.isFinite))throw new Error('Invalid source summary');
  const byArea=Object.keys(areaCarbon).map(area_id=>({area_id,ton:Number(areaCarbon[area_id].toFixed(6))})).sort((a,b)=>b.ton-a.ton);
  return {
    updated_at:new Date().toISOString(),
    trees:trees,
    carbon:{
      total_ton:carbonTotal,measured_trees:measured,total_trees:total,
      missing_trees:Math.max(0,total-measured),by_area:byArea,
      source:'05-CNMI_Tree / Summary!A3:C3; area breakdown: CNMI Tree Master / Tree'
    }
  };
}
function num_(x) {
  if(x===''||x===null||x===undefined)return null;
  const n=Number(String(x).replace(/,/g,'').trim());
  return Number.isFinite(n)?n:null;
}
