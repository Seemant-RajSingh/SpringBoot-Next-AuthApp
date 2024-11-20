package com.srs.AuthApp.service;

import com.srs.AuthApp.model.User;
import com.srs.AuthApp.model.Role;
import com.srs.AuthApp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // Method to get paginated users
//    public Page<User> getUsers(Pageable pageable) {
//        return userRepository.findAll(pageable);
//    }

    public Page<User> getUsersByRole(Role role, Pageable pageable) {
        if (role == null) return userRepository.findAll(pageable);
        return userRepository.findByRole(role, pageable);
    }

    public void registerUser(User user) {
        if (user.getUsername() == null || user.getEmail() == null || user.getPassword() == null) {
            throw new IllegalArgumentException("All fields are required!");
        }

        Optional<User> existingUserByEmail = userRepository.findByEmail(user.getEmail());
        if (existingUserByEmail.isPresent()) {
            throw new IllegalArgumentException("Email is already registered!");
        }

        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);

        if (user.getRole() == null) {
            user.setRole(Role.USER);
        }
        userRepository.save(user);
    }
}

