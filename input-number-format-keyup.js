/*! Input Number Format Keyup v1.0.0 */
(function () {
	const INFK_CLASS = "input-number-format-keyup";
	const INFK_SELECTOR = "." + INFK_CLASS;
	const INFK_VERSION = "1.0.0";
	const INFK_DEFAULT_DECIMAL = 2;
	const INFK_MAX_DECIMAL = 100;
	const INFK_COMMA_REGEX = /,/g;
	const INFK_PASTE_NEWLINE_SPLIT_REGEX = /\r?\n/;
	const INFK_PASTE_SPACE_REGEX = /\s+/g;
	const INFK_PASTE_ALLOWED_CHAR_REGEX = /[^0-9,.\-]/g;
	const INFK_CONFIG_CACHE = new WeakMap();

	function __infkIsDigitCharCode(code) {
		return code >= 48 && code <= 57;
	}

	function __infkIsValidCharCode(code) {
		return __infkIsDigitCharCode(code) || code === 46 || code === 45;
	}

	function __infkGetConfig(el) {
		const ds = el.dataset;
		const decimalRaw = ds.decimal || "";
		const minRaw = ds.min || "";
		const maxRaw = ds.max || "";
		const stepRaw = ds.step || "";
		const allowNegativeRaw = ds.allowNegative || "";
		const cached = INFK_CONFIG_CACHE.get(el);

		if (
			cached &&
			cached.decimalRaw === decimalRaw &&
			cached.minRaw === minRaw &&
			cached.maxRaw === maxRaw &&
			cached.stepRaw === stepRaw &&
			cached.allowNegativeRaw === allowNegativeRaw
		) {
			return cached.config;
		}

		const decimal = parseInt(decimalRaw, 10);
		const min = parseFloat(minRaw);
		const max = parseFloat(maxRaw);
		const step = parseFloat(stepRaw);
		const normalizedDecimal = isNaN(decimal)
			? INFK_DEFAULT_DECIMAL
			: Math.max(0, Math.min(INFK_MAX_DECIMAL, decimal));

		const config = {
			decimal: normalizedDecimal,
			min: Number.isFinite(min) ? min : null,
			max: Number.isFinite(max) ? max : null,
			step: Number.isFinite(step) && step > 0 ? step : null,
			allowNeg: allowNegativeRaw !== "0",
		};

		config.stepDecimals = __infkCountStepDecimals(config.step);
		INFK_CONFIG_CACHE.set(el, {
			decimalRaw: decimalRaw,
			minRaw: minRaw,
			maxRaw: maxRaw,
			stepRaw: stepRaw,
			allowNegativeRaw: allowNegativeRaw,
			config: config,
		});
		return config;
	}

	function __infkIsTargetInput(el) {
		if (!el || typeof el !== "object") return false;
		if (el.type === "number") return false;
		if (el.classList && typeof el.classList.contains === "function") {
			return el.classList.contains(INFK_CLASS);
		}
		return !!(el.matches && el.matches(INFK_SELECTOR));
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
		const allowDot = decimal > 0;
		let out = "";
		let hasDot = false;

		for (let i = 0; i < value.length; i++) {
			const code = value.charCodeAt(i);

			if (__infkIsDigitCharCode(code)) {
				out += value.charAt(i);
				continue;
			}

			if (code === 45) {
				if (allowNeg && out.length === 0) {
					out += "-";
				}
				continue;
			}

			if (code === 46 && allowDot && !hasDot) {
				out += ".";
				hasDot = true;
			}
		}

		return out;
	}

	function __infkSanitizePastedText(text, decimal, allowNeg) {
		text = String(text || "").trim();
		text = text.split(INFK_PASTE_NEWLINE_SPLIT_REGEX)[0];
		text = text.split("\t")[0];
		text = text.replace(INFK_PASTE_SPACE_REGEX, "");
		text = text.replace(INFK_PASTE_ALLOWED_CHAR_REGEX, "");
		text = text.replace(INFK_COMMA_REGEX, "");

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

		const dot = raw.indexOf(".");
		const intRaw = dot === -1 ? raw : raw.substring(0, dot);
		const intPart = __infkAddComma(__infkNormalizeInt(intRaw));
		let dec = dot === -1 ? "" : raw.substring(dot + 1);

		if (dec.length > decimal) {
			dec = dec.substring(0, decimal);
		}

		let out = neg ? "-" + intPart : intPart;

		if (dot !== -1 && decimal > 0) {
			out += "." + dec;
		}

		return out;
	}

	function __infkClamp(num, min, max) {
		if (min !== null && num < min) num = min;
		if (max !== null && num > max) num = max;
		return num;
	}

	function __infkRoundToStep(num, step, min, stepDecimals) {
		if (!step || !isFinite(num)) return num;

		const base = min !== null ? min : 0;
		const ratio = (num - base) / step;
		if (!isFinite(ratio)) return num;
		const snapped = Math.round(ratio) * step + base;
		if (!isFinite(snapped)) return num;
		const normalizedStepDecimals =
			Number.isFinite(stepDecimals) && stepDecimals > 0 ? stepDecimals : 0;
		const precision = Math.min(
			INFK_MAX_DECIMAL,
			Math.max(normalizedStepDecimals, 10),
		);

		return parseFloat(snapped.toFixed(precision));
	}

	function __infkFormatBlur(raw, decimal, min, max, step, stepDecimals) {
		if (!raw || raw === "-" || raw === "." || raw === "-.") {
			return "";
		}

		raw = raw.replace(INFK_COMMA_REGEX, "");

		let num = parseFloat(raw);
		if (!Number.isFinite(num)) return "";

		num = __infkClamp(num, min, max);

		if (step) {
			num = __infkRoundToStep(num, step, min, stepDecimals);
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
		let count = 0;
		const end = pos > str.length ? str.length : pos;

		for (let i = 0; i < end; i++) {
			if (__infkIsValidCharCode(str.charCodeAt(i))) {
				count++;
			}
		}

		return count;
	}

	function __infkFindCursorFromValidCount(str, count) {
		if (count <= 0) return 0;

		let currentCount = 0;
		for (let i = 0; i < str.length; i++) {
			if (__infkIsValidCharCode(str.charCodeAt(i))) {
				currentCount++;
			}
			if (currentCount >= count) {
				return i + 1;
			}
		}

		return str.length;
	}

	function __infkAdjustCursorValidCount(raw, formatted, validCount) {
		if (
			raw.charAt(0) === "." &&
			formatted.indexOf("0.") === 0 &&
			validCount > 0
		) {
			return validCount + 1;
		}

		if (
			raw.indexOf("-.") === 0 &&
			formatted.indexOf("-0.") === 0 &&
			validCount > 1
		) {
			return validCount + 1;
		}

		return validCount;
	}

	function __infkGetSelectionStart(el) {
		try {
			return el.selectionStart || 0;
		} catch (e) {
			return 0;
		}
	}

	function __infkGetSelectionEnd(el) {
		try {
			return el.selectionEnd || 0;
		} catch (e) {
			return 0;
		}
	}

	function __infkInsertTextAtCursor(el, text) {
		const start = __infkGetSelectionStart(el);
		const end = __infkGetSelectionEnd(el);
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
		const config = __infkGetConfig(el);
		const oldValue = el.value;
		const oldCursor = __infkGetSelectionStart(el);
		const validCount = __infkCountValidCharsBeforeCursor(oldValue, oldCursor);
		const raw = __infkSanitize(oldValue, config.decimal, config.allowNeg);
		const formatted = __infkFormatTyping(raw, config.decimal);
		const cursorValidCount = __infkAdjustCursorValidCount(
			raw,
			formatted,
			validCount,
		);

		if (formatted !== oldValue) {
			el.value = formatted;
		}

		const newCursor = __infkFindCursorFromValidCount(
			formatted,
			cursorValidCount,
		);

		if (newCursor !== oldCursor) {
			try {
				el.setSelectionRange(newCursor, newCursor);
			} catch (e) {}
		}
	}

	function __infkHandleBlur(el) {
		const config = __infkGetConfig(el);
		const raw = __infkSanitize(el.value, config.decimal, config.allowNeg);
		const formatted = __infkFormatBlur(
			raw,
			config.decimal,
			config.min,
			config.max,
			config.step,
			config.stepDecimals,
		);

		if (formatted !== el.value) {
			el.value = formatted;
		}
	}

	function __infkIsShortcutKey(e) {
		if (!e.ctrlKey && !e.metaKey) return false;
		const key = String(e.key || "").toLowerCase();
		return key === "a" || key === "c" || key === "x";
	}

	function __infkExposeVersion() {
		if (typeof window !== "object" || !window) return;

		const api = window.InputNumberFormatKeyup;
		if (api && (typeof api === "object" || typeof api === "function")) {
			api.version = INFK_VERSION;
			return;
		}

		if (!api) {
			window.InputNumberFormatKeyup = { version: INFK_VERSION };
		}
	}

	function __infkDispatchInput(el) {
		if (!el || typeof el.dispatchEvent !== "function") return;

		if (typeof Event === "function") {
			el.dispatchEvent(new Event("input", { bubbles: true }));
			return;
		}

		if (document.createEvent) {
			const event = document.createEvent("Event");
			event.initEvent("input", true, false);
			el.dispatchEvent(event);
		}
	}

	__infkExposeVersion();

	document.addEventListener("input", function (e) {
		const el = e.target;
		if (!__infkIsTargetInput(el)) return;
		if (e.isComposing) return;
		__infkHandleTyping(el);
	});

	document.addEventListener("keydown", function (e) {
		const el = e.target;
		if (!__infkIsTargetInput(el)) return;

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
			if (!__infkIsTargetInput(el)) return;
			__infkHandleBlur(el);
		},
		true,
	);

	document.addEventListener(
		"focus",
		function (e) {
			const el = e.target;
			if (!__infkIsTargetInput(el)) return;

			setTimeout(function () {
				el.select();
			}, 0);
		},
		true,
	);

	document.addEventListener("compositionend", function (e) {
		const el = e.target;
		if (!__infkIsTargetInput(el)) return;
		__infkHandleTyping(el);
	});

	document.addEventListener("paste", function (e) {
		const el = e.target;
		if (!__infkIsTargetInput(el)) return;

		e.preventDefault();

		const config = __infkGetConfig(el);
		const clipboard = e.clipboardData || window.clipboardData;
		const pastedText = clipboard ? clipboard.getData("text") : "";
		const cleaned = __infkSanitizePastedText(
			pastedText,
			config.decimal,
			config.allowNeg,
		);

		__infkInsertTextAtCursor(el, cleaned);
		__infkHandleTyping(el);
		__infkDispatchInput(el);
	});
})();
