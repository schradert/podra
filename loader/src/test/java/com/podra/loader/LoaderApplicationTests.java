package com.podra.loader;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import com.podra.loader.models.*;

@SpringBootTest
@TestPropertySource(properties = "spring.profiles.active=test")
class LoaderApplicationTests {

	@Test
	void messages() {
        Message<String> message = new Message<>(0L, "value");
        assertFalse(message.isFailure());
    }

}
