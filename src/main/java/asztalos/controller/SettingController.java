package asztalos.controller;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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

import asztalos.model.Setting;
import asztalos.model.User;
import asztalos.service.SettingService;
import asztalos.service.UserService;

@CrossOrigin
@RestController
@RequestMapping("/settings")
public class SettingController {

    @Autowired
    private SettingService settingService;
    
    @Autowired
    private UserService userService;

    // Get a setting by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getSettingById(@PathVariable Long id) {
        Optional<Setting> setting = settingService.findById(id);
        if (setting.isPresent()) {
            return ResponseEntity.ok(setting.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Get settings by a list of IDs
    @PostMapping("/ids")
    public ResponseEntity<?> getSettingsByIds(@RequestBody List<Long> ids) {
        List<Setting> settings = ids.stream()
                                    .map(id -> settingService.findById(id))
                                    .filter(Optional::isPresent)
                                    .map(Optional::get)
                                    .collect(Collectors.toList());
        return ResponseEntity.ok(settings);
    }

    // Get all settings
    @GetMapping
    public ResponseEntity<?> getAllSettings() {
        List<Setting> settings = settingService.findAll();
        return ResponseEntity.ok(settings);
    }


    // Create a new setting (Admin only)
    @PostMapping
    public ResponseEntity<?> createSetting(@RequestBody Setting setting) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> currentUser = userService.findByUsername(username);

        if (!currentUser.isPresent() || !currentUser.get().getRole().equals("admin")) {
            return ResponseEntity.status(403).build();
        }

        Setting createdSetting = settingService.save(setting);
        return ResponseEntity.ok(createdSetting);
    }

     // Update an existing setting (Admin only)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSetting(@PathVariable Long id, @RequestBody Setting settingDetails) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> currentUser = userService.findByUsername(username);

        if (!currentUser.isPresent() || !currentUser.get().getRole().equals("admin")) {
            return ResponseEntity.status(403).build();
        }

        Optional<Setting> settingOptional = settingService.findById(id);

        if (settingOptional.isPresent()) {
            Setting existingSetting = settingOptional.get();
            existingSetting.setName(settingDetails.getName());
            Setting updatedSetting = settingService.save(existingSetting);
            return ResponseEntity.ok(updatedSetting);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
 // Delete a setting (Admin only)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSetting(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> currentUser = userService.findByUsername(username);

        if (!currentUser.isPresent() || !currentUser.get().getRole().equals("admin")) {
            return ResponseEntity.status(403).build();
        }

        Optional<Setting> settingOptional = settingService.findById(id);

        if (settingOptional.isPresent()) {
            Setting setting = settingOptional.get();
            settingService.save(setting);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}

