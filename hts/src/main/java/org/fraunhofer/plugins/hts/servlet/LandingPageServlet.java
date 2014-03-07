package org.fraunhofer.plugins.hts.servlet;

import org.fraunhofer.plugins.hts.db.Hazards;
import org.fraunhofer.plugins.hts.db.service.HazardGroupService;
import org.fraunhofer.plugins.hts.db.service.HazardService;
import org.fraunhofer.plugins.hts.db.service.MissionPayloadService;
import org.fraunhofer.plugins.hts.db.service.ReviewPhaseService;
import org.fraunhofer.plugins.hts.db.service.RiskCategoryService;
import org.fraunhofer.plugins.hts.db.service.RiskLikelihoodsService;
import org.fraunhofer.plugins.hts.db.service.SubsystemService;

import com.atlassian.templaterenderer.TemplateRenderer;
import com.google.common.collect.Maps;

import javax.servlet.*;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Map;

import static com.google.common.base.Preconditions.*;

public class LandingPageServlet extends HttpServlet{
	private final HazardService hazardService;
	private final HazardGroupService hazardGroupService;
	private final RiskCategoryService riskCategoryService;
	private final RiskLikelihoodsService riskLikelihoodService;
	private final ReviewPhaseService reviewPhaseService;
	private final TemplateRenderer templateRenderer;
	
	public LandingPageServlet(HazardService hazardService, HazardGroupService hazardGroupService, TemplateRenderer templateRenderer, RiskCategoryService riskCategoryService, 
			RiskLikelihoodsService riskLikelihoodService, SubsystemService subsystemService, ReviewPhaseService reviewPhaseService, MissionPayloadService missionPayloadService) {
		this.hazardService = checkNotNull(hazardService);
		this.hazardGroupService = checkNotNull(hazardGroupService);
		this.riskCategoryService = checkNotNull(riskCategoryService);
		this.riskLikelihoodService = checkNotNull(riskLikelihoodService);
		this.reviewPhaseService = checkNotNull(reviewPhaseService);
		this.templateRenderer = templateRenderer;
	}

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException
    {
    	if ("y".equals(req.getParameter("edit"))) {
    		Hazards hazard = hazardService.getHazardByID(req.getParameter("key"));
    		Map<String, Object> context = Maps.newHashMap();
    		context.put("hazard", hazard);
    		context.put("hazardGroups", hazardGroupService.all());
    		context.put("riskCategories", riskCategoryService.all());
    		context.put("riskLikelihoods", riskLikelihoodService.all());
    		context.put("reviewPhases", reviewPhaseService.all());
    		resp.setContentType("text/html");
    		templateRenderer.render("templates/EditHazard.vm", context, resp.getWriter());
    	}
    	else {
    		Map<String, Object> context = Maps.newHashMap();
        	context.put("hazardReports", hazardService.all());
            resp.setContentType("text/html");
            templateRenderer.render("templates/LandingPage.vm", context, resp.getWriter());
    	}
    }

}