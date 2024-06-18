package asztalos.controller;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;

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

    @GetMapping
    public ResponseEntity<?> getObjects(@RequestParam(required = false) Long objectId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> currentUser = userService.findByUsername(username);
        
        // checking if the user from the token is available
        if (!currentUser.isPresent()) {
            return ResponseEntity.status(403).build();
        }

        // checking if the user wants only one or more objects to load
        if (objectId != null) {
            Optional<WorkObject> workObject = objectService.findById(objectId);

            // if only one, so the user gave an objectId we must check if the user is the same with the user in the token
            // so no one could check the others objects
            if (workObject.isPresent() && (workObject.get().getUser().getUserId().equals(currentUser.get().getUserId()) || currentUser.get().getRole().equals("admin"))) {
                return ResponseEntity.ok(workObject.get());
            } else {
                // if there is no work object or the user cannot check that object 
                return ResponseEntity.status(403).build();
            }
        } else {
            // if the user want to get all the objects
            // we must check if the user is admin or not
            if (currentUser.get().getRole().equals("admin")) {
                //if is admin then we must give them all the objects
                List<WorkObject> workObjects = objectService.findAll();
                return ResponseEntity.ok(workObjects);
            } else {
                // if is not admin then we must show them only their objects
                List<WorkObject> workObjects = objectService.findByUser(currentUser.get());
                return ResponseEntity.ok(workObjects);
            }
        }
    }
    ///////////////////////////////
   
        @GetMapping("/work/{workId}")
        public ResponseEntity<List<WorkObject>> getScriptItemsByScriptId(@PathVariable Long workId) {
        Work work = workService.findById(workId).get();
        List<WorkObject> objects = objectService.findByWork(work);
        return ResponseEntity.ok(objects);
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

            return ResponseEntity.ok(objectService.save(updatedObject));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
public ResponseEntity<Void> deleteObject(@PathVariable Long id) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    String username = authentication.getName();
    Optional<User> user = userService.findByUsername(username);

    // Check if the user from the token is available
    if (!user.isPresent()) {
        return ResponseEntity.status(403).build();
    }

    Optional<WorkObject> workObject = objectService.findById(id);

    // Check if there is a work object record with that id
    if (workObject.isPresent() && (workObject.get().getUser().getUserId().equals(user.get().getUserId()) || user.get().getRole().equals("admin"))) {
        // If there is a work object, we must change its user attribute to the -1 user
        Optional<User> deletedUser = userService.findById(-1L);
        
        if (!deletedUser.isPresent()) {
            return ResponseEntity.status(500).build(); // Internal server error if -1 user is not found
        }

        workObject.get().setUser(deletedUser.get());

        // Save the updates
        objectService.save(workObject.get());
        return ResponseEntity.noContent().build();
    } else {
        return ResponseEntity.status(403).build();
    }
}

}
