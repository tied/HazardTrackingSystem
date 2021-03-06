console.log("=== verification-page.js ===");

var EXISTING_VERIFICATIONS_SERIALIZED = null;

function initializeVerificationPage() {
	initVerificationPageClickEvents();
	initVerificationPageDateModification();
	
	EXISTING_VERIFICATIONS_SERIALIZED = [];
	AJS.$(".VerificationPageFormExisting").each(function() {
		var verificationID = AJS.$(this).find("[name='verificationID']").val();
		var serialized = AJS.$(this).serialize();
		EXISTING_VERIFICATIONS_SERIALIZED[verificationID] = serialized;
	});
	
	if (AJS.Cookie.read("HTS_COOKIE") !== undefined) {
		var htsCookieJson = JSON.parse(AJS.Cookie.read("HTS_COOKIE"));
		for (var i = 0; i < htsCookieJson.OPEN_VERIFICATIONS.length; i++) {
			var verificationID = htsCookieJson.OPEN_VERIFICATIONS[i];
			
			var verificationToggle = AJS.$("#VerificationTableEntryID" + verificationID + " > span.VerificationTableToggle");
			if(verificationToggle.length > 0) {
				var verificationDisplay = AJS.$("#VerificationTableEntryContentID" + verificationID);
				openForm(verificationToggle, verificationDisplay);
			}
		}
	}
}

function initVerificationPageDateModification() {
	var estimatedCompletionDates = AJS.$(".VerificationDate");
	estimatedCompletionDates.each(function () {
		var defaultDateArr = (AJS.$(this).data("date")).split(" ");
		var defaultDateStr = defaultDateArr[0];
		AJS.$(this).val(defaultDateStr);
	});
}

