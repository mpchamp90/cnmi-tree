# CNMI Tree — v0.1

เว็บทะเบียนต้นไม้สาธารณะ (read-only) บน GitHub Pages และแผนพัฒนาระบบบันทึกสำหรับเจ้าหน้าที่ด้วย Google Apps Script Web App

## เริ่มใช้งานในเครื่อง

ต้องมี Node.js 20 ขึ้นไป

```bash
npm install
npm run dev
```

เปิด URL ที่ Vite แสดงใน Terminal

## เผยแพร่ GitHub Pages

1. สร้าง GitHub repository ชื่อ `cnmi-tree` (แนะนำ private ระหว่างพัฒนา; ตรวจสอบสิทธิ์ GitHub Pages ตามแผนบัญชี)
2. อัปโหลดไฟล์ทั้งหมดใน ZIP **โดยให้ไฟล์ package.json อยู่ที่ root**
3. ชุดเริ่มต้นนี้ยังไม่มี `package-lock.json` (GitHub Actions จะใช้ `npm install`); แนะนำสร้าง lockfile และ commit เมื่อพร้อมเพื่อให้ build ทำซ้ำได้แน่นอน
4. ไปที่ Settings → Pages → Build and deployment → Source: **GitHub Actions**
5. Push ไปที่ `main` และดูผลที่แท็บ Actions
6. URL โดยทั่วไป `https://USERNAME.github.io/cnmi-tree/` (ขึ้นกับชื่อ repo)

**ข้อควรระวัง:** เว็บ GitHub Pages ที่เผยแพร่ถือเป็นเว็บสาธารณะ ห้ามใส่ข้อมูลส่วนบุคคล ความลับ คีย์ API หรือข้อมูลภายในที่ไม่อนุมัติให้เผยแพร่ แม้ repo เป็น private ก็ไม่ควรถือว่าเว็บ Pages เป็นระบบภายใน

## ข้อมูลต้นไม้

`public/data/trees.json` เริ่มต้นเป็น `[]` เพื่อไม่สร้างข้อมูลจำลอง เปิดเผยเฉพาะข้อมูลที่หน่วยงานอนุมัติ รายละเอียด schema อยู่ที่ `docs/data-dictionary.md` ข้อมูลในไฟล์นี้ถูกเผยแพร่ให้ทุกคนเข้าถึงได้

## เจ้าหน้าที่

ใน `.env` กำหนด `VITE_STAFF_APP_URL` เป็น URL ของ Apps Script Web App ที่ติดตั้งและจำกัดสิทธิ์แล้ว **ไม่ใช่รหัสผ่านหรือ secret** เมื่อใช้ GitHub Actions ต้องกำหนด env ใน workflow build step ด้วย หรือกำหนดลิงก์ผ่านโค้ดหลังตั้งค่าเว็บบันทึกแล้ว

**ยังไม่มีระบบบันทึกจริงในชุดนี้** และยังไม่มี API หรือการซิงก์จาก Google Sheets อัตโนมัติ

## เอกสาร

- `docs/architecture.md` — สถาปัตยกรรมและความปลอดภัย
- `docs/data-dictionary.md` — โครงสร้างข้อมูล
- `docs/workflow.md` — เส้นทางการใช้งานและลำดับพัฒนา
- `apps-script/README.md` — แผนระบบบันทึก
