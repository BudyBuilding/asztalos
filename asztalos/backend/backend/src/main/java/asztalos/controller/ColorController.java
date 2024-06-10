package asztalos.controller;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import asztalos.model.Color;
import asztalos.model.User;
import asztalos.service.ColorService;
import asztalos.service.UserService;

@RestController
@RequestMapping("/colors")
public class ColorController {

    @Autowired
    private ColorService colorService;

    @Autowired
    private UserService userService;

    private boolean isAdminOrManager(User user) {
        return user.getRole().equals("admin") || user.getRole().equals("manager");
    }

    @PostMapping
    public ResponseEntity<Color> createColor(@RequestBody Color color) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> currentUser = userService.findByUsername(username);

        if (!currentUser.isPresent() || !isAdminOrManager(currentUser.get())) {
            return ResponseEntity.status(403).build();
        }

        Color createdColor = colorService.saveColor(color);
        return ResponseEntity.ok(createdColor);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Color> getColorById(@PathVariable Long id) {
        Color color = colorService.findById(id);
        if (color != null) {
            return ResponseEntity.ok(color);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Color>> getAllColors() {
        List<Color> colors = colorService.getAllColors();
        return ResponseEntity.ok(colors);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Color> updateColor(@PathVariable Long id, @RequestBody Color colorDetails) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> currentUser = userService.findByUsername(username);

        if (!currentUser.isPresent() || !isAdminOrManager(currentUser.get())) {
            return ResponseEntity.status(403).build();
        }

        Color colorOptional = colorService.findById(id);

        if (colorOptional != null) {
           Color color = colorOptional;

            try {
                // Get all fields of the User class
                Field[] fields = Color.class.getDeclaredFields();

                // Iterate through the fields
                for (Field field : fields) {
                    field.setAccessible(true); // Set field accessible
                    Object value = field.get(colorDetails); // Get value of the field from colorDetails
                    if (value != null) {
                        field.set(color, value); // Set the field value in updatedUser
                    }
                }
            } catch (IllegalAccessException e) {
                    throw new RuntimeException("An error occurred while updating color details", e);
            }

            return ResponseEntity.ok(colorService.saveColor(color));
      
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteColor(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> currentUser = userService.findByUsername(username);

        if (!currentUser.isPresent() || !isAdminOrManager(currentUser.get())) {
            return ResponseEntity.status(403).build();
        }

        colorService.deleteColor(id);
        return ResponseEntity.noContent().build();
    }
}
