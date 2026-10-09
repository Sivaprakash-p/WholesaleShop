package com.wholesale.orderapp.dto;

import lombok.Data;

public class AuthDto {
    
    @Data
    public static class RegisterRequest {
        private String name;
        private String email;
        private String password;
        private String role; // Optional, defaults to employee
    }
    
    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }
    
    @Data
    public static class AuthResponse {
        private String token; // For future JWT
        private String message;
        private UserDto user;
    }
    
    @Data
    public static class UserDto {
        private Long id;
        private String name;
        private String email;
        private String role;
    }
}
