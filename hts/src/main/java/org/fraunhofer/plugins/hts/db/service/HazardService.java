package org.fraunhofer.plugins.hts.db.service;

import java.util.Date;
import java.util.List; 

import org.fraunhofer.plugins.hts.db.Hazard_Group;
import org.fraunhofer.plugins.hts.db.Hazards;
import org.fraunhofer.plugins.hts.db.Review_Phases;
import org.fraunhofer.plugins.hts.db.Risk_Categories;
import org.fraunhofer.plugins.hts.db.Risk_Likelihoods;
import com.atlassian.activeobjects.tx.Transactional;

@Transactional
public interface HazardService {
	Hazards add(String title, String description, String preparer, String hazardNum, Date created, Date completed, Date lastEdit,
			Risk_Categories risk, Risk_Likelihoods likelihood, Hazard_Group group, Review_Phases reviewPhase);
	Hazards getHazardByID(String id);
	Hazards update(Hazards updated);
	List<Hazards> all();
}
