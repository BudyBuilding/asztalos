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

import asztalos.model.Tables;
import asztalos.model.User;
import asztalos.model.Work;
import asztalos.service.TablesService;
import asztalos.service.UserService;
import asztalos.service.WorkService;

@CrossOrigin
@RestController
@RequestMapping("/tables")
public class TablesController {

    @Autowired
    private TablesService tableService;
    @Autowired
    private UserService userService;
    @Autowired
    private WorkService workService;

    @GetMapping
    public List<Tables> findAll() {
        return tableService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tables> getTablesById(@PathVariable Long id) {
        Optional<Tables> table = tableService.findById(id);
        if (table.isPresent()) {
            return ResponseEntity.ok(table.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public Tables createTables(@RequestBody Tables table) {
        return tableService.createTables(table);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tables> updateTables(@PathVariable Long id, @RequestBody Tables tableDetails) {
        try {
            Tables updatedTables = tableService.updateTables(id, tableDetails);
            return ResponseEntity.ok(updatedTables);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTables(@PathVariable Long id) {
        tableService.deleteTables(id);
        return ResponseEntity.noContent().build();
    }

         @GetMapping("work/{workId}")
    public ResponseEntity<?> getTablesOfWork(@PathVariable Long workId) {
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

        List<Tables> tables;
        if (currentUser.getRole().equals("admin") ||
            currentUser.getRole().equals("companyAdmin") ||
            currentUser.getRole().equals("companyUser") ||
            currentUser.getUserId().equals(work.getUser().getUserId())
                ) {
            tables = tableService.findByWork(work);
        } else {
                 return ResponseEntity.status(403).build();
       
        }

        return ResponseEntity.ok(tables);
    }
}
