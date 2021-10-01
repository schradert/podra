package com.podra;

import org.apache.kafka.clients.admin.NewTopic;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;

import org.springframework.core.task.SimpleAsyncTaskExecutor;
import org.springframework.core.task.TaskExecutor;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaOperations;
import org.springframework.kafka.listener.DeadLetterPublishingRecoverer;
import org.springframework.kafka.listener.SeekToCurrentErrorHandler;
import org.springframework.kafka.support.converter.RecordMessageConverter;
import org.springframework.kafka.support.converter.StringJsonMessageConverter;

import org.springframework.util.backoff.FixedBackOff;

import com.podra.Post;

@SpringBootApplication
public class Consumer {

    private final Logger logger = LoggerFactory.getLogger(Consumer.class);
	private final TaskExecutor exec = new SimpleAsyncTaskExecutor();

	public static void main(String[] args) {
		SpringApplication.run(Consumer.class, args).close();
	}

    /**
     * Replays failed messages max twice, after 1 second delay
     * Forwards to dead-letter topic if bad message
     */
    @Bean
	public SeekToCurrentErrorHandler errorHandler(
        KafkaOperations<Object, Object> template
    ) {

        // TODO: add topic suffixing strategy 
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
		return new NewTopic("post", 1, (short) 1);
	}

	@Bean
	public NewTopic postsDLT() {
		return new NewTopic("post.DLT", 1, (short) 1);
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
			this.prompt();
			System.in.read();
		};
	}

    private void prompt() {
        System.out.println("Hit Enter to terminate...");
    }
}


@EnableKafka
@Configuration
public class KafkaConsumerConfig {

        @Bean
    public ConsumerFactory<String, String> consumerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(
          ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, 
          bootstrapAddress);
        props.put(
          ConsumerConfig.GROUP_ID_CONFIG, 
          groupId);
        props.put(
          ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, 
          StringDeserializer.class);
        props.put(
          ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, 
          StringDeserializer.class);
        return new DefaultKafkaConsumerFactory<>(
            props,
            new StringDeserializer(),
            new JsonDeserializer<>(Post.class)
        );
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, String> 
      filterKafkaListenerContainerFactory() {
   
        ConcurrentKafkaListenerContainerFactory<String, Post> factory =
          new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        factory.setRecordFilterStrategy(
            record -> record.value().contains("World");
        )
        return factory;
    }
}
