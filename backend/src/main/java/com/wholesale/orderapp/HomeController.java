package com.wholesale.orderapp;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@CrossOrigin(origins = "*")
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "Wholesale Order App Spring Boot API is running!";
    }
}
