package asztalos.controller;

import java.io.IOException;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Script> createScript(
            @RequestPart("metadata") Script script,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) throws IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Optional<User> currentUser = userService.findByUsername(auth.getName());
        if (!currentUser.isPresent()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        script.setUser(currentUser.get());

        // kép feldolgozása
        if (image != null && !image.isEmpty()) {
            script.setImageData(image.getBytes());
            script.setImageContentType(image.getContentType());
        }

        Script created = scriptService.save(script);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/{id}")
    public Script getScriptById(@PathVariable Long id) {
        return scriptService.findById(id);
    }

    @GetMapping
    public List<Script> getAllScripts() {
        return scriptService.getAllScripts();
    }

    @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateScript(
            @PathVariable Long id,
            @RequestPart("script") Script scriptDetails,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) throws IOException {
        // 1) Authentication check
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            Map<String,Object> body = new HashMap<>();
            body.put("status", HttpStatus.UNAUTHORIZED.value());
            body.put("error", "UNAUTHENTICATED");
            body.put("message", "Nem vagy bejelentkezve. Kérlek, lépj be a folytatáshoz.");
            body.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
        }
    
        // 2) User lookup
        String username = auth.getName();
        Optional<User> optUser = userService.findByUsername(username);
        if (!optUser.isPresent()) {
            Map<String,Object> body = new HashMap<>();
            body.put("status", HttpStatus.FORBIDDEN.value());
            body.put("error", "USER_NOT_FOUND");
            body.put("message", "A bejelentkezett felhasználó nem található.");
            body.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
        }
        User me = optUser.get();
    
        // 3) Fetch existing script
        Script existing = scriptService.findById(id);
        if (existing == null) {
            Map<String,Object> body = new HashMap<>();
            body.put("status", HttpStatus.NOT_FOUND.value());
            body.put("error", "SCRIPT_NOT_FOUND");
            body.put("message", "Nincs ilyen azonosítójú script: " + id);
            body.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
        }
    
        // 4) Authorization
        boolean isOwner = existing.getUser().getUserId().equals(me.getUserId());
        boolean isAdmin = "admin".equalsIgnoreCase(me.getRole());
        if (!isOwner && !isAdmin) {
            Map<String,Object> body = new HashMap<>();
            body.put("status", HttpStatus.FORBIDDEN.value());
            body.put("error", "NO_PERMISSION");
            body.put("message", "Nincs jogosultságod ehhez a scripthez. Csak a tulajdonos vagy admin módosíthatja.");
            body.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
        }
    
        // 5) Apply field changes (except imageData/imageContentType)
        List<String> changed = new ArrayList<>();
        try {
            for (Field f : Script.class.getDeclaredFields()) {
                f.setAccessible(true);
                String name = f.getName();
                if ("imageData".equals(name) || "imageContentType".equals(name)) {
                    continue;
                }
                Object newVal = f.get(scriptDetails);
                Object oldVal = f.get(existing);
                if (newVal != null && !newVal.equals(oldVal)) {
                    changed.add(name);
                    f.set(existing, newVal);
                }
            }
        } catch (IllegalAccessException ex) {
            Map<String,Object> body = new HashMap<>();
            body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            body.put("error", "FIELD_COPY_ERROR");
            body.put("message", "Hiba a mezők másolásakor: " + ex.getMessage());
            body.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
        }
    
        // 6) Image handling
        if (image != null && !image.isEmpty()) {
            existing.setImageData(image.getBytes());
            existing.setImageContentType(image.getContentType());
            changed.add("imageData");
            changed.add("imageContentType");
        }
    
        // 7) Nothing changed?
        if (changed.isEmpty()) {
            Map<String,Object> result = new HashMap<>();
            result.put("status", HttpStatus.OK.value());
            result.put("updatedScript", existing);
            result.put("updatedFields", Collections.emptyList());
            result.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.ok(result);
        }
    
        // 8) Save & return
        scriptService.save(existing);
        Map<String,Object> result = new HashMap<>();
        result.put("status", HttpStatus.OK.value());
        result.put("updatedScript", existing);
        result.put("updatedFields", changed);
        result.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(result);
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
