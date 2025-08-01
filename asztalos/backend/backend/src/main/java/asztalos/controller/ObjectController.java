package asztalos.controller;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import asztalos.model.User;
import asztalos.model.Work;
import asztalos.model.WorkObject;
import asztalos.service.ObjectService;
import asztalos.service.UserService;
import asztalos.service.WorkService;

@CrossOrigin
@RestController
@RequestMapping("/objects")
public class ObjectController {

    @Autowired
    private ObjectService objectService;
    
    @Autowired
    private UserService userService;

    @Autowired
    private WorkService workService;
    
    private static final Logger logger = LoggerFactory.getLogger(ObjectController.class);
    private static final ObjectMapper mapper = new ObjectMapper();


@GetMapping
public ResponseEntity<?> getObjects(@RequestParam(required = false) Long objectId) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    String username = authentication.getName();
    Optional<User> currentUser = userService.findByUsername(username);

    // Checking if the user from the token is available
    if (!currentUser.isPresent()) {
        return ResponseEntity.status(403).build();
    }

    // Checking if the user wants only one or more objects to load
    if (objectId != null) {
        Optional<WorkObject> workObject = objectService.findById(objectId);

        // If only one object is requested, verify ownership or admin status
        if (workObject.isPresent() && (workObject.get().getUser().getUserId().equals(currentUser.get().getUserId()) || currentUser.get().getRole().equals("admin"))) {
            return ResponseEntity.ok(workObject.get());
        } else {
            return ResponseEntity.status(403).build(); // User cannot access this object
        }
    } else {
        // If the user wants to get all objects
        if (currentUser.get().getRole().equals("admin")) {
            // Admin can access all objects
            List<WorkObject> workObjects = objectService.findAll();
            return ResponseEntity.ok(workObjects);
        } else {
            // Non-admin users can only access their own objects
            List<WorkObject> workObjects = objectService.findByUser(currentUser.get());
            return ResponseEntity.ok(workObjects);
        }
    }
}
///////////////////////////////
   
@GetMapping("/work/{workId}")
public ResponseEntity<List<WorkObject>> getObjectsByWorkId(@PathVariable Long workId) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    String username = authentication.getName();
    Optional<User> currentUser = userService.findByUsername(username);
    // Checking if the user from the token is available
    if (!currentUser.isPresent()) {
        return ResponseEntity.status(403).build();
    }
    Long currentUserId = currentUser.get().getUserId();
    logger.info("Current user found with id: {}", currentUserId);

    // Az adott munka azonosító alapján lekérdezzük a munkát
    Work work = workService.findById(workId).orElse(null);

    if (work == null) {
        return ResponseEntity.notFound().build();
    }

    // Lekérdezzük az objektumokat az adott munkához
    List<WorkObject> objects = objectService.findByWork(work);
        try {
            String objectJson = mapper.writeValueAsString(objects);
            logger.info("Object details: {}", objectJson);
        } catch (JsonProcessingException e) {
            logger.error("Error converting object to JSON", e);
        }
    // Szűrjük azokat az objektumokat, amelyek csak a bejelentkezett felhasználóhoz tartoznak
    List<WorkObject> filteredObjects = objects.stream()
            .filter(obj -> obj.getUser() != null && obj.getUser().getUserId().equals(currentUserId))
            .collect(Collectors.toList());
        try {
            String objectJson = mapper.writeValueAsString(filteredObjects);
            logger.info("FilteredObject details: {}", objectJson);
        } catch (JsonProcessingException e) {
            logger.error("Error converting object to JSON", e);
        }
    return ResponseEntity.ok(filteredObjects);
}

    @PostMapping
    public ResponseEntity<?> createObject(@RequestBody WorkObject workObject) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> currentUser = userService.findByUsername(username);

        // checking if the user from the token is available
        if (!currentUser.isPresent()) {
            return ResponseEntity.status(403).build();
        }

        // setting up the new object's user
        workObject.setUser(currentUser.get());

        // creating the new work object and filling up with the data
        WorkObject createdWorkObject = objectService.save(workObject);
        return ResponseEntity.ok(createdWorkObject);
    }
////////////////////////////////////
    @PutMapping("/{id}")
    public ResponseEntity<WorkObject> updateObject(@PathVariable Long id, @RequestBody WorkObject objectDetails) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> currentUser = userService.findByUsername(username);

        if (!currentUser.isPresent()) {
            return ResponseEntity.status(403).build();
        }

        Optional<WorkObject> workObject = objectService.findById(id);
        if (workObject.isPresent()) {
            WorkObject updatedObject = workObject.get();

            if (!updatedObject.getUser().getUserId().equals(currentUser.get().getUserId()) && !currentUser.get().getRole().equals("admin")) {
                return ResponseEntity.status(403).build();
            }

            try {
                // Get all fields of the WorkObject class
                Field[] fields = WorkObject.class.getDeclaredFields();

                // Iterate through the fields
                for (Field field : fields) {
                    field.setAccessible(true); // Set field accessible
                    Object value = field.get(objectDetails); // Get value of the field from objectDetails
                    if (value != null) {
                        field.set(updatedObject, value); // Set the field value in updatedObject
                    }
                }
            } catch (IllegalAccessException e) {
                // Handle IllegalAccessException
                
            }
            WorkObject createdWorkObject = objectService.save(updatedObject);
            return ResponseEntity.ok(createdWorkObject);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

@DeleteMapping("/{id}")
public ResponseEntity<Void> deleteObject(@PathVariable Long id) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    String username = authentication.getName();

    Optional<User> user = userService.findByUsername(username);
    if (!user.isPresent())
        return ResponseEntity.status(403).build();

    Optional<WorkObject> workObject = objectService.findById(id);
    if (workObject.isPresent()) {
        WorkObject obj = workObject.get();

        boolean isOwner = obj.getUser().getUserId().equals(user.get().getUserId());
        boolean isAdmin = "admin".equals(user.get().getRole());

        if (isOwner || isAdmin) {
            objectService.deleteById(obj.getObjectId());  // ← VÉGLEGES törlés
            return ResponseEntity.noContent().build(); // 204 NO_CONTENT
        }
    }

    return ResponseEntity.status(403).build(); // vagy 404 is lehet, ha nincs ilyen object
}


}
