package com.podra.loader;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 
 * Shorthand for:
 * @Configuration -- source of bean definitions for application context
 * @EnableAutoConfiguration -- Spring starts adding beans from classpath++
 * @ComponentScan -- looks for other components/configs/services in package!
 */
@SpringBootApplication
public class LoaderApplication {

	public static void main(String[] args) {
		SpringApplication.run(LoaderApplication.class, args);
	}

}
