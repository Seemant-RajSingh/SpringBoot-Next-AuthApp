package com.srs.AuthApp.controller;

import com.srs.AuthApp.dto.UserDTO;
import com.srs.AuthApp.model.Role;
import com.srs.AuthApp.model.User;
import com.srs.AuthApp.repository.UserRepository;
import com.srs.AuthApp.service.JWTService;
import com.srs.AuthApp.service.UserService;
import com.srs.AuthApp.service.MyUserDetailsService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JWTService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private MyUserDetailsService myUserDetailsService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        try {
            System.out.println("user (input): " + user);
            userService.registerUser(user);
            return ResponseEntity.ok("User registered successfully!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody User user) {
        try {
            System.out.println("in login");
            System.out.println("User: " + user.getUsername() + user.getPassword());
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword())
            );
            System.out.println("Auth complete");

            UserDetails userDetails = myUserDetailsService.loadUserByUsername(user.getUsername());
            System.out.println("collected userDetails: " + userDetails + " " + userDetails.getUsername());
            String jwtToken = jwtService.generateToken(userDetails.getUsername());
            System.out.println("token created: " + jwtToken);

            return ResponseEntity.ok("Bearer " + jwtToken);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid credentials or other authentication error.");
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUsers(HttpServletRequest request) {
        try {
            System.out.println("in /users");

            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String username = userDetails.getUsername();

            User authenticatedUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

            System.out.println("Authenticated user role: " + authenticatedUser.getRole());

            if (authenticatedUser.getRole() == Role.ADMIN) {
                List<UserDTO> allUsers = userRepository.findAll().stream()
                        .map(user -> new UserDTO(user.getUsername(), user.getEmail(), user.getPassword(), user.getRole()))
                        .toList();

                UserDTO adminDTO = new UserDTO(authenticatedUser.getUsername(), authenticatedUser.getEmail(), authenticatedUser.getPassword(), authenticatedUser.getRole());

                System.out.println("Admin and all users fetched: " + allUsers);

                return ResponseEntity.ok(List.of(adminDTO, allUsers));
            } else {
                UserDTO userDTO = new UserDTO(authenticatedUser.getUsername(), authenticatedUser.getEmail(), authenticatedUser.getPassword(), authenticatedUser.getRole());

                System.out.println("Single user fetched: " + userDTO);
                return ResponseEntity.ok(List.of(userDTO));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
        }
    }

}
