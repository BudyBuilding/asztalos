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
import org.springframework.web.bind.annotation.RestController;

import asztalos.model.Script;
import asztalos.model.User;
import asztalos.service.ScriptService;
import asztalos.service.UserService;


@CrossOrigin
@RestController
@RequestMapping("/scripts")
public class ScriptController {

     @Autowired
    private ScriptService scriptService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<Script> createScript(@RequestBody Script script) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> currentUser = userService.findByUsername(username);

        if (!currentUser.isPresent()) {
            return ResponseEntity.status(403).build();
        }

        script.setUser(currentUser.get());

        Script createdScript = scriptService.save(script);
        return ResponseEntity.ok(createdScript);
    }

    @GetMapping("/{id}")
    public Script getScriptById(@PathVariable Long id) {
        return scriptService.findById(id);
    }

    @GetMapping
    public List<Script> getAllScripts() {
        return scriptService.getAllScripts();
    }

    // Update a script
    @PutMapping("/{id}")
    public ResponseEntity<Script> updateScript(@PathVariable Long id, @RequestBody Script scriptDetails) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> currentUser = userService.findByUsername(username);

        if (!currentUser.isPresent()) {
            return ResponseEntity.status(403).build();
        }

        Script script = scriptService.findById(id);

        if (script!= null) {
            Script existingScript = script;

            // Only allow the script owner or admin to update the script
            if (!existingScript.getUser().getUserId().equals(currentUser.get().getUserId()) && !currentUser.get().getRole().equals("admin")) {
                return ResponseEntity.status(403).build();
            }

          try {
                // Get all fields of the script class
                Field[] fields = Script.class.getDeclaredFields();

                // Iterate through the fields
                for (Field field : fields) {
                    field.setAccessible(true); // Set field accessible
                    Object value = field.get(scriptDetails); // Get value of the field from objectDetails
                    if (value != null) {
                        field.set(existingScript, value); // Set the field value in updatedObject
                    }
                }
            } catch (IllegalAccessException e) {
                // Handle IllegalAccessException
                
            }
            scriptService.save(existingScript);
   return ResponseEntity.ok(existingScript);
        } else {
            return ResponseEntity.notFound().build();
        }
    }


@DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteScript(@PathVariable("id") Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> user = userService.findByUsername(username);

        // searching if there is an user with that username from the token
        if (!user.isPresent()) {
            return ResponseEntity.status(403).build();
        }

        Script script = scriptService.findById(id);

        // checking if there is a script record with that scriptID
             if (script != null && (script.getUser().getUserId().equals(user.get().getUserId()) || user.get().getRole().equals("admin"))) {

            //if there is a script then we must change his user attribute to the -1 user
            //we load that user and update with his data
            script.setUser(userService.findById(-1L).get());

            //saving the updates
            scriptService.save(script);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.status(403).build();
        }
    }
}
