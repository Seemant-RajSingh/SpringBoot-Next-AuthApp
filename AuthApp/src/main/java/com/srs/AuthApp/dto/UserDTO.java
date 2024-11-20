package com.srs.AuthApp.dto;

import com.srs.AuthApp.model.Role;

public class UserDTO {
    private String username;
    private String email;
    private String password; // Hashed
    private Role role;

    public UserDTO(String username, String email, String password, Role role) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public Role getRole() {
        return role;
    }
}
