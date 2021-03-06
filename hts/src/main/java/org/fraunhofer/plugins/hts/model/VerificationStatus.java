package org.fraunhofer.plugins.hts.model;

import net.java.ao.Entity;
import net.java.ao.OneToOne;
import net.java.ao.schema.Table;

@Table("VerificationStatus")
public interface VerificationStatus extends Entity {
	
	String getLabel();

	void setLabel(String label);
	
	@OneToOne
	Verifications getVerification();
}