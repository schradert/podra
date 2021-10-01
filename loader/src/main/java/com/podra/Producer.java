
package com.podra;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.podra.types.Message;
import com.podra.types.Comment;

@RestController
public class Producer {

	@Autowired
	private KafkaTemplate<String, Object> template;

	@PostMapping(path = "/send/post/{value}")
	public void sendPost(@PathVariable String value) {

        this.template
            .send("posts", new Post(value))
            .addCallback(new ListenableFutureCallback<SendResult<String, String>>() {

                @Override
                public void onSuccess(SendResult<String, String> result) {
                    logger.info(String.format("Sent message=[%s] with offset=[%s]", message, result.getRecordMetadata().offset()));
                }

                @Override
                public void onFailure(Throwable ex) {
                    logger.info(String.format("Unable to send message=[%s] due to : %s", message, ex.getMessage()));
                }
            });
	}

    @PostMapping(path = "/send/comment/{value}")
	public void sendComment(@PathVariable String value) {
		this.template.send("comments", new Comment(value));
	}

    @PostMapping(path = "/send/unknown/{value}")
    public void sendUnknown(@PathVariable String value) {
        // sends unknown types to "post" topic
        this.template.send("posts", value);
    }

}
