package com.podra.loader;

import org.springframework.kafka.annotation.TopicPartition;
import org.springframework.kafka.annotation.KafkaHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.DltHandler;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import org.springframework.core.task.SimpleAsyncTaskExecutor;
import org.springframework.core.task.TaskExecutor;
import org.springframework.kafka.support.KafkaHeaders;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.podra.loader.models.Post;
import com.podra.loader.models.Comment;

@Component
@KafkaListener(
    id = "redditListener", 
    topics = { "posts", "posts.DLT", "comments", "comments.DLT" },
    groupId = "reddit",
    topicPartitions = @TopicPartition(
        topic = "posts",
        partitions = { "0", "1" }
    ),
    containerFactory = "filterKafkaListenerContainerFactory"
)
public class Listener {

    private static final Logger logger = LoggerFactory.getLogger(Listener.class);
	private final TaskExecutor exec = new SimpleAsyncTaskExecutor();

	@KafkaHandler
	public void comment(Comment comment) {
		this.log("Received " + comment);
	}

	@KafkaHandler
	public void post(
        @Payload Post post,
        @Header(KafkaHeaders.RECEIVED_PARTITION_ID) int partition
    ) {
		this.log(
            String.format("Received %s from partition %d", post, partition)
        );
	}

	@KafkaHandler(isDefault = true)
	public void unknown(Object object) {
		this.log("Received (unknown) " + object);
	}

	@DltHandler
	public void listenDLT(
        String in, 
        @Header(KafkaHeaders.RECEIVED_TOPIC) String topic
    ) {
		this.log(String.format("Received (%s): %s", topic, in));
    }

    private void log(String message) {
        this.exec.execute(() -> logger.info(message));
    }
}
