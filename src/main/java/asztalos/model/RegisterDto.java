package asztalos.model;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public class RegisterDto {

    @NotEmpty(message = "Name is required")
    private String name;

    @NotEmpty(message = "Username is required")
    private String userName;

    @NotEmpty(message = "Email is required")
    private String email;

    private String phone;

    private String address;

    private String role;

    public String getRole() {
        return role;
    }                   

    public void setRole(String role) {
        this.role = role;
    }           

    @NotEmpty(message = "Password is required")
    @Size(min = 6, message = "Minimum password length is 6 characters")
    private String password;

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
    
    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }
    
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
    
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
