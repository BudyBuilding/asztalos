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

import asztalos.model.CreatedItem;
import asztalos.model.User;
import asztalos.model.WorkObject;
import asztalos.service.CreatedItemService;
import asztalos.service.ObjectService;
import asztalos.service.UserService;

@RestController
@RequestMapping("/created-items")
public class CreatedItemController {

    @Autowired
    private CreatedItemService createdItemService;

    @Autowired
    private UserService userService;
    @Autowired
    private ObjectService objectService;

    @PostMapping
    public ResponseEntity<?> createCreatedItem(@RequestBody CreatedItem createdItem) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userService.findByUsername(username).orElse(null);

        if (currentUser == null) {
            return ResponseEntity.status(403).build();
        }

        if (currentUser.getRole().equals("user")) {
            if (!createdItem.getObject().getUser().getUsername().equals(username)) {
                return ResponseEntity.status(403).build();
            }
        }

        CreatedItem savedItem = createdItemService.save(createdItem);
        return ResponseEntity.ok(savedItem);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCreatedItemById(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userService.findByUsername(username).orElse(null);

        if (currentUser == null) {
            return ResponseEntity.status(403).build();
        }

        CreatedItem item = createdItemService.findById(id).get();
        if (item == null) {
            return ResponseEntity.status(404).build();
        }

        if (!currentUser.getRole().equals("admin") && !item.getObject().getUser().getUsername().equals(username)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(item);
    }

    @GetMapping("object/{objectId}")
    public ResponseEntity<?> getCreatedItemByObject(@PathVariable Long objectId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userService.findByUsername(username).get();
        WorkObject object = objectService.findById(objectId).get();

        if (currentUser == null) {
            return ResponseEntity.status(403).build();
        }

        if (object == null) {
            return ResponseEntity.status(404).build();
        }

        List<CreatedItem> items;
        if (currentUser.getRole().equals("admin") || currentUser.getUserId().equals(object.getUser().getUserId())
                ) {
            items = createdItemService.findByObject(object);
        } else {
                 return ResponseEntity.status(403).build();
       
        }

        return ResponseEntity.ok(items);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCreatedItem(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userService.findByUsername(username).orElse(null);

        if (currentUser == null) {
            return ResponseEntity.status(403).build();
        }

        CreatedItem item = createdItemService.findById(id).get();

        if (item == null) {
            return ResponseEntity.status(404).build();
        }

        if (!currentUser.getRole().equals("admin") && !item.getObject().getUser().getUsername().equals(username)) {
            return ResponseEntity.status(403).build();
        }

        createdItemService.delete(id);
        return ResponseEntity.noContent().build();
    }

     @PutMapping("/{id}")
    public ResponseEntity<?> updateCreatedItem(@PathVariable Long id, @RequestBody CreatedItem updatedItem) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userService.findByUsername(username).orElse(null);

        if (currentUser == null || !currentUser.getRole().equals("admin")) {
            return ResponseEntity.status(403).build();
        }

        Optional<CreatedItem> existingItemopt = createdItemService.findById(id);
        if (!existingItemopt.isPresent()) {
            return ResponseEntity.status(404).build();
        }

        CreatedItem existingItem = existingItemopt.get();
        try {
            Field[] fields = CreatedItem.class.getDeclaredFields();
            for (Field field : fields) {
                field.setAccessible(true);
                Object value = field.get(updatedItem);
                if (value != null) {
                    field.set(existingItem, value);
                }
            }
        } catch (IllegalAccessException e) {
                    throw new RuntimeException("An error occurred while updating created item", e);
        }

        CreatedItem savedItem = createdItemService.save(existingItem);
        return ResponseEntity.ok(savedItem);
    }

}
