# Number Format Input (Vanilla JS)

A lightweight JavaScript utility that automatically formats number inputs while typing.

It adds thousands separators, controls decimal precision, keeps the cursor position stable, and supports dynamic inputs loaded via AJAX.

No dependencies required.

---

# Features

* Works with **plain JavaScript (no jQuery)**
* **Auto thousands separator** (1,000,000)
* **Configurable decimal places**
* **Cursor position preserved while typing**
* **Supports dynamically added inputs (AJAX)**
* **Auto format on blur**
* **Paste auto-clean**
* **Supports paste from Excel**
* **Optional min / max validation**
* **Optional step rounding**

---

# Installation

Just include the script in your page.

```html
<script src="number-format-input.js"></script>
```

No initialization required.

---

# Basic Usage

Add the class:

```html
<input type="text" class="input-number-format-keyup">
```

Typing:

```
1000 → 1,000.00
```

---

# Options (HTML Attributes)

## Decimal Places

Default: `2`

```html
<input class="input-number-format-keyup" data-decimal="1">
```

Example:

```
1000.5 → 1,000.5
```

Disable decimals:

```html
<input class="input-number-format-keyup" data-decimal="0">
```

---

## Minimum / Maximum Value

```html
<input
class="input-number-format-keyup"
data-min="0"
data-max="1000">
```

Values outside the range will be clamped on blur.

Example:

```
2000 → 1,000.00
```

---

## Step Rounding

Round values to the nearest step when leaving the field.

```html
<input
class="input-number-format-keyup"
data-step="0.25"
data-decimal="2">
```

Example:

```
1.12 → 1.00
1.13 → 1.25
```

Step works with `min` as the base if provided.

---

## Allow / Disallow Negative Numbers

Default: allowed

```html
<input
class="input-number-format-keyup"
data-allow-negative="0">
```

Example:

```
-100 → 100
```

---

# Paste Handling

The script automatically cleans pasted text.

Example:

Paste:

```
abc 1,234.56 xyz
```

Result:

```
1,234.56
```

---

# Excel Paste Support

When pasting from Excel, multiple values may exist.

Example clipboard data:

```
1234.56\t999
```

or

```
1234.56
999
```

The script automatically extracts the **first cell value**.

Result:

```
1,234.56
```

---

# Dynamic Inputs (AJAX)

Inputs added after page load are supported automatically.

Example:

```javascript
document.body.insertAdjacentHTML(
    'beforeend',
    '<input class="input-number-format-keyup">'
);
```

No reinitialization required.

---

# Example

```html
<input
type="text"
class="input-number-format-keyup"
data-decimal="2"
data-step="0.25"
data-min="0"
data-max="1000"
data-allow-negative="0">
```

---

# Behavior Summary

| Feature             | Description                   |
| ------------------- | ----------------------------- |
| Thousands separator | Automatically added           |
| Decimal precision   | Controlled by `data-decimal`  |
| Cursor stability    | Cursor stays logical position |
| Step rounding       | Applied on blur               |
| Paste cleaning      | Removes invalid characters    |
| Excel paste         | Extracts first cell           |
| Dynamic inputs      | Works with AJAX               |

---

# Browser Support

All modern browsers:

* Chrome
* Edge
* Firefox
* Safari

---

# License

MIT
