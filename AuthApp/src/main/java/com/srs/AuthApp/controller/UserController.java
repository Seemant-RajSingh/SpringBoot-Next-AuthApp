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
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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
            return ResponseEntity.badRequest().body("Invalid user data: " + e.getMessage());
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("User already exists: " + e.getMessage());
        } catch (Exception e) {
            System.out.println(e.getMessage()); // prefer this
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody User user) {
        try {
            System.out.println("in login");
            System.out.println("User: " + user.getEmail() + " " + user.getPassword());

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword())
            );
            System.out.println("Auth complete");

            UserDetails userDetails = myUserDetailsService.loadUserByUsername(user.getEmail());
            System.out.println("collected userDetails: " + userDetails + " " + userDetails.getUsername());

            String jwtToken = jwtService.generateToken(userDetails.getUsername());
            System.out.println("token created: " + jwtToken);

            return ResponseEntity.ok("Bearer " + jwtToken);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(401).body("Invalid credentials or other authentication error.");
        }
    }


    @GetMapping("/user")
    public ResponseEntity<?> getUser(HttpServletRequest request) {
        try {
            System.out.println("Accessing /user endpoint");

            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String email = userDetails.getUsername();

            User authenticatedUser = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (authenticatedUser.getRole() == Role.USER || authenticatedUser.getRole() == Role.GUEST || authenticatedUser.getRole() == Role.ADMIN) {
                UserDTO userDTO = new UserDTO(
                        authenticatedUser.getUsername(),
                        authenticatedUser.getEmail(),
                        authenticatedUser.getPassword(),
                        authenticatedUser.getRole()
                );

                System.out.println("User fetched: " + userDTO);
                return ResponseEntity.ok(userDTO);
            } else {
                System.out.println("Access forbidden for role: " + authenticatedUser.getRole());
                return ResponseEntity.status(403).body("Access denied for this role");
            }
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
        }
    }


}
