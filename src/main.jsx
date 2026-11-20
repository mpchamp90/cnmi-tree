import React, {useEffect,useMemo,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {MapContainer,TileLayer,Marker,Popup} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './style.css';
// Leaflet marker icons must use the Vite base path rather than relative asset URLs.
const pin = L.divIcon({html:'<span class="pin">🌳</span>',className:'',iconSize:[30,30],iconAnchor:[15,15]});
const tabs=[['dashboard','ภาพรวม'],['trees','ทะเบียนต้นไม้'],['map','แผนที่'],['staff','เจ้าหน้าที่']];
function App(){
 const [page,setPage]=useState('dashboard'),[trees,setTrees]=useState([]),[error,setError]=useState(''),[query,setQuery]=useState(''),[selected,setSelected]=useState(null);
 useEffect(()=>{fetch(`${import.meta.env.BASE_URL}data/trees.json`,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error(`HTTP ${r.status}`);return r.json()}).then(data=>{if(!Array.isArray(data))throw Error('ข้อมูลต้องเป็น array');setTrees(data)}).catch(e=>setError(`โหลดข้อมูลไม่ได้: ${e.message}`))},[]);
 const filtered=useMemo(()=>trees.filter(t=>[t.tree_uid,t.tree_id,t.species,t.area_id].some(x=>String(x||'').toLowerCase().includes(query.toLowerCase()))),[trees,query]);
 const mapped=filtered.filter(t=>Number.isFinite(Number(t.latitude))&&Number.isFinite(Number(t.longitude))&&t.latitude!==''&&t.longitude!=='');
 const areas=new Set(trees.map(t=>t.area_id).filter(Boolean)).size;
 const staffUrl=import.meta.env.VITE_STAFF_APP_URL;
 return <div className="app"><header><div><h1>🌳 CNMI Tree</h1><p>ทะเบียนและการจัดการต้นไม้ • ข้อมูลสาธารณะ</p></div><span className="version">v0.1</span></header><nav>{tabs.map(([id,label])=><button key={id} className={page===id?'active':''} onClick={()=>{setPage(id);setSelected(null)}}>{label}</button>)}</nav><main>
 {error&&<p className="error">{error}</p>}
 {page==='dashboard'&&<><h2>ภาพรวมทะเบียนต้นไม้</h2><section className="stats"><article><strong>{trees.length.toLocaleString('th-TH')}</strong><span>ต้นในชุดข้อมูลเผยแพร่</span></article><article><strong>{areas}</strong><span>พื้นที่</span></article><article><strong>{trees.filter(t=>t.latitude!==''&&t.longitude!==''&&Number.isFinite(Number(t.latitude))&&Number.isFinite(Number(t.longitude))).length}</strong><span>ต้นที่มีพิกัด</span></article></section><div className="notice">ข้อมูลในเว็บนี้เป็นข้อมูลที่อนุมัติให้เผยแพร่เท่านั้น ไม่ใช่ทะเบียนภายในทั้งหมด และอาจอัปเดตเป็นรอบ</div>{trees.length===0&&<p>ยังไม่ได้เชื่อมข้อมูลจริง กรุณาจัดทำชุดข้อมูลเผยแพร่ก่อน</p>}</>}
 {page==='trees'&&<><h2>ค้นหาต้นไม้</h2><input aria-label="ค้นหาต้นไม้" placeholder="ค้นหา Tree_UID, Tree_ID, ชนิด หรือพื้นที่" value={query} onChange={e=>setQuery(e.target.value)}/><p>{filtered.length} รายการ</p>{selected?<article className="detail"><button onClick={()=>setSelected(null)}>← กลับสู่รายการ</button><h3>{selected.species||'ไม่ระบุชนิด'}</h3><p><b>Tree_UID:</b> {selected.tree_uid}</p><p><b>Tree_ID:</b> {selected.tree_id}</p><p><b>พื้นที่:</b> {selected.area_id||'ไม่ระบุ'}</p><p><b>ความสูง:</b> {selected.height_m??'ไม่ระบุ'} เมตร</p><p>ประวัติการดูแลจะเชื่อมในระยะถัดไป</p></article>:<div className="list">{filtered.map(t=><button key={t.tree_uid} className="tree" onClick={()=>setSelected(t)}><b>{t.species||'ไม่ระบุชนิด'}</b><span>{t.tree_id}</span><small>{t.tree_uid} · {t.area_id||'—'}</small></button>)}</div>}</>}
 {page==='map'&&<><h2>แผนที่ต้นไม้</h2><input aria-label="กรองแผนที่" placeholder="กรองรหัส ชนิด หรือพื้นที่" value={query} onChange={e=>setQuery(e.target.value)}/>{mapped.length?<div className="map"><MapContainer key={mapped[0].tree_uid} center={[Number(mapped[0].latitude),Number(mapped[0].longitude)]} zoom={16} scrollWheelZoom={false} style={{height:'100%',width:'100%'}}><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>{mapped.map(t=><Marker key={t.tree_uid} icon={pin} position={[Number(t.latitude),Number(t.longitude)]}><Popup><b>{t.species||'ต้นไม้'}</b><br/>{t.tree_id}<br/>{t.tree_uid}</Popup></Marker>)}</MapContainer></div>:<div className="notice">ยังไม่มีพิกัดต้นไม้ที่อนุญาตให้เผยแพร่</div>}</>}
 {page==='staff'&&<><h2>ระบบเจ้าหน้าที่</h2><p>การบันทึกกิจกรรม การย้ายปลูก และคำสั่งงาน จะทำผ่าน Google Apps Script Web App ที่จำกัดสิทธิ์การเข้าถึง</p>{staffUrl?<a className="cta" href={staffUrl} target="_blank" rel="noopener noreferrer">เปิดระบบบันทึกสำหรับเจ้าหน้าที่ ↗</a>:<div className="notice">ยังไม่ได้กำหนดลิงก์ Apps Script Web App กรุณาตั้งค่า VITE_STAFF_APP_URL หลังติดตั้งระบบที่ตรวจสอบสิทธิ์แล้ว</div>}<p className="muted">ปุ่มหรือลิงก์บน GitHub Pages ไม่ใช่ระบบป้องกันการเข้าถึง สิทธิ์ต้องตรวจสอบใน Apps Script ฝั่งเซิร์ฟเวอร์</p></>}
 </main><footer>CNMI Tree • Prototype v0.1 • Public read-only portal</footer></div>
}
createRoot(document.getElementById('root')).render(<App/>);
