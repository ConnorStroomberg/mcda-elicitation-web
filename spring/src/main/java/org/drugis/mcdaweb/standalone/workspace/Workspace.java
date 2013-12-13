package org.drugis.mcdaweb.standalone.workspace;

import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.databind.JsonNode;

public class Workspace {
	private int id;
	private int owner;
	private String title;
	private Object problem;
	
	public Workspace() {

	}
	
	public Workspace(int id, int owner, String title, String problem) {
		this.id = id;
		this.owner = owner;
		this.title = title;
		this.problem = problem;
	}
	
	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	@JsonRawValue
	public String getProblem() {
		return problem == null ? "{}" : problem.toString();
	}

	public void setProblem(JsonNode node) {
		this.problem = node;
	}

	public int getId() {
		return id;
	}

	public int getOwner() {
		return owner;
	}
}