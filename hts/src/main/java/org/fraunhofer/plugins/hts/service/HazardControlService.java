package org.fraunhofer.plugins.hts.service;

import static com.google.common.base.Preconditions.checkNotNull;
import static com.google.common.collect.Lists.newArrayList;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import net.java.ao.Query;

import org.fraunhofer.plugins.hts.model.ControlGroups;
import org.fraunhofer.plugins.hts.model.ControlToCause;
import org.fraunhofer.plugins.hts.model.ControlToHazard;
import org.fraunhofer.plugins.hts.model.Hazard_Causes;
import org.fraunhofer.plugins.hts.model.Hazard_Controls;
import org.fraunhofer.plugins.hts.model.Hazards;
import org.fraunhofer.plugins.hts.model.Transfers;
import org.fraunhofer.plugins.hts.rest.model.ControlJSON;
import org.fraunhofer.plugins.hts.view.model.HazardControlTransfer;

import com.atlassian.activeobjects.external.ActiveObjects;
import com.google.common.base.Strings;

public class HazardControlService {
	private final ActiveObjects ao;
	private final HazardService hazardService;
	private final TransferService transferService;
	private final HazardCauseService hazardCauseService;

	public HazardControlService(ActiveObjects ao, HazardService hazardService, TransferService transferService,
			HazardCauseService hazardCauseService) {
		this.ao = checkNotNull(ao);
		this.hazardService = checkNotNull(hazardService);
		this.transferService = checkNotNull(transferService);
		this.hazardCauseService = hazardCauseService;
	}

	public Hazard_Controls add(int hazardID, String description, ControlGroups controlGroup, Hazard_Causes[] causes) {
		Hazard_Controls control = ao.create(Hazard_Controls.class);
		Hazards hazard = hazardService.getHazardByID(hazardID);
		control.setControlNumber(hazard.getHazardControls().length + 1);
		control.setTransfer(0);
		control.setDescription(description);
		control.setControlGroup(controlGroup);
		if (causes != null) {
			for (Hazard_Causes cause : causes) {
				associateControlToCause(control, cause);
			}
		}
		control.setOriginalDate(new Date());
		control.setLastUpdated(new Date());
		control.save();
		associateControlToHazard(hazard, control);
		return control;
	}

	public Hazard_Controls updateRegularControl(int controlID, String description, ControlGroups controlGroup,
			Hazard_Causes[] causes) {
		Hazard_Controls control = getHazardControlByID(controlID);
		control.setDescription(description);
		control.setControlGroup(controlGroup);

		if (causes != null) {
			removeAssociationsControlToCause(control.getID());
			for (Hazard_Causes cause : causes) {
				associateControlToCause(control, cause);
			}
		} else {
			removeAssociationsControlToCause(control.getID());
		}
		control.setLastUpdated(new Date());
		control.save();
		return control;
	}

	public Hazard_Controls updateTransferredControl(int controlID, String transferReason) {
		Hazard_Controls control = getHazardControlByID(controlID);
		control.setDescription(transferReason);
		control.setLastUpdated(new Date());
		control.save();
		return control;
	}

	public Hazard_Controls getHazardControlByID(int controlID) {
		final Hazard_Controls[] control = ao.find(Hazard_Controls.class, Query.select().where("ID=?", controlID));
		return control.length > 0 ? control[0] : null;
	}

	public List<Hazard_Controls> getAllControlsWithinAHazard(Hazards hazard) {
		return newArrayList(hazard.getHazardControls());
	}

	public List<Hazard_Controls> getAllNonDeletedControlsWithinAHazard(Hazards hazard) {
		List<Hazard_Controls> allRemaining = new ArrayList<Hazard_Controls>();
		for (Hazard_Controls current : getAllControlsWithinAHazard(hazard)) {
			if (Strings.isNullOrEmpty(current.getDeleteReason())) {
				allRemaining.add(current);
			}
		}
		return allRemaining;
	}

