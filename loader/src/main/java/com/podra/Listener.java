package com.podra;

import org.springframework.core.task.SimpleAsyncTaskExecutor;
import org.springframework.core.task.TaskExecutor;
import org.springframework.kafka.annotation.KafkaHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.DltHandler;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.kafka.annotation.TopicPartition;
import org.springframework.stereotype.Component;

import com.podra.types.Post;
import com.podra.types.Comment;


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

	private final TaskExecutor exec = new SimpleAsyncTaskExecutor();

	@KafkaHandler
	public void comment(Comment comment) {
		logger.info("Received: " + comment);
	}

	@KafkaHandler
	public void post(
        @Payload Post post,
        @Header(KafkaHeaders.RECEIVED_PARTITION_ID) int partition
    ) {
		logger.info(String.format("Received: %s from partition %d", message, partition));
	}

	@KafkaHandler(isDefault = true)
	public void unknown(Object object) {
		logger.info("Received (unknown): " + object);
	}

	@DltHandler
	public void listenDLT(String in, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
		logger.info(String.format("Received (%s): %s", topic, in));
    }
}
