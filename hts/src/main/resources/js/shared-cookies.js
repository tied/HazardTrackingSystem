console.log("=== shared-cookies.js ===");

function initHTSCookie() {
	if (AJS.Cookie.read("HTS_COOKIE") === undefined) {
		var htsCookieJson = {
			OPEN_CAUSES: [],
			OPEN_CONTROLS: [],
			OPEN_VERIFICATIONS: []
		};
		AJS.Cookie.save("HTS_COOKIE", JSON.stringify(htsCookieJson));
	}
}

function openPropertyElement(buttonElement, contentElement) {
	AJS.$(buttonElement).removeClass("aui-iconfont-add");
	AJS.$(buttonElement).addClass("aui-iconfont-devtools-task-disabled");
	AJS.$(contentElement).show();
}

// Causes
function modifyHTSCookieOpenCauses(operation, causeID, existingCausesCount) {
	if (AJS.Cookie.read("HTS_COOKIE") !== undefined) {
		var htsCookieJson = JSON.parse(AJS.Cookie.read("HTS_COOKIE"));
		if (operation === "open") {
			htsCookieJson.OPEN_CAUSES.push(parseInt(causeID));
		} else {
			var indexOfID = htsCookieJson.OPEN_CAUSES.indexOf(parseInt(causeID));
			if (indexOfID > -1) {
				htsCookieJson.OPEN_CAUSES.splice(indexOfID, 1);
			}
		}
		AJS.Cookie.save("HTS_COOKIE", JSON.stringify(htsCookieJson));
		// Check if Expand All button needs renaming
		if (existingCausesCount !== null) {
			renameCausePageExpandButton(existingCausesCount);
		}
	}
}

function openHTSCookieOpenCauses() {
	if (AJS.Cookie.read("HTS_COOKIE") !== undefined) {
		var htsCookieJson = JSON.parse(AJS.Cookie.read("HTS_COOKIE"));
		for (var i = 0; i < htsCookieJson.OPEN_CAUSES.length; i++) {
			var causeID = htsCookieJson.OPEN_CAUSES[i];
			var buttonElement = AJS.$("#CauseTableEntryID" + causeID + " td:first-child").children("div");
			var contentElement = AJS.$("#CauseTableEntryContentID" + causeID);
			openPropertyElement(buttonElement, contentElement);
		}
	}
}

function renameCausePageExpandButton(existingCausesCount) {
	if (AJS.Cookie.read("HTS_COOKIE") !== undefined) {
		var htsCookieJson = JSON.parse(AJS.Cookie.read("HTS_COOKIE"));
		if (existingCausesCount === htsCookieJson.OPEN_CAUSES.length) {
			AJS.$("#CausePageExpandAllButton").val("Close All");
		} else {
			AJS.$("#CausePageExpandAllButton").val("Expand All");
		}
	}
}

// Controls
function modifyHTSCookieOpenControls(operation, controlID) {
	if (AJS.Cookie.read("HTS_COOKIE") !== undefined) {
		var htsCookieJson = JSON.parse(AJS.Cookie.read("HTS_COOKIE"));
		var indexOfID = htsCookieJson.OPEN_CONTROLS.indexOf(parseInt(controlID));
		if (operation === "open") {
			if(indexOfID == -1) {
				htsCookieJson.OPEN_CONTROLS.push(parseInt(controlID));
			}
		} else {
			var indexOfID = htsCookieJson.OPEN_CONTROLS.indexOf(parseInt(controlID));
			if (indexOfID > -1) {
				htsCookieJson.OPEN_CONTROLS.splice(indexOfID, 1);
			}
		}
		AJS.Cookie.save("HTS_COOKIE", JSON.stringify(htsCookieJson));
	}
}


// Verifications
function modifyHTSCookieOpenVerifications(operation, verificationID) {
	if (AJS.Cookie.read("HTS_COOKIE") !== undefined) {
		var htsCookieJson = JSON.parse(AJS.Cookie.read("HTS_COOKIE"));
		var indexOfID = htsCookieJson.OPEN_VERIFICATIONS.indexOf(parseInt(verificationID));
		if (operation === "open") {
			if(indexOfID == -1) {
				htsCookieJson.OPEN_VERIFICATIONS.push(parseInt(verificationID));
			}
		} else {
			if (indexOfID > -1) {
				htsCookieJson.OPEN_VERIFICATIONS.splice(indexOfID, 1);
			}
		}
		AJS.Cookie.save("HTS_COOKIE", JSON.stringify(htsCookieJson));
	}
}