function initVerificationPageClickEvents() {
	// Make sure cause is opened when user clicks on a cause link
	AJS.$("div.causeHeader > span.causeNumber > a").on("click",function() {
		var causeID = AJS.$(this).attr("causeID");
		modifyHTSCookieOpenCauses("open", causeID, null);
	});
	
	// Make sure control is opened when user clicks on a control link
	AJS.$("div.controlHeader > span.controlNumber > a").on("click",function() {
		var controlID = AJS.$(this).attr("controlID");
		modifyHTSCookieOpenControls("open", controlID);
	});
	
	// Open/close on a cause header
	AJS.$(".VerificationCauseTableToggle").on("click", function() {
		var displayElement = AJS.$(this).parent().next();
		if(!isOpen(AJS.$(this))) {			
			openForm(AJS.$(this), displayElement);
		}
		else {
			AJS.$(this).parent().parent().find(".VerificationControlTableToggle").each(function () {
				AJS.$(this).parent().parent().find(".VerificationTableToggle").each(function () {
					var verificationID = AJS.$(this).parent().attr("verificationId");
					var displayElement = AJS.$(this).parent().next();
					closeForm(AJS.$(this), displayElement);
					modifyHTSCookieOpenVerifications("close", verificationID);
				});
				
				var controlID = AJS.$(this).parent().attr("id").split("ControlTableEntryID")[1];
				var controlDisplayElement = AJS.$(this).parent().siblings('ul');
				closeForm(AJS.$(this), controlDisplayElement);
			});
			
			closeForm(AJS.$(this), displayElement);
		}
	});
	
	// Open/close on a control
	AJS.$(".VerificationControlTableToggle").on("click", function() {
		var controlID = AJS.$(this).parent().attr("id").split("ControlTableEntryID")[1];
		var displayElement = AJS.$(this).parent().siblings('ul');
		
		if(!isOpen(AJS.$(this))) {
			openForm(AJS.$(this),displayElement);
		}
		else {	
			AJS.$(this).parent().parent().find(".VerificationTableToggle").each(function () {
				var verificationID = AJS.$(this).parent().attr("verificationId");
				var displayElement = AJS.$(this).parent().next();
				closeForm(AJS.$(this), displayElement);
				modifyHTSCookieOpenVerifications("close", verificationID);
			});
			closeForm(AJS.$(this),displayElement);
		}
	});
	
	// Open/close on existing Verification
	AJS.$(".VerificationTableToggle").on("click", function() {
		var verificationID = AJS.$(this).parent().attr("verificationId");
		var displayElement = AJS.$("#VerificationTableEntryContentID" + verificationID);
		
		if(!isOpen(AJS.$(this))) {
			openForm(AJS.$(this),displayElement);
			modifyHTSCookieOpenVerifications("open", verificationID);
		}
		else {			
			closeForm(AJS.$(this),displayElement);
			modifyHTSCookieOpenVerifications("close", verificationID);
		}
	});

	// Expand All button click
	AJS.$("#VerificationPageExpandAllButton").on("click", function() {
		AJS.$(".VerificationTableToggle").each(function() {
			if(!isOpen(AJS.$(this))) {
				openForm(AJS.$(this), AJS.$(this).parent().next());
				modifyHTSCookieOpenVerifications("open", AJS.$(this).parent().attr("verificationId"));
			}
		});	
		
		AJS.$(".VerificationControlTableToggle").each(function() {
			if(!isOpen(AJS.$(this))) {
				openForm(AJS.$(this), AJS.$(this).parent().next());
			}
		});
		
		AJS.$(".VerificationCauseTableToggle").each(function() {
			if(!isOpen(AJS.$(this))) {
				openForm(AJS.$(this), AJS.$(this).parent().next());
			}
		});
	});
	
	
	AJS.$("#VerificationPageCloseAllButton").on("click", function() {
		AJS.$(".VerificationTableToggle").each(function() {
			closeForm(AJS.$(this), AJS.$(this).parent().next());
			modifyHTSCookieOpenVerifications("close", AJS.$(this).parent().attr("verificationId"));
		});	
		
		AJS.$(".VerificationControlTableToggle").each(function (index) {
			closeForm(AJS.$(this), AJS.$(this).parent().next());;
		});
		
		AJS.$(".VerificationCauseTableToggle").each(function() {
			if(isOpen(AJS.$(this))) {
				closeForm(AJS.$(this), AJS.$(this).parent().next());
			}
		});	
	});
	
	// Clear new Verification form
	AJS.$("#VerificationPageClearNew").on("click", function() {
		var formElement = AJS.$("#VerificationPageFormAddTransfer");
		AJS.$(formElement).find("#verificationDescription").val("");
		AJS.$(formElement).find("#verificationStatus").val("").trigger('chosen:updated');
		AJS.$(formElement).find("#verificationType").val("").trigger('chosen:updated');
		AJS.$(formElement).find("#verificationRespParty").val("");
		AJS.$(formElement).find("#verificationEstComplDate").val("");
		AJS.$(formElement).find("#verificationControlAssociation").val("");
		AJS.$(formElement).find("[data-error='verificationDescription']").hide();
	});
	
	// Clear new transfer Verification form
	AJS.$("#VerificationPageClearTransfer").on("click", function() {
		var formElement = AJS.$("#VerificationPageFormAddTransfer");
		AJS.$(formElement).find("#transferReason").val("");
		AJS.$(formElement).find("#transferVerificationList").val("");
		AJS.$(formElement).find("#verificationControlAssociation").val("");
		AJS.$(formElement).find("[data-error='transferVerificationList']").hide();
	});

	// Add new Verification click event
	AJS.$("#AddNewVerification").on("click", function() {
		if(!isOpen(AJS.$(this))) {
			openForm(AJS.$(this), AJS.$("#VerificationPageNewContainer"));
		}
		else {
			closeForm(AJS.$(this), AJS.$("#VerificationPageNewContainer"));
		}
	});
	
	// Add new transfer click event
	AJS.$("#VerificationPageAddTransfer").on("click", function() {
		if(!isOpen(AJS.$(this))) {
			openForm(AJS.$(this), AJS.$("#VerificationPageTransferContainer"));
		}
		else {
			closeForm(AJS.$(this), AJS.$("#VerificationPageTransferContainer"));
		}
	});
	
	//when doing a control transfer, automatically expand the targetcause on the cause page
	AJS.$(".verificationTransferLink").on("click",function(event) {
		var targetID = AJS.$(this).attr("targetID");
		
		var verificationToggle = AJS.$("#VerificationTableEntryID" + targetID + " > span.VerificationTableToggle");
		if(verificationToggle.length > 0) {
			var verificationDisplay = verificationToggle.parent().next();
			openForm(verificationToggle, verificationDisplay);
			modifyHTSCookieOpenVerifications("open", targetID);
		}
		
	});
	
	// Save new verification
	AJS.$(".VerificationPageSaveAllChanges").on("click", function() {
		var result = {
			existingPost : false,
			existingDelete : false,
			existingErrors : false,
			existingNoChanges : false,
			addNewPost : false,
			addNewErrors : false,
			addNewNoChanges : false,
			addTransferPost : false,
			addTransferErrors : false,
			addTransferNoChanges : false
		};

		var operation = AJS.$(this).data("ops");
		if (operation === "new" || operation === "all") {
			var addNewResult = addNewVerificationFormValidation();
			if (addNewResult.dirty === true	&& addNewResult.validated === true) {
				result.addNewPost = true;
				postFormToVerificationServlet(AJS.$("#VerificationPageFormAddNew"));
			} else if (addNewResult.dirty === true && addNewResult.validated === false) {
				result.addNewErrors = true;
			} else if (addNewResult.dirty === false && addNewResult.validated === false) {
				result.addNewNoChanges = true;
			}
		}
		
		if (operation === "transfer" || operation === "all") {
			var addTransferResult = addTransferVerificationFormValidation();
			if (addTransferResult.dirty === true && addTransferResult.validated === true) {
				result.addTransferPost = true;
				postFormToVerificationServlet(AJS.$("#VerificationPageFormAddTransfer"));
			} else if (addTransferResult.dirty === true && addTransferResult.validated === false) {
				result.addTransferErrors = true;
			} else if (addTransferResult.dirty === false && addTransferResult.validated === false) {
				result.addTransferNoChanges = true;
			}
		}

		var existingResult = existingVerificationFormValidation();
		if (existingResult.validated === true) {
			result.existingErrors = false;
		} else {
			result.existingErrors = true;
		}
		
		if (existingResult.validated === true
				&& existingResult.modifiedExistingVerificationsIDs.length === 0
				&& existingResult.deleteExistingVerificationsIDs.length === 0
				&& existingResult.modifiedDeleteExistingVerificationsIDs.length === 0) {
			result.existingNoChanges = true;
		}
		
		if (existingResult.modifiedExistingVerificationsIDs.length !== 0) {
			result.existingPost = true;
			for (var i = 0; i < existingResult.modifiedExistingVerificationsIDs.length; i++) {
				var formElement = AJS.$("input[name='verificationID'][value='"
										+ existingResult.modifiedExistingVerificationsIDs[i]
										+ "']").closest("form");
				postFormToVerificationServlet(formElement);
			}
		}
		
		if (existingResult.deleteExistingVerificationsIDs.length !== 0) {
			result.existingDelete = true;
			openDeleteVerificationDialog(existingResult.deleteExistingVerificationsIDs,	result);
		} else {
			// Display appropriate message and load the template
			// again to see the changes
			displayAppropriateMessage(result, "Verification");
		}

	});

	AJS.$("#ConfirmDialogDuplBtnVerifications").live("click", function() {
		var reasonTextFields = AJS.$(".ConfirmDialogReasonTextInput");
		var reasonToDuplicate;
		
		reasonTextFields.each(function(index) {
			if (index === 0) {
				reasonToDuplicate = AJS.$(this).val();
				if (reasonToDuplicate === "") {
					var verificationID = AJS.$(this).attr("id").replace(/^\D+/g, '');
					var errorElement = AJS.$("#ConfirmDialogErrorTextForVerifificationID"+ verificationID);
					AJS.$(errorElement).text("For the Verification above, please provide a short delete reason.");
					AJS.$(errorElement).show();
					return false;
				}
			} else {
				AJS.$(this)[0].value = reasonToDuplicate;
			}
		});
	});
}

