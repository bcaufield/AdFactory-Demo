Ti.API.debug('PENTON - Util.js');

/* Determine these the first time, on load only */
var osname = Ti.Platform.osname, platformVersion = Ti.Platform.version, height = Ti.Platform.displayCaps.platformHeight, width = Ti.Platform.displayCaps.platformWidth, version = Titanium.App.version;
var RAM = Titanium.Platform.availableMemory;
var freeRAM = Math.round(RAM / 1024);

if (Titanium.Network.online) {
	internetStatus = Titanium.Network.networkTypeName;
} else {
	internetStatus = 'None';
}

Ti.API.info('PENTON - Util.js - OS Name: ' + osname);
Ti.API.info('PENTON - Util.js - OS Version: ' + platformVersion);
Ti.API.info('PENTON - Util.js - Ti App Version: ' + version);
Ti.API.info('PENTON - Util.js - Device Height: ' + height);
Ti.API.info('PENTON - Util.js - Device Width: ' + width);
Ti.API.info('PENTON - Util.js - Free RAM: ' + freeRAM);
Ti.API.info('PENTON - Util.js - Internet: ' + internetStatus);
//Ti.APT.info('PENTON - Util.js - OS Type: ' + Titanium.Platform.ostype);

exports.osname = osname;
exports.platformVersion = platformVersion;
exports.screenWidth = width;
// in dip on iOS and pixels on Android
exports.screenHeight = height;
exports.freeRAM = freeRAM;
exports.internetStatus = internetStatus;
exports.version = version;

