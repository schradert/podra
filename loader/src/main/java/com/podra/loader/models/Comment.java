
package com.podra.loader.models;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import org.springframework.hateoas.RepresentationModel;

@Data
public class Comment extends RepresentationModel<Comment> implements Node {

    private final String user;
    private int likes;
	private String body;
    private Status status;
    private Node parent;

    @JsonCreator
    public Comment(
        String user,
        int likes,
        @JsonProperty("body") String body
    ) {
        this.user = user;
        this.likes = likes;
        this.body = body;
        this.status = Status.NOT_DELETED;
    }

    public Node getParent() {
        return this.parent;
    }

    public void setParent(Node parent) {
        this.parent = parent;
    }

    public boolean isValid() {
        return this.status == Status.NOT_DELETED 
            && !"".equals(this.body) 
            && !"".equals(this.user);
    }

    public boolean isNegative() {
        return this.likes < 0;
    }
}