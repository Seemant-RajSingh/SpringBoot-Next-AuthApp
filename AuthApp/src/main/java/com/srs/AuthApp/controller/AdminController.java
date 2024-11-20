package com.srs.AuthApp.controller;

import com.srs.AuthApp.model.Role;
import com.srs.AuthApp.model.User;
import com.srs.AuthApp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AdminController {

    @Autowired
    private UserService userService;

    @GetMapping("/admin/users")
    public ResponseEntity<?> getUsers(
            @RequestParam(defaultValue = "0") int page, // offset
            @RequestParam(defaultValue = "10") int size, // limit
            @RequestParam(required = false) Role role,
            @RequestParam(defaultValue = "username") String sortBy,
            @RequestParam(defaultValue = "ASC") String direction
    ) {
        try {
            System.out.println("in users/admin, role is: " + role);
            Pageable pageable;

            if ("ASC".equalsIgnoreCase(direction)) {
                pageable = PageRequest.of(page, size, Sort.by(sortBy).ascending());
            } else {
                pageable = PageRequest.of(page, size, Sort.by(sortBy).descending());
            }

            Page<User> usersPage;

//            if (role != null) {
                System.out.println("Filtering by role: " + role);
                usersPage = userService.getUsersByRole(role, pageable);
//            } else {
//                usersPage = userService.getUsers(pageable);
//            }

            return ResponseEntity.ok(usersPage);
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid input parameters: " + e.getMessage());
            return ResponseEntity.badRequest().body("Invalid input parameters.");
        } catch (Exception e) {
            System.err.println(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while fetching users.");
        }
    }

}