exports.removePunctionationAndSpaces = function(str) {
	//var punctuationless = str.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g, "");
	//return exports.trim(punctuationless.replace(/ /g, ''));
	var cleanStr = str;
	if (str.length) {
		//var punctuationless = str.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g, "");
		var punctuationless = str.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`\'~()]/g, "");		
		cleanStr = exports.trim(punctuationless.replace(/ /g, ''));
	}
	return cleanStr; 
};

exports.getUserInfo = function() {
	var deviceInfo = 'OS Name: ' + osname + '\nOS Version: ' + platformVersion + '\nApp Version: ' + version + '\nDevice Height: ' + height + '\nDevice Width: ' + width + '\nFree RAM: ' + freeRAM + '\nInternet: ' + internetStatus;

	return deviceInfo;
};

//considering tablet to have one dimension over 900px - this is imperfect
var isTablet = osname === 'ipad' || (osname === 'android' && (width > 899 || height > 899));
exports.isTablet = isTablet;

exports.pxToDP = function(input) {
    return exports.PixelsToDPUnits(input);
};

exports.dpToPX = function(input) {
    return exports.DPUnitsToPixels(input);
};


exports.PixelsToDPUnits = function(ThePixels) {
	if (OS_ANDROID)
		return (ThePixels / (Titanium.Platform.displayCaps.dpi / 160));
	else
		return ThePixels;

};

exports.DPUnitsToPixels = function(TheDPUnits) {
	if (OS_ANDROID)
		return (TheDPUnits * (Titanium.Platform.displayCaps.dpi / 160));
	else
		return TheDPUnits;

};

/* Branching logic based on OS */
exports.os = function(/*Object*/map) {
	var def = map.def || null;
	//default function or value
	if (map[osname]) {
		if ( typeof map[osname] == 'function') {
			return map[osname]();
		} else {
			return map[osname];
		}
	} else {
		if ( typeof def == 'function') {
			return def();
		} else {
			return def;
		}
	}
};

exports.trim = function(stringToTrim) {
	return stringToTrim.replace(/^\s+|\s+$/g, "");
};

exports.ltrim = function(stringToTrim) {
	return stringToTrim.replace(/^\s+/, "");
};

exports.rtrim = function(stringToTrim) {
	return stringToTrim.replace(/\s+$/, "");
};

exports.get_type = function(thing) {
	if (thing === null)
		return "[object Null]";
	// special case
	return Object.prototype.toString.call(thing);
};

exports.parseBoolean = function(input) {
	if (input == 1 || input == true || input == "1" || input == "true" || input == "TRUE") {
		return true;
	} else {
		return false;
	}
};

exports.cleanString = function(string) {
	// Replace evil characters
	var ret = string.replace(/[|&;$%@"<>()+,]/g, "");
	// replace double single quotes
	return ret.replace(/"/g, "''");
};

exports.urlEncode = function(string) {
	//Ti.API.info("urlEncode, string = " + string);
	var trimString = string;
	if (string.length) {
		//trimString = string.replace(/=/g, '%3D').replace(/,/g, '%2C').replace(/&/g, '%26;');
		trimString = encodeURIComponent(string);
	}
	//Ti.API.info("urlEncode, encoded string = " + trimString);
	return trimString;
};

exports.htmlEncode = function(string) {
	if (string.length) {
		var ret = string.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/=/g, '%3D;').replace(/,/g, '%2C;');
	}
	return string;
};

exports.htmlDecode = function(string) {
	var ret = string.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

	return string;
};

var escapeChars = {
	lt : '<',
	gt : '>',
	quot : '"',
	apos : "'",
	amp : '&'
};
exports.unescapeHTML = function(str) {//modified from underscore.string and string.js
	if (str.length) {
		str = str.replace(/&nbsp;/g, " ");
		return str.replace(/\&([^;]+);/g, function(entity, entityCode) {
			var match;
	
			if ( entityCode in escapeChars) {
				return escapeChars[entityCode];
			} else if ( match = entityCode.match(/^#x([\da-fA-F]+)$/)) {
				return String.fromCharCode(parseInt(match[1], 16));
			} else if ( match = entityCode.match(/^#(\d+)$/)) {
				return String.fromCharCode(~~match[1]);
			} else {
				return entity;
			}
		});
	} else {
		return str;
	}
};

exports.clone = function(obj) {
	if (null == obj || "object" != typeof obj)
		return obj;
	var copy = obj.constructor();
	for (var attr in obj) {
		if (obj.hasOwnProperty(attr))
			copy[attr] = obj[attr];
	}
	return copy;
};

exports.toHex = function(N) {
	if (N === null) {
		return "00";
	}
	N = parseInt(N, 10);
	if (N === 0 || isNaN(N)) {
		return "00";
	}
	N = Math.max(0, N);
	N = Math.min(N, 255);
	N = Math.round(N);
	return "0123456789ABCDEF".charAt((N - N % 16) / 16) + "0123456789ABCDEF".charAt(N % 16);
};

exports.fromHexToByteArray = function(str) {
	var len = str.length;
	var data = [];
	// byte array len/2
	for (var i = 0; i < len; i += 2) {
		data[i / 2] = parseInt(str.slice(i, i + 2), 16);
	}
	return data;
};

exports.fromIntegerToBinary = function(str) {
	var len = str.length;
	var data = [];
	// byte array len/2
	for (var i = 0; i < len; i += 2) {
		data[i / 2] = parseInt(str.slice(i, i + 2), 16);
	}
	return data;
};

exports.removeDecOverflow = function(decimalNum) {
	var str = '' + decimalNum;
	if (str.indexOf('000') != -1) {
		return str.substring(0, str.indexOf('000'));
	}
	return str;
};

exports.RGBtoHex = function(R, G, B) {
	return exports.toHex(R) + exports.toHex(G) + exports.toHex(B);
};

exports.getDateFromString = function(str) {
	if (str === undefined || str === "")
		return "";
	var months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];
	var d = new Date(str);
	var year = d.getFullYear();
	var month = months[d.getMonth()];
	return (month + ' ' + d.getDate() + ', ' + year);

};

exports.shadeColor = function(color, percent) {
	var num = parseInt(color.slice(1), 16), amt = Math.round(2.55 * percent), R = (num >> 16) + amt, B = (num >> 8 & 0x00FF) + amt, G = (num & 0x0000FF) + amt;
	return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 + (G < 255 ? G < 1 ? 0 : G : 255)).toString(16).slice(1);
};
