package com.podra;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = "spring.profiles.active=test")
class LoaderApplicationTests {

    private final Logger logger = LoggerFactory.getLogger(LoaderApplicationTests.class);

	@Test
	void contextLoads() {
        logger.info("Unimplemented");
    }

}
