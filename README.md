# Input Number Format Keyup (Vanilla JS)

สคริปต์ JavaScript ขนาดเล็กสำหรับจัดรูปแบบตัวเลขใน `<input>` อัตโนมัติระหว่างพิมพ์  
เช่น ใส่ comma หลักพัน, คุมจำนวนทศนิยม, และปรับค่าตามเงื่อนไขที่กำหนด

จุดเด่นคือใช้ได้ทันที ไม่ต้องติดตั้งไลบรารีเพิ่ม และรองรับ input ที่สร้างทีหลัง (เช่นจาก AJAX)

---

## สิ่งที่ได้ทันทีเมื่อใช้งาน

- จัด comma หลักพันอัตโนมัติ (`1000000` -> `1,000,000`)
- ควบคุมจำนวนทศนิยมได้
- รักษาตำแหน่งเคอร์เซอร์ขณะพิมพ์
- วางข้อมูล (Paste) แล้วทำความสะอาดข้อความให้อัตโนมัติ
- รองรับการวางค่าจาก Excel
- รองรับ input ที่ถูกเพิ่มเข้ามาแบบ dynamic
- ตั้งค่า `min`, `max`, `step`, และเปิด/ปิดค่าติดลบได้

---

## เริ่มใช้งานแบบเร็ว (มือใหม่)

### 1) ใส่ไฟล์สคริปต์ในหน้าเว็บ

```html
<script src="input-number-format-keyup.js"></script>
```

### 2) ใส่ class ให้ input ที่ต้องการ

```html
<input type="text" class="input-number-format-keyup">
```

### 3) ลองพิมพ์ตัวเลข

- ตอนพิมพ์ `1000` จะเห็นเป็น `1,000`
- ตอนออกจากช่อง (blur) จะเป็น `1,000.00` (ค่าเริ่มต้นทศนิยม 2 ตำแหน่ง)

เสร็จแล้ว ใช้งานได้เลยโดยไม่ต้องเขียนโค้ดเริ่มต้นเพิ่ม

---

## ตัวอย่างพร้อมใช้งาน

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Input Number Format Demo</title>
</head>
<body>
  <label>จำนวนเงิน</label>
  <input type="text" class="input-number-format-keyup">

  <script src="input-number-format-keyup.js"></script>
</body>
</html>
```

---

## การตั้งค่าเพิ่มเติม (ผ่าน `data-*`)

ถ้าไม่ใส่ค่าใดๆ ระบบจะใช้ค่าเริ่มต้นให้อัตโนมัติ

| Attribute | ค่าเริ่มต้น | ความหมาย |
| --- | --- | --- |
| `data-decimal` | `2` | จำนวนทศนิยม |
| `data-min` | ไม่กำหนด | ค่าต่ำสุด (เช็คตอน blur) |
| `data-max` | ไม่กำหนด | ค่าสูงสุด (เช็คตอน blur) |
| `data-step` | ไม่กำหนด | ปัดค่าเป็นช่วง step ตอน blur |
| `data-allow-negative` | `1` | อนุญาตค่าติดลบ (`0` = ไม่อนุญาต) |

---

## ตัวอย่างการตั้งค่าที่พบบ่อย

### 1) กำหนดทศนิยม 1 ตำแหน่ง

```html
<input type="text" class="input-number-format-keyup" data-decimal="1">
```

ตัวอย่าง: `1000.5` -> `1,000.5`

### 2) ไม่ใช้ทศนิยม

```html
<input type="text" class="input-number-format-keyup" data-decimal="0">
```

### 3) จำกัดช่วงค่า (Min / Max)

```html
<input
  type="text"
  class="input-number-format-keyup"
  data-min="0"
  data-max="1000">
```

ตัวอย่าง: ใส่ `2000` แล้วออกจากช่อง จะถูกปรับเป็น `1,000.00`

### 4) ปัดค่าตาม Step

```html
<input
  type="text"
  class="input-number-format-keyup"
  data-step="0.25"
  data-decimal="2">
```

ตัวอย่าง:

- `1.12` -> `1.00`
- `1.13` -> `1.25`

หมายเหตุ: ถ้ากำหนด `data-min` ระบบจะใช้ `min` เป็นฐานในการคำนวณ step

### 5) ไม่อนุญาตค่าติดลบ

```html
<input
  type="text"
  class="input-number-format-keyup"
  data-allow-negative="0">
```

ตัวอย่าง: `-100` -> `100`

---

## พฤติกรรมการวางข้อมูล (Paste)

รองรับการวางข้อความที่มีตัวอักษรปนมา เช่น:

`abc 1,234.56 xyz` -> `1,234.56`

รองรับการวางจาก Excel (หลายเซลล์) โดยจะดึงค่าเซลล์แรกให้อัตโนมัติ เช่น:

- `1234.56\t999`
- `1234.56` ขึ้นบรรทัดใหม่ `999`

ผลลัพธ์: `1,234.56`

---

## คีย์ลัดที่รองรับ

| คีย์ลัด | การทำงาน |
| --- | --- |
| Ctrl/Cmd + A | เลือกข้อความทั้งหมด |
| Ctrl/Cmd + C | คัดลอก |
| Ctrl/Cmd + X | ตัด |
| Ctrl/Cmd + V | วาง (พร้อมทำความสะอาดข้อมูล) |

---

## ใช้กับ input ที่สร้างทีหลังได้เลย (AJAX/Dynamic)

ไม่ต้อง re-init

```javascript
document.body.insertAdjacentHTML(
  "beforeend",
  '<input type="text" class="input-number-format-keyup">'
);
```

---

## คำแนะนำสำหรับมือใหม่

- ใช้ `type="text"` กับช่องนี้ (ไม่แนะนำ `type="number"` ถ้าต้องการ format เอง)
- ใส่ `<script src="input-number-format-keyup.js"></script>` หลัง input หรือท้าย `<body>` จะเริ่มง่ายสุด
- ถ้าต้องการค่าจริงไปคำนวณฝั่ง backend ให้ลบ comma ก่อนส่ง

---

## ถ้าต้องการตั้งค่าเพิ่ม ควรเริ่มอย่างไร

แนะนำเริ่มจาก 3 ค่าแรกก่อน:

1. `data-decimal` เพื่อกำหนดจำนวนทศนิยมให้ตรงธุรกิจ
2. `data-min` / `data-max` เพื่อกันค่าหลุดช่วง
3. `data-step` เมื่อต้องการปัดค่าเป็นหน่วย เช่น 0.25, 0.50, 1.00

จากนั้นค่อยเพิ่ม `data-allow-negative="0"` ในช่องที่ไม่ควรติดลบ

---

## Browser Support

รองรับเบราว์เซอร์สมัยใหม่:

- Chrome
- Edge
- Firefox
- Safari

---

## License

MIT
