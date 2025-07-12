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
import asztalos.model.CreatedTables;
import asztalos.model.User;
import asztalos.model.Work;
import asztalos.model.WorkObject;
import asztalos.service.CreatedItemService;
import asztalos.service.CreatedTablesService;
import asztalos.service.ObjectService;
import asztalos.service.TableOptimizationService;
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

    @Autowired
    private TableOptimizationService tableOptimizationService;
    @Autowired
    private CreatedTablesService createdTablesService;
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
        //  generáljuk és mentsük a kapcsolódó táblákat
        List<CreatedTables> tables = tableOptimizationService.generateTables(savedItem.getObject().getWork());
        tables.forEach(createdTablesService::save);
        return ResponseEntity.ok(savedItem);
}


@PostMapping("/items")
public ResponseEntity<?> createMultipleCreatedItems(@RequestBody List<CreatedItem> createdItemList) {
    Logger logger = LoggerFactory.getLogger(CreatedItemController.class);
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    String username = authentication.getName();
    User currentUser = userService.findByUsername(username).orElse(null);
    System.out.println("createdItemList: " + createdItemList);                      
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
                    CreatedItem saved = createdItemService.save(createdItem);
                    List<CreatedTables> tables = tableOptimizationService.generateTables(saved.getObject().getWork());
                    tables.forEach(createdTablesService::save);
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
    User currentUser = userService.findByUsername(
         SecurityContextHolder.getContext().getAuthentication().getName()
    ).orElse(null);
    if (currentUser == null) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    Work work = workService.findById(workId).orElse(null);
    if (work == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    String role = currentUser.getRole();
    boolean isAdmin    = "admin".equals(role);
    boolean isCompany  = "companyAdmin".equals(role) || "companyUser".equals(role);
    boolean isOwner    = currentUser.getUserId().equals(work.getUser().getUserId());

    // company-szerepkör csak akkor, ha isOrdered == true
    if (isCompany && !Boolean.TRUE.equals(work.getIsOrdered())) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    // végleges jogosultságellenőrzés: admin, owner, vagy company
    if (!(isAdmin || isOwner || isCompany)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    List<CreatedItem> items = createdItemService.findByWork(work);
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
        CreatedItem toDelete = createdItemService.findById(id).get();
        Work work = toDelete.getObject().getWork();
        createdItemService.delete(id);
        // törlés után is újrageneráljuk a táblákat
        List<CreatedTables> tables = tableOptimizationService.generateTables(work);
        tables.forEach(createdTablesService::save);
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

    Work work = null;
    for (Long id : ids) {
        CreatedItem item = createdItemService.findById(id).get();
        if (work == null) {
            work = item.getObject().getWork();
        }
        createdItemService.delete(id);
    }
    // egyszer regáljuk újra a táblákat a teljes törlés után
    if (work != null) {
        List<CreatedTables> tables = tableOptimizationService.generateTables(work);
        tables.forEach(createdTablesService::save);
    }
    return ResponseEntity.noContent().build();
}


     @PutMapping("/{id}")
    public ResponseEntity<?> updateCreatedItem(@PathVariable Long id, @RequestBody CreatedItem updatedItem) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userService.findByUsername(username).orElse(null);


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
        // módosítás után is újrageneráljuk a táblákat
        Work work = savedItem.getObject().getWork();
        List<CreatedTables> tables = tableOptimizationService.generateTables(work);
        tables.forEach(createdTablesService::save);
        return ResponseEntity.ok(savedItem);
    }

}
