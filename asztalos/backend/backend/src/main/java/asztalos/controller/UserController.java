package asztalos.controller;

import java.lang.reflect.Field;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import asztalos.model.User;
import asztalos.service.UserService;

/**
 *
 * @author Ai
 */
@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    
    // this function updates an another user
    // important that the user who calls it, who is in the token must be an admin
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> currentUser = userService.findByUsername(username);

        // Checking if the user is authenticated
        if (!currentUser.isPresent()) {
            return ResponseEntity.status(403).build();
        }

        // Checking if the authenticated user is admin
        if (!currentUser.get().getRole().equals("admin")) {
            // If not admin, check if id is provided
            if (id != null && !currentUser.get().getUserId().equals(id)) {
                return ResponseEntity.status(403).build();
            }
        }

        var userIdToUpdate = id; // Use the provided ID if present

        // If the ID is not provided in the path variable, use the ID of the authenticated user
        if (userIdToUpdate == null) {
            return ResponseEntity.status(403).build();
        }

        Optional<User> user = userService.findById(userIdToUpdate);
        if (user.isPresent()) {
            User updatedUser = user.get();

            try {
                // Get all fields of the User class
                Field[] fields = User.class.getDeclaredFields();

                // Iterate through the fields
                for (Field field : fields) {
                    field.setAccessible(true); // Set field accessible
                    Object value = field.get(userDetails); // Get value of the field from userDetails
                    if (value != null) {
                        if ("password".equals(field.getName())) {
                        value = passwordEncoder.encode((String) value);
                    }
                        field.set(updatedUser, value); // Set the field value in updatedUser
                    }
                }
            } catch (IllegalAccessException e) {
                e.printStackTrace(); // Handle IllegalAccessException
            }

            return ResponseEntity.ok(userService.save(updatedUser));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // this is an another update function, this updates that user who is in the token
    // this could be done by anyone, not only admins
    @PutMapping
    public ResponseEntity<User> updateSelf(@RequestBody User userDetails) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> user = userService.findByUsername(username);

        if (user.isPresent()) {
            User updatedUser = user.get();

            try {
                // Get all fields of the User class
                Field[] fields = User.class.getDeclaredFields();

                // Iterate through the fields
                for (Field field : fields) {
                    field.setAccessible(true); // Set field accessible
                    Object value = field.get(userDetails); // Get value of the field from userDetails
                    if (value != null) {
                        field.set(updatedUser, value); // Set the field value in updatedUser
                    }
                }
            } catch (IllegalAccessException e) {
                e.printStackTrace(); // Handle IllegalAccessException
            }

            return ResponseEntity.ok(userService.save(updatedUser));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // this function deletes an user
    // could be called only by admins
    // the deleting method right now is changing the username and password
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> currentUser = userService.findByUsername(username);

        // Checking if the user is authenticated
        if (!currentUser.isPresent()) {
            return ResponseEntity.status(403).build();
        }
        
        // Checking if the authenticated user is admin
        if (!currentUser.get().getRole().equals("admin")) {
            return ResponseEntity.status(403).build();
        }
        
        Optional<User> userToDelete = userService.findById(id);
        if (!userToDelete.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        // Setting the password to "deletedUser"
        User deletedUser = userToDelete.get();
        deletedUser.setUsername(deletedUser.getUsername() + "-deletedUser");
        deletedUser.setPassword(passwordEncoder.encode("deletedUser"));
        
        // Saving the updated user
        userService.save(deletedUser);   
        return ResponseEntity.noContent().build();
    }

}
