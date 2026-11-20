import React,{useEffect,useMemo,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {MapContainer,TileLayer,Marker,Popup} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './style.css';

const pin=L.divIcon({html:'<span class="pin">🌳</span>',className:'',iconSize:[30,30],iconAnchor:[15,15]});
const menu=[
 ['dashboard','⌂','ภาพรวม (Dashboard)'],
 ['trees','♣','ทะเบียนต้นไม้'],
 ['work','▤','ใบงาน'],
 ['activity','▣','กิจกรรม / ประวัติ'],
 ['map','♧','แผนที่ต้นไม้'],
 ['reports','▥','รายงาน'],
 ['staff','⚙','เจ้าหน้าที่ / ตั้งค่า']
];
const fmt=n=>Number(n||0).toLocaleString('th-TH');
const LIVE_INTERVAL_MS=5*60*1000;
function fetchLiveJsonp(url){return new Promise((resolve,reject)=>{const callback='cnmiTreeCallback_'+Math.random().toString(36).slice(2,12);const script=document.createElement('script');let done=false;const finish=(error,data)=>{if(done)return;done=true;clearTimeout(timer);script.remove();delete window[callback];error?reject(error):resolve(data)};window[callback]=data=>finish(null,data);script.onerror=()=>finish(new Error('เชื่อมต่อ Apps Script ไม่สำเร็จ'));const timer=setTimeout(()=>finish(new Error('หมดเวลารอข้อมูล')),25000);script.src=url+(url.includes('?')?'&':'?')+'callback='+callback+'&t='+Date.now();document.head.appendChild(script)})}

function App(){
 const [carbon,setCarbon]=useState(null);const [areaNames,setAreaNames]=useState({});const [liveStatus,setLiveStatus]=useState({mode:'snapshot',updatedAt:null,error:''});const [refreshToken,setRefreshToken]=useState(0);const [page,setPage]=useState('dashboard'),[trees,setTrees]=useState([]),[error,setError]=useState(''),[query,setQuery]=useState(''),[selected,setSelected]=useState(null),[menuOpen,setMenuOpen]=useState(false);
 useEffect(()=>{fetch(import.meta.env.BASE_URL+'data/trees.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(data=>{if(!Array.isArray(data))throw Error('รูปแบบข้อมูลไม่ถูกต้อง');setTrees(data)}).catch(e=>setError('โหลดข้อมูลไม่ได้: '+e.message))},[]);
 useEffect(()=>{fetch(import.meta.env.BASE_URL+'data/carbon-summary.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(setCarbon).catch(()=>setCarbon(null))},[]);
 useEffect(()=>{fetch(import.meta.env.BASE_URL+'data/areas.json').then(r=>r.json()).then(setAreaNames).catch(()=>setAreaNames({}))},[]);
 useEffect(()=>{let active=true;let interval;const refresh=async(url)=>{try{const data=await fetchLiveJsonp(url);if(!active)return;if(!data||!Array.isArray(data.trees)||!data.carbon||!Number.isFinite(Number(data.carbon.total_ton)))throw Error('รูปแบบข้อมูลไม่ถูกต้อง');setTrees(data.trees);setCarbon(data.carbon);setError('');setLiveStatus({mode:'live',updatedAt:data.updated_at||new Date().toISOString(),error:''})}catch(e){if(active)setLiveStatus(prev=>({...prev,mode:prev.mode==='live'?'stale':'snapshot',error:e.message}))}};fetch(import.meta.env.BASE_URL+'data/live-config.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(cfg=>{if(!active)return;const url=String(cfg?.publicApiUrl||'').trim();if(!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(url)){setLiveStatus({mode:'snapshot',updatedAt:null,error:''});return}refresh(url);interval=setInterval(()=>refresh(url),LIVE_INTERVAL_MS)}).catch(()=>{});return ()=>{active=false;if(interval)clearInterval(interval)}},[refreshToken]);

 const areaLabel=code=>code?('['+code+'] '+(areaNames[code]?.name_th||'ไม่พบชื่อพื้นที่')):'ไม่ระบุพื้นที่';
 const filtered=useMemo(()=>trees.filter(t=>[t.tree_uid,t.tree_id,t.species,t.area_id,areaNames[t.area_id]?.name_th].some(x=>String(x||'').toLowerCase().includes(query.trim().toLowerCase()))),[trees,query,areaNames]);
 const validGeo=t=>t.latitude!==''&&t.longitude!==''&&t.latitude!=null&&t.longitude!=null&&Number.isFinite(Number(t.latitude))&&Number.isFinite(Number(t.longitude))&&Math.abs(Number(t.latitude))<=90&&Math.abs(Number(t.longitude))<=180;
 const mapped=filtered.filter(validGeo);
 const areas=new Set(trees.map(t=>t.area_id).filter(Boolean)).size;
 const speciesCount=useMemo(()=>{const counts={};trees.forEach(t=>{const s=String(t.species||'ไม่ระบุชนิด').trim();counts[s]=(counts[s]||0)+1});return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,8)},[trees]);
 const treeLink=uid=>window.location.origin+import.meta.env.BASE_URL+'?tree='+encodeURIComponent(uid);
 const openTree=t=>{setSelected(t);setPage('trees');setMenuOpen(false);const url=new URL(window.location.href);url.searchParams.set('tree',t.tree_uid);window.history.pushState({},'',url)};
 useEffect(()=>{const selectFromUrl=()=>{const uid=new URLSearchParams(window.location.search).get('tree');if(!uid)return;setPage('trees');const tree=trees.find(t=>t.tree_uid===uid);if(tree)setSelected(tree)};selectFromUrl();window.addEventListener('popstate',selectFromUrl);return()=>window.removeEventListener('popstate',selectFromUrl)},[trees]);
 const staffUrl=import.meta.env.VITE_STAFF_APP_URL;
 const go=p=>{setPage(p);setSelected(null);setMenuOpen(false);const url=new URL(window.location.href);url.searchParams.delete('tree');window.history.pushState({},'',url)};
 return <div className="shell">
 <aside className={'sidebar '+(menuOpen?'open':'')}>
  <div className="side-brand"><img src={import.meta.env.BASE_URL+'cnmi-logo.png'} alt="CNMI RAMATHIBODI" /><div className="side-brand-name">CNMI <span>Tree</span></div><small>Tree Management System</small></div>
  <div className="side-nav">{menu.map(([id,ico,label])=><button key={id} className={page===id?'selected':''} onClick={()=>go(id)}><span className="nav-icon">{ico}</span><span>{label}</span></button>)}</div>
  <div className="side-bottom"><span>🌿 CNMI Tree</span><small>Public information portal</small><small>Prototype v0.2</small></div>
 </aside>
 {menuOpen&&<button className="overlay" aria-label="ปิดเมนู" onClick={()=>setMenuOpen(false)} />}
 <div className="workspace">
  <header className="topbar"><button className="hamburger" onClick={()=>setMenuOpen(true)} aria-label="เปิดเมนู">☰</button><div className="top-title"><span className="leaf-mark">🌿</span><div><div className="title-line"><h1>CNMI Tree</h1><span>ระบบบริหารจัดการต้นไม้ <em>(Tree Management System)</em></span></div><p>งานกายภาพและสิ่งแวดล้อม · สถาบันการแพทย์จักรีนฤบดินทร์</p></div></div><button className="sync" onClick={()=>setRefreshToken(v=>v+1)} title="ตรวจข้อมูลล่าสุด"><span>↻</span><div>{liveStatus.mode==='live'?'ข้อมูลอัปเดตอัตโนมัติ':liveStatus.mode==='stale'?'ข้อมูลล่าสุดที่โหลดสำเร็จ':'ข้อมูลชุดสำรอง'}<small>{liveStatus.updatedAt?'ข้อมูล ณ '+new Date(liveStatus.updatedAt).toLocaleString('th-TH',{dateStyle:'short',timeStyle:'short'}):'ยังไม่เชื่อม API สด · กดเพื่อตรวจใหม่'}</small></div></button></header>
  <main className="content">
  {error&&<div className="error">{error}</div>}
  {page==='dashboard'&&<>
   <div className="page-heading"><div><h2>ภาพรวมทะเบียนต้นไม้</h2><p>ข้อมูลสรุปจากชุดข้อมูลที่อนุญาตให้เผยแพร่</p></div><span className="status-tag">● Public dashboard</span></div>
   <section className="kpi-grid">
    <article className="kpi"><span className="kpi-label">จำนวนต้นไม้ในชุดเผยแพร่</span><strong>{fmt(trees.length)}</strong><small>ต้น</small></article>
    <article className="kpi"><span className="kpi-label">พื้นที่ที่มีข้อมูล</span><strong>{fmt(areas)}</strong><small>พื้นที่</small></article>
    <article className="kpi"><span className="kpi-label">ปริมาณ CO₂e รวมที่คำนวณแล้ว</span><strong>{carbon?carbon.total_ton.toLocaleString("th-TH",{minimumFractionDigits:2,maximumFractionDigits:2}):"—"}</strong><small>tCO₂e · {carbon?fmt(carbon.measured_trees)+" ต้น":"รอข้อมูล"}</small></article>
    <article className="kpi"><span className="kpi-label">ชนิดต้นไม้ที่บันทึก</span><strong>{fmt(new Set(trees.map(t=>t.species).filter(Boolean)).size)}</strong><small>ชนิด</small></article>
   </section>
   <section className="dashboard-grid">
    <article className="panel"><div className="panel-title"><h3>🌿 จำนวนต้นไม้ตามชนิด (Top 8)</h3><span>ข้อมูลจริง</span></div>{speciesCount.length?<div className="bars">{speciesCount.map(([name,n])=><div className="bar-row" key={name}><span title={name}>{name}</span><div className="bar-track"><div style={{width:(n/speciesCount[0][1]*100)+'%'}} /></div><b>{fmt(n)}</b></div>)}</div>:<Empty icon="🌱" title="ยังไม่มีข้อมูลชนิดต้นไม้" desc="รอเชื่อมชุดข้อมูลที่อนุญาตให้เผยแพร่จาก CNMI Tree Master" />}</article>
    <article className="panel"><div className="panel-title"><h3>🌱 สถานะสุขภาพต้นไม้</h3><span>เตรียมเชื่อมระบบประเมิน</span></div><Empty icon="◎" title="ยังไม่มีผลการประเมิน" desc="กราฟสัดส่วนสุขภาพจะแสดงเมื่อมีข้อมูล Tree Health ที่ตรวจสอบแล้ว" /></article>
    <article className="panel"><div className="panel-title"><h3>▤ ใบงาน (Work Order)</h3><span>ระบบเจ้าหน้าที่</span></div><Empty icon="📋" title="ยังไม่เชื่อมใบงาน" desc="จะเชื่อมกับ Work_Order และ Work_Order_Trees ในระยะถัดไป" /><button className="text-action" onClick={()=>go('work')}>ดูโครงสร้างใบงาน →</button></article>
   </section>
   <section className="bottom-grid">
    <article className="panel"><div className="panel-title"><h3>🌿 สัดส่วน CO₂e แยกตามพื้นที่</h3><span>tCO₂e · จาก Master</span></div>{carbon?.by_area?.length?<><CarbonDonut carbon={carbon} areaLabel={areaLabel}/><p className="carbon-note">รวม {carbon.total_ton.toFixed(3)} tCO₂e จาก {fmt(carbon.measured_trees)} ต้น · ยังไม่มีค่าคำนวณ {fmt(carbon.missing_trees)} ต้น</p></>:<Empty icon="CO₂" title="ยังไม่มีข้อมูลคาร์บอน" desc="รอโหลดข้อมูลสรุปจากทะเบียนต้นไม้" />}</article>
    <article className="panel"><div className="panel-title"><h3>▣ กิจกรรมล่าสุด</h3><span>Activity Log</span></div><Empty icon="📷" title="ยังไม่มีรายการกิจกรรมเผยแพร่" desc="ภาพถ่ายและประวัติการดูแลจะแสดงเมื่อมีระบบคัดกรองข้อมูลสาธารณะ" /></article>
   </section>
   <p className="data-note">ⓘ จำนวนต้นที่สำรวจแล้วอ้างอิงสูตรใน Summary ของไฟล์ต้นฉบับ · {liveStatus.mode==='live'?'อัปเดตอัตโนมัติทุก 5 นาที':liveStatus.mode==='stale'?'การเชื่อมต่อมีปัญหา กำลังแสดงข้อมูลล่าสุดที่โหลดสำเร็จ':'กำลังแสดงข้อมูลสำรองจาก GitHub (ยังไม่เชื่อม API สด)'}{liveStatus.error?' · '+liveStatus.error:''}</p>
  </>}
  {page==='trees'&&<div className="panel full"><div className="panel-title"><h2>ทะเบียนต้นไม้</h2><span>{fmt(filtered.length)} รายการ</span></div><input placeholder="ค้นหา Tree_UID, Tree_ID, ชนิด หรือพื้นที่" aria-label="ค้นหาต้นไม้" value={query} onChange={e=>setQuery(e.target.value)}/>{selected?<div className="tree-detail"><button className="back" onClick={()=>{setSelected(null);const url=new URL(window.location.href);url.searchParams.delete("tree");window.history.pushState({},"",url)}}>← กลับสู่รายการ</button><h3>{selected.species||'ไม่ระบุชนิด'}</h3><p><b>Tree_ID:</b> {selected.tree_id}</p><div className="tree-link-tools"><button onClick={()=>navigator.clipboard.writeText(treeLink(selected.tree_uid)).then(()=>alert("คัดลอกลิงก์ต้นไม้แล้ว")).catch(()=>window.prompt("คัดลอกลิงก์",treeLink(selected.tree_uid)))}>🔗 คัดลอกลิงก์รายต้น</button></div><p><b>พื้นที่:</b> {areaLabel(selected.area_id)}</p><details className="technical"><summary>ข้อมูลทางเทคนิค</summary><p><b>Tree_UID:</b> {selected.tree_uid}</p></details><p><b>ความสูง:</b> {selected.height_m??'ไม่ระบุ'} เมตร</p><TreePhotoSection tree={selected} /><p>ประวัติการดูแลจะเชื่อมในระยะถัดไป</p></div>:filtered.length?<div className="tree-list">{filtered.map(t=><button key={t.tree_uid||t.tree_id} onClick={()=>openTree(t)}><b>{t.species||'ไม่ระบุชนิด'}</b><span>{t.tree_id}</span><small>{areaLabel(t.area_id)}</small></button>)}</div>:<Empty icon="🌳" title="ยังไม่มีรายการต้นไม้" desc="ข้อมูลจะปรากฏหลังจัดเตรียมชุดข้อมูลสาธารณะ" />}</div>}
  {page==='map'&&<div className="panel full"><div className="panel-title"><h2>แผนที่ต้นไม้</h2><span>{fmt(mapped.length)} จุด</span></div><input aria-label="ค้นหาแผนที่" placeholder="ค้นหาต้นไม้หรือพื้นที่" value={query} onChange={e=>setQuery(e.target.value)}/>{mapped.length?<div className="map"><MapContainer key={mapped[0].tree_uid||mapped[0].tree_id} center={[Number(mapped[0].latitude),Number(mapped[0].longitude)]} zoom={16} scrollWheelZoom={false} style={{height:'100%',width:'100%'}}><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>{mapped.map(t=><Marker key={t.tree_uid||t.tree_id} icon={pin} position={[Number(t.latitude),Number(t.longitude)]}><Popup><b>{t.species||'ต้นไม้'}</b><br/>{t.tree_id}<br/>{areaLabel(t.area_id)}</Popup></Marker>)}</MapContainer></div>:<Empty icon="🗺" title="ยังไม่มีพิกัดต้นไม้สำหรับเผยแพร่" desc="แผนที่จะแสดงข้อมูลจริงหลังผ่านการคัดกรอง" />}</div>}
  {page==='work'&&<Placeholder title="ใบงาน (Work Order)" icon="📋" desc="เตรียมเชื่อม Work_Order และ Work_Order_Trees จาก CNMI Tree Log พร้อมสถานะการมอบหมายและตรวจรับ" go={go}/>}
  {page==='activity'&&<Placeholder title="กิจกรรมและประวัติต้นไม้" icon="🗓" desc="เตรียมเชื่อม Activity Log โดยอ้างอิง Tree_UID ถาวร เพื่อรักษาประวัติแม้มีการย้ายปลูก" go={go}/>}
  {page==='reports'&&<Placeholder title="รายงาน" icon="📊" desc="เตรียมรายงานจำนวนต้นไม้รายพื้นที่ ประวัติการดูแล สุขภาพ และคาร์บอนตามข้อมูลที่ตรวจสอบแล้ว" go={go}/>}
  {page==='staff'&&<div className="panel full"><h2>เจ้าหน้าที่และการตั้งค่า</h2><p>ส่วนบันทึกข้อมูลจะทำผ่าน Google Apps Script Web App ที่ตรวจสอบสิทธิ์ฝั่งเซิร์ฟเวอร์</p>{staffUrl?<a className="cta" href={staffUrl} target="_blank" rel="noopener noreferrer">เปิดระบบเจ้าหน้าที่ ↗</a>:<div className="data-note">ยังไม่ได้เชื่อม Apps Script Web App (VITE_STAFF_APP_URL)</div>}<p className="muted">GitHub Pages เป็นเว็บสาธารณะ การซ่อนเมนูหรือปุ่มไม่ใช่การควบคุมสิทธิ์เข้าถึง</p></div>}
  </main><footer>CNMI Tree · Prototype v0.2 · Public read-only portal</footer>
 </div></div>
}
const STAFF_PHOTO_UPLOAD_URL='https://script.google.com/macros/s/AKfycbxE3f5HR35b_V4wqJo1UqmWMlQ08n_QFfd9TYTqWqUp0H-dX6KkRA8_pLe29-03avtb/exec';
function TreePhotoSection({tree}){return <section className="tree-photos"><div className="photo-head"><h4>ภาพถ่ายต้นไม้</h4><span>ผูกกับ Tree_UID: {tree.tree_uid}</span></div><div className="photo-empty"><span>📷</span><div><strong>ยังไม่มีภาพถ่ายประจำต้น</strong><small>ภาพที่เจ้าหน้าที่อัปโหลดจะแสดงที่นี่เมื่อเชื่อมระบบอ่านภาพ</small></div></div><a className="staff-photo-link" href={STAFF_PHOTO_UPLOAD_URL+"?tree="+encodeURIComponent(tree.tree_uid)} target="_blank" rel="noopener noreferrer">📷 เพิ่มภาพถ่ายต้นไม้ (เจ้าหน้าที่)</a><p className="photo-warning">เปิดฟอร์มเจ้าหน้าที่ในแท็บใหม่ · ต้องใช้บัญชี Google ที่ได้รับอนุญาต</p></section>}
function CarbonDonut({carbon,areaLabel}){const colors=['#246c4b','#48a06a','#83bc78','#b1d794','#d6b96c','#73a8a1','#8f92c5','#cf9b88','#8cbaaf','#d6d6a5','#a4a8ac','#a9c6df','#b59dbd','#e0c2a3','#8da57b'];const items=carbon.by_area.filter(x=>x.ton>0);const sum=items.reduce((a,x)=>a+x.ton,0);let current=0;const segments=items.map((x,i)=>{const start=current;current+=x.ton/sum*100;return {...x,color:colors[i%colors.length],start,end:current}});const gradient=segments.map(x=>x.color+' '+x.start.toFixed(4)+'% '+x.end.toFixed(4)+'%').join(', ');return <div className="carbon-donut-layout"><div className="carbon-donut" role="img" aria-label="กราฟวงกลมแสดงสัดส่วนปริมาณ CO2e แยกตามพื้นที่" style={{background:'conic-gradient('+gradient+')'}}><div className="donut-hole"><strong>{carbon.total_ton.toLocaleString('th-TH',{maximumFractionDigits:3})}</strong><small>tCO₂e รวม</small></div></div><div className="donut-legend">{segments.map(x=><div className="donut-legend-row" key={x.area_id} title={areaLabel(x.area_id)}><span className="legend-dot" style={{background:x.color}}></span><span className="legend-area">{x.area_id}</span><span className="legend-name">{areaLabel(x.area_id).replace(/^\\[[^\\]]+\\] /,'')}</span><b>{x.ton.toFixed(2)}</b><small>{(x.ton/sum*100).toFixed(1)}%</small></div>)}</div></div>}
function Empty({icon,title,desc}){return <div className="empty"><div className="empty-icon">{icon}</div><strong>{title}</strong><p>{desc}</p></div>}
function Placeholder({title,icon,desc,go}){return <div className="panel full"><h2>{title}</h2><Empty icon={icon} title="อยู่ระหว่างพัฒนา" desc={desc}/><button className="text-action" onClick={()=>go('dashboard')}>← กลับภาพรวม</button></div>}
createRoot(document.getElementById('root')).render(<App/>);