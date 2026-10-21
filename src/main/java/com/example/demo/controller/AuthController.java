package com.example.demo.controller;

import com.example.demo.entity.Customer;
import com.example.demo.repository.CustomerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final CustomerRepository customerRepository;
    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public AuthController(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    // Customer Registration
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request) {

        if (request.name() == null || request.name().isBlank()
                || request.email() == null || request.email().isBlank()
                || request.password() == null
                || request.password().length() < 8) {

            return ResponseEntity.badRequest().body(
                    Map.of("message",
                            "Name and email are required. Password must contain at least 8 characters.")
            );
        }

        String email = request.email().trim().toLowerCase();

        if (customerRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    Map.of("message", "Email is already registered.")
            );
        }

        Customer customer = new Customer();
        customer.setName(request.name().trim());
        customer.setEmail(email);
        customer.setPhone(request.phone());
        customer.setPassword(passwordEncoder.encode(request.password()));

        Customer savedCustomer = customerRepository.save(customer);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                        "message", "Registration successful.",
                        "customer", savedCustomer
                )
        );
    }

    // Customer Login
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        if (request.email() == null || request.password() == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Email and password are required.")
            );
        }

        String email = request.email().trim().toLowerCase();

        Customer customer = customerRepository.findByEmail(email)
                .orElse(null);

        if (customer == null
                || customer.getPassword() == null
                || !passwordEncoder.matches(
                request.password(), customer.getPassword())) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("message", "Invalid email or password.")
            );
        }

        return ResponseEntity.ok(
                Map.of(
                        "message", "Login successful.",
                        "customer", customer
                )
        );
    }

    public record RegisterRequest(
            String name,
            String email,
            String password,
            String phone
    ) {}

    public record LoginRequest(
            String email,
            String password
    ) {}
}