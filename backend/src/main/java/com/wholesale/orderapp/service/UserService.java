package com.wholesale.orderapp.service;

import com.wholesale.orderapp.dto.AuthDto.*;
import com.wholesale.orderapp.entity.User;
import com.wholesale.orderapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already taken!");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        // In a real app, you would hash the password using BCryptPasswordEncoder
        user.setPassword(request.getPassword());
        
        // Default role based on email or provided role
        String role = (request.getRole() != null && !request.getRole().isEmpty()) 
                      ? request.getRole() 
                      : (request.getEmail().toLowerCase().contains("admin") ? "admin" : "employee");
        user.setRole(role);

        User savedUser = userRepository.save(user);

        return buildAuthResponse("User registered successfully", savedUser);
    }

    public AuthResponse login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // In a real app, compare hashed passwords!
            if (user.getPassword().equals(request.getPassword())) {
                return buildAuthResponse("Login successful", user);
            } else {
                throw new RuntimeException("Invalid password!");
            }
        } else {
            throw new RuntimeException("User not found!");
        }
    }

    private AuthResponse buildAuthResponse(String message, User user) {
        AuthResponse response = new AuthResponse();
        response.setMessage(message);
        // Dummy token for now
        response.setToken("dummy-jwt-token-123");
        
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setName(user.getName());
        userDto.setEmail(user.getEmail());
        userDto.setRole(user.getRole());
        
        response.setUser(userDto);
        return response;
    }
}