function addTransferVerificationFormValidation() {
	var formElement = AJS.$("#VerificationPageFormAddTransfer");
	var dirty = false;
	var validated = false;

	var verificationList = AJS.$(formElement).find("#transferVerificationList").val();
	var transferReasonElement = AJS.$(formElement).find("#transferReason").val();
	
	var verificationControlAssociation = AJS.$(formElement).find("#verificationControlAssociation").val();
	if(verificationControlAssociation !== undefined && verificationControlAssociation !== "") {
		dirty = true;
	}

	if (verificationList !== undefined &&  transferReasonElement !== undefined) {
		if (verificationList !== "" || transferReasonElement !== "") {
			dirty = true;
		}
	}
	
	if (dirty === true) {
		if(verificationList === undefined || verificationList === "") {
			AJS.$(formElement).find("[data-error='transferVerificationList']").show();
		} else {
			validated = true;
		}
	}
	return {"dirty" : dirty, "validated" : validated};
}

function existingVerificationFormValidation() {
	var modifiedExistingVerificationsIDs = [];
	var deleteExistingVerificationsIDs = [];
	var modifiedDeleteExistingVerificationsIDs = [];
	var validated = true;

	AJS.$(".VerificationPageFormExisting").each(function() {
		var verificationID = AJS.$(this).find("[name='verificationID']").val();
		var deleteSelected = AJS.$(".VerificationPageDeleteBox[value='"	+ verificationID + "']").is(':checked');
		var oldSerialized = EXISTING_VERIFICATIONS_SERIALIZED[verificationID];
		var newSerialized = AJS.$(this).serialize();

		if (newSerialized !== oldSerialized) {
			if (newSerialized.indexOf("verificationDescription=&") > -1) {
				if (deleteSelected === false) {
					AJS.$(this).find("[data-error='verificationDescription']").show();
					validated = false;
				}
			} else {
				if (deleteSelected === false) {
					modifiedExistingVerificationsIDs.push(verificationID);
				} else {
					modifiedDeleteExistingVerificationsIDs.push(verificationID);
				}
			}
		}
		if (deleteSelected === true) {
			deleteExistingVerificationsIDs.push(verificationID);
		}
	});

	return {
		"validated" : validated,
		"modifiedExistingVerificationsIDs" : modifiedExistingVerificationsIDs,
		"deleteExistingVerificationsIDs" : deleteExistingVerificationsIDs,
		"modifiedDeleteExistingVerificationsIDs" : modifiedDeleteExistingVerificationsIDs
	};
}

