
package com.podra.loader.controllers;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.util.concurrent.ListenableFutureCallback;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
// import java.util.concurrent.atomic.AtomicLong;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.podra.loader.models.Comment;
import com.podra.loader.models.Post;

/**
 * Shorthand for:
 * @Controller
 * @ResponseBody
 */
@RestController
public class KafkaProducer {

	@Autowired
	private KafkaTemplate<String, Object> template;
    private static final Logger logger = LoggerFactory.getLogger(KafkaProducer.class);

    private static final String SITE_IS_UP = "Site is up!";
    private static final String SITE_IS_DOWN = "Site is down!";
    private static final String INCORRECT_URL = "URL is incorrect!";

    private static final String GREETING_TEMPLATE = "Hello, %s!";
    // private final AtomicLong counter = new AtomicLong();

	@PostMapping(path = "/send/post/{value}")
	public void sendPost(@PathVariable String value) {

        Post post = new Post("user", 1, value);

        this.template
            .send("posts", post)
            .addCallback(new ListenableFutureCallback<SendResult<String, Object>>() {

                @Override
                public void onSuccess(SendResult<String, Object> result) {
                    logger.info(String.format("Sent message=[%s] with offset=[%s]", result, result.getRecordMetadata().offset()));
                }

                @Override
                public void onFailure(Throwable ex) {
                    logger.info(String.format("Unable to send message=[%s] due to : %s", post, ex.getMessage()));
                }
            });
	}

    @PostMapping(path = "/send/comment/{value}")
	public void sendComment(@PathVariable String value) {
		this.template.send("comments", new Comment("user", 1, value));
	}

    @PostMapping(path = "/send/unknown/{value}")
    public void sendUnknown(@PathVariable String value) {
        // sends unknown types to "post" topic
        this.template.send("posts", value);
    }
    
    @GetMapping("/check")
    public String getUrlStatusMessage(@RequestParam String url) {
        String message = "";
        try {
            URL urlObj = new URL(url);
            HttpURLConnection conn = (HttpURLConnection) urlObj.openConnection();
            conn.setRequestMethod("GET");
            conn.connect();

            int responseCodeCategory = conn.getResponseCode() / 100;
            if (responseCodeCategory != 2 && responseCodeCategory != 3) {
                message = SITE_IS_DOWN;
            } else {
                message = SITE_IS_UP;
            }
        } catch (MalformedURLException e) {
            message = INCORRECT_URL;
        } catch(IOException e) {
            message = SITE_IS_DOWN;
        }
        return message;
    }

    @GetMapping("/greeting")
    public HttpEntity<Post> post(
        @RequestParam(value = "name", defaultValue = "World") String name
    ) {
        Post post = new Post(
            // counter.incrementAndGet(),
            "user", 1, String.format(GREETING_TEMPLATE, name)
        );
        post.add(linkTo(methodOn(KafkaProducer.class).post(name)).withSelfRel());

        return new ResponseEntity<>(post, HttpStatus.OK);
    }

}
