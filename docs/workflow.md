# Workflows

## 1. อ่านข้อมูลสาธารณะ (Phase 1)
เปิดเว็บ → Dashboard / ทะเบียน / แผนที่ → เลือก Tree_UID → รายละเอียด (ประวัติจะเพิ่มภายหลัง)

## 2. บันทึกกิจกรรม (Phase 3)
เลือกต้นไม้ → เปิด Apps Script Web App → ตรวจสิทธิ์ → ตรวจ Tree_UID → บันทึก Activity → ออก Log_ID แบบไม่ซ้ำด้วย LockService → เก็บ Tree_UID เป็นค่าคงที่ → แจ้งผล

## 3. ย้ายปลูก (Phase 4)
ระบุ Tree_UID → ขอเปลี่ยนจาก Old_Tree_ID เป็น New_Tree_ID → ตรวจความซ้ำและสิทธิ์ → รอผู้รับผิดชอบยืนยัน → ปรับแถวในแท็บพื้นที่ต้นฉบับให้ตรงกับการย้ายจริง → ปรับ Registry โดยคง Tree_UID เดิม → เพิ่ม Tree_ID_History → ซิงก์และตรวจความสอดคล้อง

ต้องออกแบบขั้นตอนแก้ไขต้นฉบับและ Registry ให้ป้องกันกรณีทำสำเร็จเพียงครึ่งเดียว; ห้ามให้ routine sync ออก UID ใหม่จาก Tree_ID ที่ย้ายโดยไม่ตรวจ pending move

## 4. Work Order (Phase 5)
สร้างคำสั่งงาน → ออก Work_Order_ID → เพิ่มต้นไม้ที่เกี่ยวข้องใน Work_Order_Trees → มอบหมาย → บันทึก Activity ตามงาน → ตรวจรับ/ปิดงาน

## แผนส่งมอบ
1. GitHub Pages โครงเว็บอ่าน JSON สาธารณะ (ใน ZIP นี้)
2. ตรวจสิทธิ์เผยแพร่ข้อมูลและทำตัวส่งออก JSON ที่ปลอดภัย
3. Apps Script Web App บันทึก Activity และออกเลขอัตโนมัติ
4. ย้ายปลูกและประวัติรหัส
5. Work Order
6. Tree Health / Tree Risk / Carbon / KPI
