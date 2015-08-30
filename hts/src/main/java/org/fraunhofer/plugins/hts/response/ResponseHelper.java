package org.fraunhofer.plugins.hts.response;

import javax.ws.rs.core.Response;

import org.fraunhofer.plugins.hts.rest.HazardResourceModel;


public class ResponseHelper {

	public static Response badRequest(Object content) {
		return Response.status(Response.Status.BAD_REQUEST).entity(content).build();
	}

	public static Response notLoggedIn() {
		return forbidden(new HazardResourceModel("User is not logged in"));
	}

	public static Response forbidden(Object content) {
		return Response.status(Response.Status.FORBIDDEN).entity(content).build();
	}
	
}
