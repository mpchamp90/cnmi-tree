# Data dictionary (ข้อมูลปัจจุบันและ schema เว็บ)

## Master / Tree (ตรวจจากไฟล์จริง 19 พ.ย. 2026)
`Area_ID`, `Tree_ID`, `Species`, `Location`, `Height_m`, `Crown_m`, `Stem_Count`, `DBH_Max_cm`, `CO2e_Total_ton`

## Master / Tree_Registry
`Tree_UID`, `Current_Tree_ID`, `Original_Tree_ID`, `Status`, `Registered_Date`, `Last_Updated`, `Remark`

## Master / Tree_ID_History
`Tree_UID`, `Old_Tree_ID`, `New_Tree_ID`, `Change_Date`, `Reason`, `Changed_By`, `Remark`

## Log / Activity (ตรวจจากไฟล์จริง)
`Log_ID`, `Tree_UID`, `Tree_ID`, `Activity_Date`, `Activity_Type`, `รายละเอียดการดำเนินงาน`, `ผู้ดำเนินการ`, `ผู้บันทึก`, `Follow_Up_Date`, `หมายเหตุ`, `Work_Order_ID`, `Old_Tree_ID`, `New_Tree_ID`, `Move_Status`

## Log / Work_Order
`Work_Order_ID`, `Created_Date`, `Area_ID`, `Work_Type`, `Work_Description`, `Priority`, `Due_Date`, `Assigned_To`, `Requested_By`, `Status`, `Sent_Date`, `PDF_URL`, `Email_Reference`, `Photo_URLs`, `Remark`

## Log / Work_Order_Trees
`Work_Order_ID`, `Tree_ID`, `Tree_Specific_Task`, `Photo_URLs`, `Status`, `Completed_Date`, `Inspected_By`, `Inspection_Date`, `Remark`, `Tree_UID`

## JSON สำหรับเว็บสาธารณะ (ออกแบบใหม่ ยังไม่เชื่อม)
```json
[
  {
    "tree_uid": "<immutable UID>",
    "tree_id": "<current location ID>",
    "species": "<species>",
    "area_id": "<area>",
    "height_m": null,
    "latitude": null,
    "longitude": null
  }
]
```

`Location` จากต้นฉบับเป็นข้อความ `lat , lon`; ตัวส่งออกข้อมูลต้องแยก ตรวจสอบช่วงพิกัด และกรองข้อมูลก่อนเผยแพร่ ตัวอย่าง JSON ข้างต้นเป็น **schema** ไม่ใช่ข้อมูลต้นไม้จริง

**ข้อสำคัญ:** UID ต้องเก็บเป็นค่า snapshot ในบันทึกกิจกรรม ไม่พึ่งสูตร lookup ที่เปลี่ยนตาม Tree_ID ปัจจุบันเพียงอย่างเดียว
