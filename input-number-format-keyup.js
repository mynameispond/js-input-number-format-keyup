(function () {
	var SELECTOR = ".input-number-format-keyup";
	var DEFAULT_DECIMAL = 2;

	function matchesSelector(el, selector) {
		return el && el.matches && el.matches(selector);
	}

	function getDecimalPlaces(input) {
		var decimal = parseInt(input.getAttribute("data-decimal"), 10);

		if (isNaN(decimal) || decimal < 0) {
			decimal = DEFAULT_DECIMAL;
		}

		return decimal;
	}

	function sanitizeNumberInput(value, decimalPlaces) {
		value = String(value || "");

		// เหลือเฉพาะ 0-9 . -
		value = value.replace(/[^0-9.-]/g, "");

		// อนุญาต - ได้เฉพาะตัวแรก
		value = value.replace(/(?!^)-/g, "");

		// ถ้าไม่ให้มีทศนิยม ตัด . ออกทั้งหมด
		if (decimalPlaces <= 0) {
			value = value.replace(/\./g, "");
			return value;
		}

		// อนุญาต . ได้แค่ตัวเดียว
		var firstDotIndex = value.indexOf(".");
		if (firstDotIndex !== -1) {
			value =
				value.substring(0, firstDotIndex + 1) +
				value.substring(firstDotIndex + 1).replace(/\./g, "");
		}

		return value;
	}

	function addCommaToInteger(intPart) {
		return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	function normalizeIntegerPart(intPart) {
		intPart = intPart || "0";
		intPart = intPart.replace(/^0+(?=\d)/, "");
		return intPart;
	}

	function formatNumberForTyping(raw, decimalPlaces) {
		if (!raw || raw === "-" || raw === "." || raw === "-.") {
			return raw;
		}

		var isNegative = raw.charAt(0) === "-";
		if (isNegative) {
			raw = raw.substring(1);
		}

		var hasDot = raw.indexOf(".") !== -1;
		var parts = raw.split(".");
		var intPart = normalizeIntegerPart(parts[0]);
		var decPart = parts.length > 1 ? parts[1] : "";

		intPart = addCommaToInteger(intPart);

		if (decimalPlaces <= 0) {
			decPart = "";
			hasDot = false;
		} else if (decPart.length > decimalPlaces) {
			decPart = decPart.substring(0, decimalPlaces);
		}

		var result = isNegative ? "-" + intPart : intPart;

		if (hasDot && decimalPlaces > 0) {
			result += "." + decPart;
		}

		return result;
	}

	function formatNumberForBlur(raw, decimalPlaces) {
		if (!raw || raw === "-" || raw === "." || raw === "-.") {
			return "";
		}

		var isNegative = raw.charAt(0) === "-";
		if (isNegative) {
			raw = raw.substring(1);
		}

		raw = raw.replace(/,/g, "");

		if (!raw || isNaN(raw)) {
			return "";
		}

		var num = parseFloat(raw);
		if (isNaN(num)) {
			return "";
		}

		var fixed = num.toFixed(decimalPlaces);
		var parts = fixed.split(".");
		var intPart = addCommaToInteger(parts[0]);
		var result = (num < 0 || (isNegative && num !== 0) ? "-" : "") + intPart;

		if (decimalPlaces > 0) {
			result += "." + (parts[1] || "").padEnd(decimalPlaces, "0");
		}

		return result;
	}

	function countValidCharsBeforeCursor(value, cursorPos) {
		var left = value.substring(0, cursorPos);
		return left.replace(/[^0-9.-]/g, "").length;
	}

	function findCursorPosFromValidCharCount(formattedValue, validCharCount) {
		if (validCharCount <= 0) {
			return 0;
		}

		var count = 0;
		for (var i = 0; i < formattedValue.length; i++) {
			if (/[0-9.-]/.test(formattedValue.charAt(i))) {
				count++;
			}

			if (count >= validCharCount) {
				return i + 1;
			}
		}

		return formattedValue.length;
	}

	function handleTyping(input) {
		var decimalPlaces = getDecimalPlaces(input);
		var oldValue = input.value;
		var oldCursor = input.selectionStart || 0;

		var validCharCount = countValidCharsBeforeCursor(oldValue, oldCursor);
		var sanitized = sanitizeNumberInput(oldValue, decimalPlaces);
		var formatted = formatNumberForTyping(sanitized, decimalPlaces);

		input.value = formatted;

		var newCursor = findCursorPosFromValidCharCount(
			formatted,
			validCharCount,
		);

		try {
			input.setSelectionRange(newCursor, newCursor);
		} catch (e) {}
	}

	function handleBlur(input) {
		var decimalPlaces = getDecimalPlaces(input);
		var raw = sanitizeNumberInput(input.value, decimalPlaces);
		input.value = formatNumberForBlur(raw, decimalPlaces);
	}

	document.addEventListener("input", function (e) {
		var target = e.target;
		if (!matchesSelector(target, SELECTOR)) {
			return;
		}
		handleTyping(target);
	});

	document.addEventListener("keyup", function (e) {
		var target = e.target;
		if (!matchesSelector(target, SELECTOR)) {
			return;
		}
		handleTyping(target);
	});

	document.addEventListener(
		"blur",
		function (e) {
			var target = e.target;
			if (!matchesSelector(target, SELECTOR)) {
				return;
			}
			handleBlur(target);
		},
		true,
	);
})();
