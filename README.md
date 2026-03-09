# Number Format Input (Vanilla JS)

A simple JavaScript script to format number inputs automatically.

It works with normal HTML inputs and also supports inputs loaded dynamically (for example via AJAX).

---

## Features

* Automatically add comma separators (e.g. `1,000`)
* Supports decimal formatting
* Custom decimal places using `data-decimal`
* Keeps cursor position while typing
* Allows only `0-9`, `-`, `.`
* Works with dynamically added inputs (AJAX compatible)
* No dependencies (pure JavaScript)

---

## Installation

Include the JavaScript file in your page.

```html
<script src="number-format-input.js"></script>
```

---

## Usage

Add the class `input-number-format-keyup` to your input.

```html
<input type="text" class="input-number-format-keyup">
```

The script will automatically format the number while typing.

Example:

```
1000 → 1,000.00
```

---

## Decimal Settings

You can control decimal places using the `data-decimal` attribute.

### Default (2 decimals)

```html
<input type="text" class="input-number-format-keyup">
```

Result example:

```
1000 → 1,000.00
```

---

### 1 Decimal

```html
<input type="text" class="input-number-format-keyup" data-decimal="1">
```

Result example:

```
1000.5 → 1,000.5
```

---

### No Decimal

```html
<input type="text" class="input-number-format-keyup" data-decimal="0">
```

Result example:

```
1000 → 1,000
```

---

## Behavior

### While Typing

* Adds comma separators automatically
* Keeps cursor position
* Limits decimal digits based on `data-decimal`
* Allows only:

  * Numbers `0-9`
  * Minus `-`
  * Decimal point `.`

### On Blur (when input loses focus)

The script formats the number completely.

Examples:

```
1000 → 1,000.00
1000.5 → 1,000.50
```

---

## AJAX Support

You do not need to reinitialize the script.

Any new input with the class below will work automatically:

```html
<input class="input-number-format-keyup">
```

---

## Example

```html
<input type="text" class="input-number-format-keyup">
<input type="text" class="input-number-format-keyup" data-decimal="1">
<input type="text" class="input-number-format-keyup" data-decimal="0">
```

---

## License

Free to use for personal or commercial projects.
