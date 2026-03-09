(function () {
	const SELECTOR = ".input-number-format-keyup";
	const DEFAULT_DECIMAL = 2;

	function getDecimalPlaces(el) {
		let v = parseInt(el.dataset.decimal, 10);
		return isNaN(v) ? DEFAULT_DECIMAL : Math.max(0, v);
	}

	function getMin(el) {
		let v = parseFloat(el.dataset.min);
		return isNaN(v) ? null : v;
	}

	function getMax(el) {
		let v = parseFloat(el.dataset.max);
		return isNaN(v) ? null : v;
	}

	function getStep(el) {
		let v = parseFloat(el.dataset.step);
		return isNaN(v) || v <= 0 ? null : v;
	}

	function allowNegative(el) {
		return el.dataset.allowNegative !== "0";
	}

	function countStepDecimals(step) {
		if (!step) return 0;
		const s = String(step);
		if (s.indexOf("e-") > -1) {
			return parseInt(s.split("e-")[1], 10) || 0;
		}
		const parts = s.split(".");
		return parts[1] ? parts[1].length : 0;
	}

	function sanitize(value, decimal, allowNeg) {
		value = String(value || "");

		// เหลือเฉพาะตัวที่อนุญาต
		value = value.replace(/[^0-9.\-]/g, "");

		if (!allowNeg) {
			value = value.replace(/\-/g, "");
		}

		// อนุญาต - ได้เฉพาะตัวแรก
		value = value.replace(/(?!^)-/g, "");

		// ถ้าไม่ให้มีทศนิยม ตัด . ออกทั้งหมด
		if (decimal === 0) {
			value = value.replace(/\./g, "");
			return value;
		}

		// อนุญาต . ได้แค่ตัวเดียว
		const dot = value.indexOf(".");
		if (dot !== -1) {
			value =
				value.substring(0, dot + 1) +
				value.substring(dot + 1).replace(/\./g, "");
		}

		return value;
	}

	function sanitizePastedText(text, decimal, allowNeg) {
		text = String(text || "").trim();

		// รองรับการ paste จาก Excel / multi-cell:
		// เอาค่า cell แรกสุดมาก่อน
		text = text.split(/\r?\n/)[0];
		text = text.split("\t")[0];

		// ลบ space
		text = text.replace(/\s+/g, "");

		// รองรับกรณีมี comma คั่นหลักพัน หรือมีข้อความปน
		// เหลือเฉพาะ 0-9 . - ,
		text = text.replace(/[^0-9,.\-]/g, "");

		// heuristic:
		// - ถ้ามีทั้ง , และ . => ถือว่า , เป็น thousands separator แล้วลบทิ้ง
		// - ถ้ามีแต่ , และไม่มี . :
		//      ถ้ามี , ตัวเดียว และด้านหลังยาว <= decimal และ decimal > 0
		//      ให้มองว่าเป็น decimal separator เช่น 12,5 -> 12.5
		//      นอกนั้นถือว่าเป็น thousands separator แล้วลบทิ้ง
		const hasComma = text.indexOf(",") !== -1;
		const hasDot = text.indexOf(".") !== -1;

		if (hasComma && hasDot) {
			text = text.replace(/,/g, "");
		} else if (hasComma && !hasDot) {
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

		return sanitize(text, decimal, allowNeg);
	}

	function comma(x) {
		return x.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	function normalizeInt(x) {
		x = x || "0";
		return x.replace(/^0+(?=\d)/, "");
	}

	function formatTyping(raw, decimal) {
		if (!raw || raw === "-" || raw === "." || raw === "-.") {
			return raw;
		}

		const neg = raw[0] === "-";
		if (neg) raw = raw.substring(1);

		const parts = raw.split(".");
		let intPart = comma(normalizeInt(parts[0]));
		let dec = parts[1] || "";

		if (dec.length > decimal) {
			dec = dec.substring(0, decimal);
		}

		let out = neg ? "-" + intPart : intPart;

		if (raw.includes(".") && decimal > 0) {
			out += "." + dec;
		}

		return out;
	}

	function roundToStep(num, step, min) {
		if (!step || !isFinite(num)) return num;

		const base = min !== null ? min : 0;
		const ratio = (num - base) / step;
		const snapped = Math.round(ratio) * step + base;

		const precision = Math.max(countStepDecimals(step), 10);
		return parseFloat(snapped.toFixed(precision));
	}

	function clamp(num, min, max) {
		if (min !== null && num < min) num = min;
		if (max !== null && num > max) num = max;
		return num;
	}

	function formatBlur(raw, decimal, min, max, step) {
		if (!raw || raw === "-" || raw === "." || raw === "-.") {
			return "";
		}

		raw = raw.replace(/,/g, "");

		let num = parseFloat(raw);
		if (isNaN(num)) return "";

		// clamp ก่อนรอบแรก
		num = clamp(num, min, max);

		// snap ตาม step
		if (step) {
			num = roundToStep(num, step, min);
			num = clamp(num, min, max);
		}

		const fixed = num.toFixed(decimal);
		const parts = fixed.split(".");

		let out = comma(parts[0]);

		if (decimal > 0) {
			out += "." + parts[1];
		}

		return out;
	}

	function countValid(str, pos) {
		return str.substring(0, pos).replace(/[^0-9.\-]/g, "").length;
	}

	function cursorFromCount(str, count) {
		if (count <= 0) return 0;

		let c = 0;
		for (let i = 0; i < str.length; i++) {
			if (/[0-9.\-]/.test(str[i])) c++;
			if (c >= count) return i + 1;
		}
		return str.length;
	}

	function insertTextAtCursor(el, text) {
		const start = el.selectionStart || 0;
		const end = el.selectionEnd || 0;
		const oldValue = el.value || "";

		el.value = oldValue.slice(0, start) + text + oldValue.slice(end);

		const pos = start + text.length;
		try {
			el.setSelectionRange(pos, pos);
		} catch (e) {}
	}

	function typing(el) {
		const decimal = getDecimalPlaces(el);
		const allowNeg = allowNegative(el);

		const old = el.value;
		const cursor = el.selectionStart || 0;
		const count = countValid(old, cursor);

		const raw = sanitize(old, decimal, allowNeg);
		const formatted = formatTyping(raw, decimal);

		el.value = formatted;

		const newCursor = cursorFromCount(formatted, count);

		try {
			el.setSelectionRange(newCursor, newCursor);
		} catch (e) {}
	}

	function blurFormat(el) {
		const decimal = getDecimalPlaces(el);
		const min = getMin(el);
		const max = getMax(el);
		const step = getStep(el);
		const allowNeg = allowNegative(el);

		const raw = sanitize(el.value, decimal, allowNeg);
		el.value = formatBlur(raw, decimal, min, max, step);
	}

	document.addEventListener("input", function (e) {
		if (e.target.matches(SELECTOR)) {
			typing(e.target);
		}
	});

	document.addEventListener("keyup", function (e) {
		if (e.target.matches(SELECTOR)) {
			typing(e.target);
		}
	});

	document.addEventListener(
		"blur",
		function (e) {
			if (e.target.matches(SELECTOR)) {
				blurFormat(e.target);
			}
		},
		true,
	);

	document.addEventListener("paste", function (e) {
		const el = e.target;
		if (!el.matches(SELECTOR)) return;

		e.preventDefault();

		const decimal = getDecimalPlaces(el);
		const allowNeg = allowNegative(el);

		const clipboard = e.clipboardData || window.clipboardData;
		const pastedText = clipboard ? clipboard.getData("text") : "";

		const cleaned = sanitizePastedText(pastedText, decimal, allowNeg);

		insertTextAtCursor(el, cleaned);
		typing(el);
	});
})();