function addNewVerificationFormValidation() {
	var formElement = AJS.$("#VerificationPageFormAddNew");
	var dirty = false;
	var validated = false;
	if (AJS.$(formElement).find("#verificationDescription").val() !== ""
			|| AJS.$(formElement).find("#verificationStatus").val() !== ""
			|| AJS.$(formElement).find("#verificationType").val() !== ""
			|| AJS.$(formElement).find("#verificationRespParty").val() !== ""
			|| AJS.$(formElement).find("#verificationEstComplDate").val() !== ""
			|| AJS.$(formElement).find("#verificationControlAssociation").val() !== "") {
		dirty = true;
	}
	if (dirty === true) {
		if (AJS.$(formElement).find("#verificationDescription").val() === "") {
			AJS.$(formElement).find("[data-error='verificationDescription']").show();
		} else {
			validated = true;
		}
	}
	return {
		"dirty" : dirty,
		"validated" : validated
	};
}



function postFormToVerificationServlet(formElement) {
	AJS.$(formElement).ajaxSubmit({
		async : false,
		success : function(data) {
			if(data.newVerificationID) {
				console.log(data.newVerificationID);
				modifyHTSCookieOpenVerifications("open", data.newVerificationID);
			}
		},
		error : function(error) {
			console.log("ERROR");
		}
	});
}