	public List<ControlJSON> getAllNonDeletedControlsWithinCauseMinimalJson(int causeID) {
		Hazard_Causes cause = hazardCauseService.getHazardCauseByID(causeID);
		List<ControlJSON> controls = new ArrayList<ControlJSON>();
		if (cause != null) {
			for (Hazard_Controls control : cause.getControls()) {
				if (Strings.isNullOrEmpty(control.getDeleteReason())) {
					if (control.getTransfer() == 0) {
						// Regular Control
						controls.add(new ControlJSON(control.getID(), control.getControlNumber(), control
								.getDescription(), false, true, "CONTROL"));
					} else {
						// Transferred Control
						Transfers transfer = transferService.getTransferByID(control.getTransfer());
						if (transfer.getTargetType().equals("CONTROL")) {
							Hazard_Controls targetControl = getHazardControlByID(transfer.getTargetID());
							controls.add(new ControlJSON(control.getID(), control.getControlNumber(), targetControl
									.getDescription(), true, true, "CONTROL"));
						} else if (transfer.getTargetType().equals("CAUSE")) {
							Hazard_Causes targetCause = hazardCauseService.getHazardCauseByID(transfer.getTargetID());
							controls.add(new ControlJSON(control.getID(), control.getControlNumber(), targetCause
									.getTitle(), true, true, "CONTROL"));
						}
					}
				}
			}
		}
		return controls;
	}

	public List<HazardControlTransfer> getAllTransferredControls(Hazards hazard) {
		List<HazardControlTransfer> transferredControls = new ArrayList<HazardControlTransfer>();
		List<Hazard_Controls> allControlsWithinHazard = getAllControlsWithinAHazard(hazard);
		for (Hazard_Controls originControl : allControlsWithinHazard) {
			if (originControl.getTransfer() != 0) {
				Transfers transfer = transferService.getTransferByID(originControl.getTransfer());
				if (transfer.getTargetType().equals("CONTROL")) {
					// ControlToControl transfer
					Hazard_Controls targetControl = getHazardControlByID(transfer.getTargetID());
					transferredControls.add(HazardControlTransfer.createControlToControl(transfer, originControl,
							targetControl));
				} else {
					// ControlToCause
					Hazard_Causes targetCause = hazardCauseService.getHazardCauseByID(transfer.getTargetID());
					transferredControls.add(HazardControlTransfer.createControlToCause(transfer, originControl,
							targetCause));
				}
			}
		}
		return transferredControls;
	}

	public Hazard_Controls deleteControl(int controlID, String deleteReason) {
		Hazard_Controls control = getHazardControlByID(controlID);
		if (control != null) {
			control.setDeleteReason(deleteReason);
			if (control.getTransfer() != 0) {
				Transfers transfer = transferService.getTransferByID(control.getTransfer());
				removeTransfer(transfer.getID());
				transfer.save();
				control.setTransfer(0);
			}
			control.save();
		}
		return control;
	}

	public Hazard_Controls addControlTransfer(int originHazardID, int targetControlID, String transferReason) {
		Hazard_Controls control = add(originHazardID, transferReason, null, null);
		int transferID = createTransfer(control.getID(), "CONTROL", targetControlID, "CONTROL");
		control.setTransfer(transferID);
		control.save();
		return control;
	}

	public Hazard_Controls addCauseTransfer(int originHazardID, int targetCauseID, String transferReason) {
		Hazard_Controls control = add(originHazardID, transferReason, null, null);
		int transferID = createTransfer(control.getID(), "CONTROL", targetCauseID, "CAUSE");
		control.setTransfer(transferID);
		control.save();
		return control;
	}

	public Hazard_Controls[] getHazardControlsByID(Integer[] id) {
		if (id == null) {
			return null;
		} else {
			Hazard_Controls[] controlsArr = new Hazard_Controls[id.length];
			for (int i = 0; i < id.length; i++) {
				controlsArr[i] = ao.get(Hazard_Controls.class, id[i]);
			}
			return controlsArr;
		}
	}

	private void associateControlToHazard(Hazards hazard, Hazard_Controls control) {
		final ControlToHazard controlToHazard = ao.create(ControlToHazard.class);
		controlToHazard.setHazard(hazard);
		controlToHazard.setControl(control);
		controlToHazard.save();
	}

	private void associateControlToCause(Hazard_Controls control, Hazard_Causes cause) {
		final ControlToCause controlToCause = ao.create(ControlToCause.class);
		controlToCause.setCause(cause);
		controlToCause.setControl(control);
		controlToCause.save();
	}

	private void removeAssociationsControlToCause(int id) {
		ao.delete(ao.find(ControlToCause.class, Query.select().where("CONTROL_ID=?", id)));
	}

	private int createTransfer(int originID, String originType, int targetID, String targetType) {
		Transfers transfer = transferService.add(originID, originType, targetID, targetType);
		return transfer.getID();
	}

	private void removeTransfer(int id) {
		ao.delete(ao.find(Transfers.class, Query.select().where("ID=?", id)));
	}

}
