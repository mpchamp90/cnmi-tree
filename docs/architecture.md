# สถาปัตยกรรม CNMI Tree

## สองระดับการเข้าถึง

- **สาธารณะ**: React + Vite + Leaflet บน GitHub Pages อ่านไฟล์ JSON ที่อนุมัติให้เผยแพร่เท่านั้น
- **เจ้าหน้าที่**: Google Apps Script Web App (ยังไม่ติดตั้ง) ต้องจำกัดผู้ใช้และตรวจสอบสิทธิ์ฝั่งเซิร์ฟเวอร์ก่อนเขียนข้อมูล
- **แหล่งข้อมูลต้นฉบับ**: CNMI Tree (แท็บพื้นที่)
- **ข้อมูลรวม**: CNMI Tree Master (`Stem_Data`, `Tree`, `Tree_Registry`, `Tree_ID_History`)
- **กิจกรรม**: CNMI Tree Log (`Activity`, `Work_Order`, `Work_Order_Trees`)
- **มาตรฐานรหัส**: CNMI Tree Reference Data

## ข้อควรระวัง

1. GitHub Pages ไม่ใช่ระบบล็อกอินหรือ API ที่ปลอดภัยสำหรับการเขียนข้อมูล
2. อย่าเผยแพร่ spreadsheet ID ที่มีข้อมูลลับร่วมกับ token หรือ service credentials; อย่าใส่ข้อมูลส่วนบุคคลใน JSON สาธารณะ
3. การแสดงปุ่มเจ้าหน้าที่ไม่ใช่การตรวจสอบสิทธิ์
4. Apps Script ต้องตรวจสอบสิทธิ์การใช้งานจริงและกำหนด deployment access อย่างเหมาะสม
5. การย้ายปลูกต้องจัดการ UID เดิมก่อนรอบซิงก์ที่อาจสร้าง UID ใหม่
6. ควรทำข้อมูลสำรองและกำหนดเจ้าของระบบเป็นบัญชีหน่วยงานก่อนเปิดใช้งานจริง

## การเชื่อมข้อมูล (ยังไม่ทำ)

Tree ต้นฉบับ → Tree Master → ตรวจและคัดข้อมูลเผยแพร่ → JSON snapshot → GitHub Pages

เจ้าหน้าที่ → Apps Script Web App → ตรวจสิทธิ์/ตรวจข้อมูล/ออกเลข → Master และ Log

ข้อมูล JSON สาธารณะจะอัปเดตตามรอบที่กำหนด ไม่ใช่ real-time