// The following functions have to do with deleting Verifications
function openDeleteVerificationDialog(verificationIDsToDelete, result) {
	var html1 = "<span class='ConfirmDialogHeadingOne'>Hazard Title: <span class='ConfirmDialogHeadingOneContent'>"
			+ AJS.$("#MissionHazardNavHazardTitle").text()
			+ "</span></span>"
			+ "<span class='ConfirmDialogHeadingOne'>Hazard #: <span class='ConfirmDialogHeadingOneContent'>"
			+ AJS.$("#MissionHazardNavHazardNumber").text() + "</span></span>";
	var html2;
	if (verificationIDsToDelete.length === 1) {
		html2 = "<div class='ConfirmDialogContentTwo'><span class='ConfirmDialogHeadingTwo'>"
				+ "The following Verification will be deleted from the above Hazard Report. In order to complete the deletion, you will need to provide a short delete reason."
				+ "</span></div>";
	} else {
		html2 = "<div class='ConfirmDialogContentTwo'><span class='ConfirmDialogHeadingTwo'>"
				+ "The following Verifications will be deleted from the above Hazard Report. In order to complete the deletion, you will need to provide a short delete reason for each of the Verifications."
				+ "</span></div>";
	}
	var html3 = "<table>"
			+ "<thead>"
			+ "<tr>"
			+ "<th class='ConfirmDialogTableHeader ConfirmDialogTableCellOne'>#</th>"
			+ "<th class='ConfirmDialogTableHeader ConfirmDialogTableCellTwo'>Description</th>"
			+ "<th class='ConfirmDialogTableHeader ConfirmDialogTableCellThree'>Status</th>"
			+ "</tr>" + "</thead>" + "<tbody>";
	for (var i = 0; i < verificationIDsToDelete.length; i++) {
		var verificationFirstRow = AJS.$("#VerificationTableEntryID"
				+ verificationIDsToDelete[i]);
		html3 += "<tr><td colspan='100%' class='ConfirmDialogTableNoBorder'><div class='ConformDialogEmptyRow'></div></td></tr>";
		html3 += "<tr><td class='ConfirmDialogTableNoBorder'>"
				+ verificationFirstRow.children(".verificationNumber").text()
						.replace("Verification ", "") + "</td>";
		html3 += "<td class='ConfirmDialogTableNoBorder'><div class='ConfirmDialogDescriptionText'>"
				+ verificationFirstRow.children(".verificationDescription").text()
				+ "</div></td>";
		html3 += "<td class='ConfirmDialogTableNoBorder'>"
				+ verificationFirstRow.children(".verificationStatus").text()
				+ "</td>";
		html3 += "</tr>";

		if (i === 0 && verificationIDsToDelete.length > 1) {
			html3 += "<tr>"
					+ "<td colspan='100%' class='ConfirmDialogTableNoBorder'>"
					+ "<div class='ConfirmDialogLabelContainer'>"
					+ "<label for='ReasonTextForVerification'><span class='HTSRequired'>* </span>Reason</label>"
					+ "</div>"
					+ "<div class='ConfirmDialogReasonTextContainer'>"
					+ "<input type='text' class='ConfirmDialogReasonTextInput' name='ReasonTextForVerification' id='ReasonTextForVerificationID"
					+ verificationIDsToDelete[i]
					+ "'>"
					+ "</div>"
					+ "<div class='ConfirmDialogDuplButtonContainer'>"
					+ "<button class='aui-button ConfirmDialogDuplButton' id='ConfirmDialogDuplBtnVerifications'>Apply to all</button>"
					+ "</div>" + "</td>" + "</tr>";
		} else {
			html3 += "<tr>"
					+ "<td colspan='100%' class='ConfirmDialogTableNoBorder'>"
					+ "<div class='ConfirmDialogLabelContainer'>"
					+ "<label for='ReasonTextForVerification'><span class='HTSRequired'>* </span>Reason</label>"
					+ "</div>"
					+ "<div class='ConfirmDialogReasonTextContainerNoButton'>"
					+ "<input type='text' class='ConfirmDialogReasonTextInput' name='ReasonTextForVerification' id='ReasonTextForVerificationID"
					+ verificationIDsToDelete[i] + "'>" + "</div>" + "</td>"
					+ "</tr>";
		}
		
		var transferOrigins = getTransferOrigins(verificationIDsToDelete[i], "verification");
		if(transferOrigins.verifications.length > 0) {
			html3 += "<tr><td colspan='100%' class='ConfirmDialogTableNoBorder'><p class='ConfirmDialogErrorText'>Warning: This verification is the target of a transfer:</p></td></tr>";
		}
		
		for(var j = 0; j < transferOrigins.verifications.length; j++) {
			html3 += "<tr>" +
				"<td colspan='100%' class='ConfirmDialogTableNoBorder'>" +
				"<p class='ConfirmDialogErrorText ConfirmDialogErrorTextHidden' id='ConfirmDialogTransferWarningForVerificationID" + verificationIDsToDelete[i] +"'>"+getTransferTargetDeleteWarning(transferOrigins.verifications[j], "verification")+"</p>" +
				"</td>" +
				"</tr>";
		}	
		
		
		html3 += "<tr>"
				+ "<td colspan='100%' class='ConfirmDialogTableNoBorder'>"
				+ "<p class='ConfirmDialogErrorText ConfirmDialogErrorTextHidden' id='ConfirmDialogErrorTextForVerificationID"
				+ verificationIDsToDelete[i] + "'></p>" + "</td>" + "</tr>";
	}
	html3 += "<tr><td colspan='100%' class='ConfirmDialogTableNoBorder'><div class='ConformDialogEmptyRow'></div></td></tr></tbody></table>";

	var dialog = new AJS.Dialog({
		width : 600,
		height : 475,
		id : "deleteDialog",
	});

	dialog.addHeader("Confirm");
	dialog.addPanel("Panel 1", "<div class='panelBody'>" + html1 + html2
			+ html3 + "</div>", "panel-body");
	dialog.get("panel:0").setPadding(10);

	dialog.addButton("Cancel", function(dialog) {
		dialog.hide();
		dialog.remove();
		deselectAllVerifications();
		result.existingDelete = false;
		displayAppropriateMessage(result, "Verification");
	});

	dialog.addButton("Continue", function(dialog) {
		var validated = deleteVerificationFormValidation(verificationIDsToDelete);
		if (validated === true) {
			for (var i = 0; i < verificationIDsToDelete.length; i++) {
				postDeleteToVerificationServlet(verificationIDsToDelete[i],
						AJS.$("#ReasonTextForVerificationID"+ verificationIDsToDelete[i]).val());
			}
			dialog.hide();
			dialog.remove();
			displayAppropriateMessage(result, "Verification");
		}
	});

	dialog.show();
}

