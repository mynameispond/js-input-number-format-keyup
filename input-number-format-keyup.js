(function () {
	const INFK_SELECTOR = ".input-number-format-keyup";
	const INFK_DEFAULT_DECIMAL = 2;
	const INFK_ALLOWED_CHAR_REGEX = /[^0-9.\-]/g;
	const INFK_VALID_CURSOR_CHAR_REGEX = /[^0-9.\-]/g;
	const INFK_VALID_CHAR_TEST_REGEX = /[0-9.\-]/;

	function __infkGetDecimalPlaces(el) {
		const v = parseInt(el.dataset.decimal, 10);
		return isNaN(v) ? INFK_DEFAULT_DECIMAL : Math.max(0, v);
	}

	function __infkGetMin(el) {
		const v = parseFloat(el.dataset.min);
		return isNaN(v) ? null : v;
	}

	function __infkGetMax(el) {
		const v = parseFloat(el.dataset.max);
		return isNaN(v) ? null : v;
	}

	function __infkGetStep(el) {
		const v = parseFloat(el.dataset.step);
		return isNaN(v) || v <= 0 ? null : v;
	}

	function __infkAllowNegative(el) {
		return el.dataset.allowNegative !== "0";
	}

	function __infkCountStepDecimals(step) {
		if (!step) return 0;
		const s = String(step);

		if (s.indexOf("e-") > -1) {
			return parseInt(s.split("e-")[1], 10) || 0;
		}

		const parts = s.split(".");
		return parts[1] ? parts[1].length : 0;
	}

	function __infkSanitize(value, decimal, allowNeg) {
		value = String(value || "");
		value = value.replace(INFK_ALLOWED_CHAR_REGEX, "");

		if (!allowNeg) {
			value = value.replace(/\-/g, "");
		}

		value = value.replace(/(?!^)-/g, "");

		if (decimal === 0) {
			return value.replace(/\./g, "");
		}

		const dot = value.indexOf(".");
		if (dot !== -1) {
			value =
				value.substring(0, dot + 1) +
				value.substring(dot + 1).replace(/\./g, "");
		}

		return value;
	}

	function __infkSanitizePastedText(text, decimal, allowNeg) {
		text = String(text || "").trim();
		text = text.split(/\r?\n/)[0];
		text = text.split("\t")[0];
		text = text.replace(/\s+/g, "");
		text = text.replace(/[^0-9,.\-]/g, "");

		const hasComma = text.indexOf(",") !== -1;
		const hasDot = text.indexOf(".") !== -1;

		if (hasComma && hasDot) {
			text = text.replace(/,/g, "");
		} else if (hasComma) {
			const commaCount = (text.match(/,/g) || []).length;

			if (commaCount === 1 && decimal > 0) {
				const parts = text.split(",");
				const right = parts[1] || "";

				if (right.length > 0 && right.length <= decimal) {
					text = parts[0] + "." + right;
				} else {
					text = text.replace(/,/g, "");
				}
			} else {
				text = text.replace(/,/g, "");
			}
		}

		return __infkSanitize(text, decimal, allowNeg);
	}

	function __infkAddComma(intStr) {
		return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	function __infkNormalizeInt(intStr) {
		intStr = intStr || "0";
		return intStr.replace(/^0+(?=\d)/, "");
	}

	function __infkFormatTyping(raw, decimal) {
		if (!raw || raw === "-" || raw === "." || raw === "-.") {
			return raw;
		}

		const neg = raw.charAt(0) === "-";
		if (neg) raw = raw.substring(1);

		const parts = raw.split(".");
		const intPart = __infkAddComma(__infkNormalizeInt(parts[0]));
		let dec = parts[1] || "";

		if (dec.length > decimal) {
			dec = dec.substring(0, decimal);
		}

		let out = neg ? "-" + intPart : intPart;

		if (raw.indexOf(".") !== -1 && decimal > 0) {
			out += "." + dec;
		}

		return out;
	}

	function __infkClamp(num, min, max) {
		if (min !== null && num < min) num = min;
		if (max !== null && num > max) num = max;
		return num;
	}

	function __infkRoundToStep(num, step, min) {
		if (!step || !isFinite(num)) return num;

		const base = min !== null ? min : 0;
		const ratio = (num - base) / step;
		const snapped = Math.round(ratio) * step + base;
		const precision = Math.max(__infkCountStepDecimals(step), 10);

		return parseFloat(snapped.toFixed(precision));
	}

	function __infkFormatBlur(raw, decimal, min, max, step) {
		if (!raw || raw === "-" || raw === "." || raw === "-.") {
			return "";
		}

		raw = raw.replace(/,/g, "");

		let num = parseFloat(raw);
		if (isNaN(num)) return "";

		num = __infkClamp(num, min, max);

		if (step) {
			num = __infkRoundToStep(num, step, min);
			num = __infkClamp(num, min, max);
		}

		const fixed = num.toFixed(decimal);
		const parts = fixed.split(".");
		let out = __infkAddComma(parts[0]);

		if (decimal > 0) {
			out += "." + parts[1];
		}

		return out;
	}

	function __infkCountValidCharsBeforeCursor(str, pos) {
		return str.substring(0, pos).replace(INFK_VALID_CURSOR_CHAR_REGEX, "")
			.length;
	}

	function __infkFindCursorFromValidCount(str, count) {
		if (count <= 0) return 0;

		let currentCount = 0;
		for (let i = 0; i < str.length; i++) {
			if (INFK_VALID_CHAR_TEST_REGEX.test(str.charAt(i))) {
				currentCount++;
			}
			if (currentCount >= count) {
				return i + 1;
			}
		}

		return str.length;
	}

	function __infkInsertTextAtCursor(el, text) {
		const start = el.selectionStart || 0;
		const end = el.selectionEnd || 0;
		const oldValue = el.value || "";
		const newValue = oldValue.slice(0, start) + text + oldValue.slice(end);

		if (newValue !== oldValue) {
			el.value = newValue;
		}

		const pos = start + text.length;
		try {
			el.setSelectionRange(pos, pos);
		} catch (e) {}
	}

	function __infkHandleTyping(el) {
		const decimal = __infkGetDecimalPlaces(el);
		const allowNeg = __infkAllowNegative(el);
		const oldValue = el.value;
		const oldCursor = el.selectionStart || 0;
		const validCount = __infkCountValidCharsBeforeCursor(oldValue, oldCursor);
		const raw = __infkSanitize(oldValue, decimal, allowNeg);
		const formatted = __infkFormatTyping(raw, decimal);

		if (formatted !== oldValue) {
			el.value = formatted;
		}

		const newCursor = __infkFindCursorFromValidCount(formatted, validCount);

		if (newCursor !== oldCursor) {
			try {
				el.setSelectionRange(newCursor, newCursor);
			} catch (e) {}
		}
	}

	function __infkHandleBlur(el) {
		const decimal = __infkGetDecimalPlaces(el);
		const min = __infkGetMin(el);
		const max = __infkGetMax(el);
		const step = __infkGetStep(el);
		const allowNeg = __infkAllowNegative(el);
		const raw = __infkSanitize(el.value, decimal, allowNeg);
		const formatted = __infkFormatBlur(raw, decimal, min, max, step);

		if (formatted !== el.value) {
			el.value = formatted;
		}
	}

	function __infkIsShortcutKey(e) {
		if (!e.ctrlKey && !e.metaKey) return false;
		const key = String(e.key || "").toLowerCase();
		return key === "a" || key === "c" || key === "x";
	}

	document.addEventListener("input", function (e) {
		const el = e.target;
		if (!el || !el.matches || !el.matches(INFK_SELECTOR)) return;
		__infkHandleTyping(el);
	});

	document.addEventListener("keydown", function (e) {
		const el = e.target;
		if (!el || !el.matches || !el.matches(INFK_SELECTOR)) return;

		if (__infkIsShortcutKey(e)) {
			if (
				(e.ctrlKey || e.metaKey) &&
				String(e.key || "").toLowerCase() === "a"
			) {
				setTimeout(function () {
					el.select();
				}, 0);
			}
		}
	});

	document.addEventListener(
		"blur",
		function (e) {
			const el = e.target;
			if (!el || !el.matches || !el.matches(INFK_SELECTOR)) return;
			__infkHandleBlur(el);
		},
		true,
	);

	document.addEventListener(
		"focus",
		function (e) {
			const el = e.target;
			if (!el || !el.matches || !el.matches(INFK_SELECTOR)) return;

			setTimeout(function () {
				el.select();
			}, 0);
		},
		true,
	);

	document.addEventListener("paste", function (e) {
		const el = e.target;
		if (!el || !el.matches || !el.matches(INFK_SELECTOR)) return;

		e.preventDefault();

		const decimal = __infkGetDecimalPlaces(el);
		const allowNeg = __infkAllowNegative(el);
		const clipboard = e.clipboardData || window.clipboardData;
		const pastedText = clipboard ? clipboard.getData("text") : "";
		const cleaned = __infkSanitizePastedText(pastedText, decimal, allowNeg);

		__infkInsertTextAtCursor(el, cleaned);
		__infkHandleTyping(el);
	});
})();
