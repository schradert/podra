
package com.podra.loader.models;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.hateoas.RepresentationModel;

import lombok.Data;

@Data
public class Post extends RepresentationModel<Post> implements Node {

    private final String user;
    private int likes;
	private String body;
    private Status status;
    private static final Node parent = Node.ROOT;
    private static final Logger logger = LoggerFactory.getLogger(Post.class);

    @JsonCreator
    public Post(
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
        return Post.parent;
    }

    public void setParent(Node parent) {
        Post.logger.error("Cannot set parent node of Post!");
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