function postDeleteToVerificationServlet(verificationIDToDelete, reason) {
	AJS.$.ajax({
		type : "DELETE",
		async : false,
		url : "verifications?id=" + verificationIDToDelete + "&reason="	+ reason,
		success : function(data) {
			modifyHTSCookieOpenVerifications("close", verificationIDToDelete, null);
		},
		error : function(data) {
			console.log("ERROR");
		}
	});
}

function deleteVerificationFormValidation(verificationIDsToDelete) {
	var validated = true;
	for (var i = 0; i < verificationIDsToDelete.length; i++) {
		var deleteReason = AJS.$("#ReasonTextForVerificationID" + verificationIDsToDelete[i]).val();
		var errorElement = AJS.$("#ConfirmDialogErrorTextForVerificationID"	+ verificationIDsToDelete[i]);
		if (deleteReason === "") {
			AJS.$(errorElement).text("For the Verification above, please provide a short delete reason.");
			AJS.$(errorElement).show();
			validated = false;
		} else {
			if (AJS.$(errorElement).is(":visible")) {
				AJS.$(errorElement).text("");
				AJS.$(errorElement).hide();
			}
		}
	}
	return validated;
}

function deselectAllVerifications() {
	var checkboxes = AJS.$(".VerificationPageDeleteBox:checked");
	checkboxes.each(function() {
		AJS.$(this).attr("checked", false);
	});
}