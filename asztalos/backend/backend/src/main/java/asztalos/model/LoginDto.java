package asztalos.model;

import jakarta.validation.constraints.NotEmpty;

public class LoginDto {
    
    @NotEmpty
    private String username;

    @NotEmpty
    private String password;

    public String getUsername() {
        return this.username;
    }

    public void setUsername(String Username) {
        this.username = Username;
    }
    
    public String getPassword() {
        return this.password;
    }

    public void setPassword(String password) {
        this.password = password;
    }


}
