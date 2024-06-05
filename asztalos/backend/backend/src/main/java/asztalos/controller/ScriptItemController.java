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

import asztalos.model.ScriptItem;
import asztalos.model.User;
import asztalos.service.ScriptItemService;
import asztalos.service.UserService;

@RestController
@RequestMapping("/script-item")
public class ScriptItemController {

    @Autowired
    private ScriptItemService scriptItemService;

    @Autowired
    private UserService userService;

    @GetMapping("/script/{scriptId}")
    public ResponseEntity<List<ScriptItem>> getScriptItemsByScriptId(@PathVariable Long scriptId) {
        List<ScriptItem> scriptItems = scriptItemService.findByScriptId(scriptId);
        return ResponseEntity.ok(scriptItems);
    }

    @GetMapping("/{itemId}")
    public ResponseEntity<ScriptItem> getScriptItemById(@PathVariable Long itemId) {
        Optional<ScriptItem> scriptItem = scriptItemService.findById(itemId);
        if (scriptItem.isPresent()) {
            return ResponseEntity.ok(scriptItem.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<ScriptItem> createScriptItem(@RequestBody ScriptItem scriptItem) {

        ScriptItem createdScriptItem = scriptItemService.saveScriptItem(scriptItem);
        return ResponseEntity.ok(createdScriptItem);
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteScriptItem(@PathVariable Long itemId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> currentUser = userService.findByUsername(username);

        if (!currentUser.isPresent()) {
            return ResponseEntity.status(403).build();
        }

        Optional<ScriptItem> scriptItemOptional = scriptItemService.findById(itemId);

        if (scriptItemOptional.isPresent()) {
            ScriptItem scriptItem = scriptItemOptional.get();

            if (!currentUser.get().getRole().equals("admin")) {
                return ResponseEntity.status(403).build();
            }

            scriptItemService.deleteScriptItem(itemId);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

  @PutMapping("/{id}")
    public ResponseEntity<ScriptItem> updateClient(@PathVariable Long id, @RequestBody ScriptItem scriptItemDetails) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> currentUser = userService.findByUsername(username);

        // checking if the user from the token is available
        // cannot give problem (but who de hell knows)
        if (!currentUser.isPresent()) {
            return ResponseEntity.status(403).build();
        }
        
        // searching for the original client
        Optional<ScriptItem> scriptItemOptional = scriptItemService.findById(id);

        // checking if there is any client to modify
        if (scriptItemOptional.isPresent()) {
            ScriptItem existingScriptItem = scriptItemOptional.get();

             try {
                // Get all fields of the User class
                Field[] fields = ScriptItem.class.getDeclaredFields();

                // Iterate through the fields
                for (Field field : fields) {
                    field.setAccessible(true); // Set field accessible
                    Object value = field.get(scriptItemDetails); // Get value of the field from userDetails
                    if (value != null) {
                     
                        field.set(existingScriptItem, value); // Set the field value in updatedUser
                    }
                }
            } catch (IllegalAccessException e) {
                e.printStackTrace(); // Handle IllegalAccessException
            }
          
            scriptItemService.saveScriptItem(existingScriptItem);
            return ResponseEntity.ok(existingScriptItem);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}
