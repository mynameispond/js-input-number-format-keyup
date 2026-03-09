# Input Number Format Keyup (Vanilla JS)

A lightweight JavaScript utility that formats numeric input automatically while typing.

It adds thousands separators, controls decimal precision, preserves cursor position, and supports dynamically created inputs (e.g., AJAX).

The script has **no dependencies** and is optimized to avoid unnecessary processing.

---

# Features

* Pure **Vanilla JavaScript**
* Automatic **thousands separator** (`1,000,000`)
* Configurable **decimal precision**
* Cursor position **preserved while typing**
* Works with **dynamic inputs (AJAX)**
* **Paste auto-clean**
* Supports **Ctrl+V from Excel**
* Optional **min / max validation**
* Optional **step rounding**
* Optional **disable negative numbers**
* Supports **Ctrl+A / Ctrl+C / Ctrl+X**

---

# Installation

Include the script in your page.

```html
<script src="input-number-format-keyup.optimized.js"></script>
```

No initialization required.

---

# Basic Usage

Add the class to your input.

```html
<input type="text" class="input-number-format-keyup">
```

Example behavior:

```
1000 → 1,000.00
```

---

# Configuration (HTML Attributes)

All configuration is done using HTML `data-*` attributes.

---

# Decimal Places

Default: **2**

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

# Minimum / Maximum Value

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

# Step Rounding

Round values to the nearest step when leaving the input.

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

If `data-min` is defined, step rounding uses it as the base.

---

# Allow / Disallow Negative Numbers

Negative numbers are allowed by default.

Disable negative values:

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

The script automatically cleans pasted content.

Example paste:

```
abc 1,234.56 xyz
```

Result:

```
1,234.56
```

---

# Excel Paste Support

When pasting data copied from Excel, multiple values may exist.

Example clipboard:

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

# Keyboard Shortcuts

Supported shortcuts:

| Shortcut | Behavior           |
| -------- | ------------------ |
| Ctrl + A | Select all text    |
| Ctrl + C | Copy               |
| Ctrl + X | Cut                |
| Ctrl + V | Paste (auto clean) |

---

# Dynamic Inputs (AJAX)

Inputs created dynamically after page load work automatically.

Example:

```javascript
document.body.insertAdjacentHTML(
  "beforeend",
  '<input class="input-number-format-keyup">'
);
```

No reinitialization required.

---

# Performance

The script is optimized for performance:

* Uses **event delegation**
* Avoids duplicate processing
* Updates value only when necessary
* Moves cursor only when position changes

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

# Browser Support

Works in all modern browsers:

* Chrome
* Edge
* Firefox
* Safari

---

# License

MIT
