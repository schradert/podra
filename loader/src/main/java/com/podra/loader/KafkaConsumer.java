package com.podra.loader;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;

import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.core.task.SimpleAsyncTaskExecutor;
import org.springframework.core.task.TaskExecutor;
import org.springframework.kafka.core.KafkaOperations;
import org.springframework.kafka.listener.DeadLetterPublishingRecoverer;
import org.springframework.kafka.listener.SeekToCurrentErrorHandler;
import org.springframework.kafka.support.converter.RecordMessageConverter;
import org.springframework.kafka.support.converter.StringJsonMessageConverter;
import org.springframework.util.backoff.FixedBackOff;

import org.apache.kafka.clients.admin.NewTopic;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
public class KafkaConsumer {

    private final Logger logger = LoggerFactory.getLogger(KafkaConsumer.class);
	private final TaskExecutor exec = new SimpleAsyncTaskExecutor();

	public static void main(String[] args) {
		SpringApplication.run(KafkaConsumer.class, args).close();
	}

    /**
     * Replays failed messages max twice, after 1 second delay
     * Forwards to dead-letter topic if bad message
     */
    @Bean
	public SeekToCurrentErrorHandler errorHandler(
        KafkaOperations<Object, Object> template
    ) {
		return new SeekToCurrentErrorHandler(
            new DeadLetterPublishingRecoverer(template), 
            new FixedBackOff(1000L, 2)
        );
	}

    @Bean
	public RecordMessageConverter converter() {
		return new StringJsonMessageConverter();
	}

	@Bean
	public NewTopic posts() {
		return new NewTopic("posts", 1, (short) 1);
	}

	@Bean
	public NewTopic postsDLT() {
		return new NewTopic("posts.DLT", 1, (short) 1);
	}

    @Bean
	public NewTopic comments() {
		return new NewTopic("comments", 1, (short) 1);
	}

	@Bean
	public NewTopic commentsDLT() {
		return new NewTopic("comments.DLT", 1, (short) 1);
	}

	@Bean
	@Profile("default")
	public ApplicationRunner runner() {
		return args -> {
            this.exec.execute(() -> this.logger.info("Running ..."));
            System.in.read();
        };
	}
}
