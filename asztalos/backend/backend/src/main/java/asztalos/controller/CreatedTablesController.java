package asztalos.controller;

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

import asztalos.model.CreatedTables;
import asztalos.model.User;
import asztalos.model.Work;
import asztalos.service.CreatedTablesService;
import asztalos.service.UserService;
import asztalos.service.WorkService;

@CrossOrigin
@RestController
@RequestMapping("/createdtables")
public class CreatedTablesController {

    @Autowired
    private CreatedTablesService CreatedtableService;
    @Autowired
    private UserService userService;
    @Autowired
    private WorkService workService;

    @GetMapping
    public List<CreatedTables> findAll() {
        return CreatedtableService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CreatedTables> getCreatedTablesById(@PathVariable Long id) {
        Optional<CreatedTables> table = CreatedtableService.findById(id);
        if (table.isPresent()) {
            return ResponseEntity.ok(table.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public CreatedTables createCreatedTables(@RequestBody CreatedTables table) {
        return CreatedtableService.createCreatedTables(table);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CreatedTables> updateCreatedTables(@PathVariable Long id, @RequestBody CreatedTables tableDetails) {
        try {
            CreatedTables updatedCreatedTables = CreatedtableService.updateCreatedTables(id, tableDetails);
            return ResponseEntity.ok(updatedCreatedTables);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCreatedTables(@PathVariable Long id) {
        CreatedtableService.deleteCreatedTables(id);
        return ResponseEntity.noContent().build();
    }

         @GetMapping("work/{workId}")
    public ResponseEntity<?> getCreatedTablesOfWork(@PathVariable Long workId) {
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

        List<CreatedTables> Createdtables;
        if (currentUser.getRole().equals("admin") || currentUser.getUserId().equals(work.getUser().getUserId())
                ) {
            Createdtables = CreatedtableService.findByWork(work);
        } else {
                 return ResponseEntity.status(403).build();
       
        }

        return ResponseEntity.ok(Createdtables);
    }
}
