package asztalos.controller;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
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
import asztalos.model.Work;
import asztalos.model.WorkObject;
import asztalos.service.CreatedItemService;
import asztalos.service.ObjectService;
import asztalos.service.UserService;
import asztalos.service.WorkService;

@CrossOrigin
@RestController
@RequestMapping("/created-items")
public class CreatedItemController {

    @Autowired
    private CreatedItemService createdItemService;

    @Autowired
    private UserService userService;

    @Autowired
    private ObjectService objectService;

    @Autowired
    private WorkService workService;
@PostMapping
public ResponseEntity<?> createCreatedItem(@RequestBody CreatedItem createdItem) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    String username = authentication.getName();
    Optional<User> currentUserOptional = userService.findByUsername(username);

    if (currentUserOptional.isEmpty()) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // 403 Forbidden
    }

    User currentUser = currentUserOptional.get();
 
    if ("user".equals(currentUser.getRole())) {
           Long workObjectId = createdItem.getObject().getObjectId();
                WorkObject object = objectService.findById(workObjectId).get();

        if (!object.getUser().getUsername().equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // 403 Forbidden
        }
    }

    CreatedItem savedItem = createdItemService.save(createdItem);
    return ResponseEntity.ok(savedItem);
}


@PostMapping("/items")
public ResponseEntity<?> createMultipleCreatedItems(@RequestBody List<CreatedItem> createdItemList) {
    Logger logger = LoggerFactory.getLogger(CreatedItemController.class);
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    String username = authentication.getName();
    User currentUser = userService.findByUsername(username).orElse(null);
            
    if (currentUser == null) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    try {
        // Loop through the list of created items and check permissions if necessary
            for (CreatedItem createdItem : createdItemList) {
                Long workObjectId = createdItem.getObject().getObjectId();
                WorkObject object = objectService.findById(workObjectId).get();

                // Check if object is null
                if (object == null) {
                    return ResponseEntity.status(551).body("object is null");
                }

                // Check if object's User is null
                if (object.getUser() == null) {
                    return ResponseEntity.status(552).body("User is null " + object);
                }
                    if (currentUser.getRole().equals("user")) {
                        // Check if the current user has permission to create the item
                        if (!object.getUser().getUsername().equals(username)) {
                            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                        }
                    }
                    // Save each created item
                    createdItemService.save(createdItem);
                    // Optionally, you can modify or log the savedItem here
                }
        // Return 200 OK with the saved items
        return ResponseEntity.ok(createdItemList);
    } catch (Exception e) {
        logger.error("An error occurred while creating items", e);
        // Handle any exceptions (e.g., database errors)
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
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
        if (currentUser.getRole().equals("admin") || currentUser.getUserId().equals(object.getUser().getUserId())) {
            items = createdItemService.findByObject(object);
        } else {
            return ResponseEntity.status(403).build();

        }

        return ResponseEntity.ok(items);
    }

    @GetMapping("work/{workId}")
    public ResponseEntity<?> getCreatedItemByWork(@PathVariable Long workId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userService.findByUsername(username).get();
        Work work = workService.findById(workId).get();

        if (currentUser == null) {
            return ResponseEntity.status(403).build();
        }

        if (work == null) {
            return ResponseEntity.status(404).build();
        }

        List<CreatedItem> items;
        if (currentUser.getRole().equals("admin") || currentUser.getUserId().equals(work.getUser().getUserId())
                ) {
            items = createdItemService.findByWork(work);
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

    @DeleteMapping("delete/items")
public ResponseEntity<?> deleteMultipleCreatedItems(@RequestBody List<Long> ids) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    String username = authentication.getName();
    User currentUser = userService.findByUsername(username).orElse(null);

    if (currentUser == null) {
        return ResponseEntity.status(403).build();
    }

    for (Long id : ids) {
        CreatedItem item = createdItemService.findById(id).orElse(null);

        if (item == null) {
            return ResponseEntity.status(404).build();
        }

        if (!currentUser.getRole().equals("admin") && !item.getObject().getUser().getUsername().equals(username)) {
            return ResponseEntity.status(403).build();
        }

        createdItemService.delete(id);
    }

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
