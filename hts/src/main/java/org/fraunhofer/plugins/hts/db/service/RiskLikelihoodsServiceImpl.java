package org.fraunhofer.plugins.hts.db.service;

import static com.google.common.base.Preconditions.checkNotNull;
import static com.google.common.collect.Lists.newArrayList;

import java.util.List;

import net.java.ao.Query;

import org.fraunhofer.plugins.hts.db.Risk_Categories;
import org.fraunhofer.plugins.hts.db.Risk_Likelihoods;

import com.atlassian.activeobjects.external.ActiveObjects;

public class RiskLikelihoodsServiceImpl implements RiskLikelihoodsService {
	private final ActiveObjects ao;
	
	public RiskLikelihoodsServiceImpl(ActiveObjects ao) {
		this.ao = checkNotNull(ao);
	}
	
	@Override
	public Risk_Likelihoods add(String value, String likeliHoodDesc) {
		final Risk_Likelihoods likelihood = ao.create(Risk_Likelihoods.class);
		likelihood.setValue(value);
		likelihood.setLikelihoodDesc(likeliHoodDesc);
		return likelihood;
	}

	@Override
	public List<Risk_Likelihoods> all() {
		return newArrayList(ao.find(Risk_Likelihoods.class));
	}

	@Override
	public Risk_Likelihoods getLikelihoodByID(String id) {
		// TODO Auto-generated method stub
		final Risk_Likelihoods[] likelihood = ao.find(Risk_Likelihoods.class, Query.select().where("ID=?", id));
		return likelihood.length > 0 ? likelihood[0] : null;
	}

}
