package com.podra.loader.models;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.hateoas.RepresentationModel;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import lombok.ToString;
import lombok.AccessLevel;
import lombok.Setter;


enum Status {
    SUCCESS, FAILURE;
}

/**
 * Shorthand for:
 * @Getter -- creates getters for all fields
 * @Setter -- creates setteres for all fields
 * @ToString -- creates string repr of object
 * @EqualsAndHashCode -- implements these methods too
 * @RequiredArgsConstructor -- overridden if constructor is provided
 *  The @Data annotation will defer to overrides above ^^
 */
@ToString(includeFieldNames = true)
@Data(staticConstructor = "of")
public class Message<T> extends RepresentationModel<Message<T>> {

    private static final Logger logger = LoggerFactory.getLogger(Message.class);
    private static final String LOG_TEMPLATE = "Message %d { %s }";

    private final long id;
    private final T content;
    @Setter(AccessLevel.PACKAGE) private Status status;

    @JsonCreator // how Jackson will create POJO
    public Message(
        long id,
        // marks Jackson field to put constructor argument
        @JsonProperty("content") T content
    ) {
        this.id = id;
        this.content = content;
        this.status = Status.SUCCESS;
    }

    public boolean isFailure() {
        return this.status == Status.FAILURE;
    }

    public void log() {
        Message.logger.info(LOG_TEMPLATE, this.id, this.content);
    }
}