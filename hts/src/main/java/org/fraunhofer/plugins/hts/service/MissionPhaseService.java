package org.fraunhofer.plugins.hts.service;

import static com.google.common.base.Preconditions.checkNotNull;
import static com.google.common.collect.Lists.newArrayList;

import java.util.List;

import org.fraunhofer.plugins.hts.model.Mission_Phase;

import com.atlassian.activeobjects.external.ActiveObjects;
import com.atlassian.activeobjects.tx.Transactional;

@Transactional
public class MissionPhaseService {
	private final ActiveObjects ao;

	private static boolean initialized = false;
	private static Object _lock = new Object();

	public MissionPhaseService(ActiveObjects ao) {
		this.ao = checkNotNull(ao);
	}

	private Mission_Phase add(String label) {
		final Mission_Phase phase = ao.create(Mission_Phase.class);
		phase.setLabel(label);
		phase.save();
		return phase;
	}

	public Mission_Phase[] getMissionPhasesByID(Integer[] id) {
		initializeTable();
		if (id == null) {
			return null;
		} else {
			Mission_Phase[] missionPhaseArr = new Mission_Phase[id.length];
			for (int i = 0; i < id.length; i++) {
				missionPhaseArr[i] = ao.get(Mission_Phase.class, id[i]);
			}
			return missionPhaseArr;
		}
	}

	public List<Mission_Phase> getRemaining(Mission_Phase[] currentList) {
		initializeTable();
		List<Mission_Phase> listAll = newArrayList(ao.find(Mission_Phase.class));

		if (!listAll.isEmpty()) {
			for (Mission_Phase currRegistered : currentList) {
				listAll.remove(currRegistered);
			}
		}

		return listAll;
	}

	private void initializeTable() {
		synchronized (_lock) {
			if (!initialized) {
				if (ao.find(Mission_Phase.class).length == 0) {
					add("Pre-launch");
					add("Launch");
					add("Cruise");
					add("Encounter");
					add("Extended Operations");
					add("Decommissioning");
				}
				initialized = true;
			}
		}

	}
}
