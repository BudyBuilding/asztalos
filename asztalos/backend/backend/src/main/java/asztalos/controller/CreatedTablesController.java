package asztalos.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.crossstore.ChangeSetPersister.NotFoundException;
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

import asztalos.dto.CreatedTablesDto;
import asztalos.model.CreatedTables;
import asztalos.model.User;
import asztalos.model.Work;
import asztalos.service.CreatedItemService;
import asztalos.service.CreatedTablesService;
import asztalos.service.UserService;
import asztalos.service.WorkService;
import asztalos.service.TableOptimizationService;
@CrossOrigin
@RestController
@RequestMapping("/createdTables")
public class CreatedTablesController {

    @Autowired
    private CreatedTablesService CreatedtableService;
    @Autowired
    private UserService userService;
    @Autowired
    private WorkService workService;

    @Autowired
    private TableOptimizationService tableOptimizationService;
    
    @Autowired
    private CreatedItemService createdItemService;

    private boolean hasItems(CreatedTables table) {
        // ha van legalább egy CreatedItem ehhez a táblához
        return !createdItemService.findByTable(table).isEmpty();
    }

    @GetMapping
    public List<CreatedTablesDto> findAll() {
        return CreatedtableService.findAll().stream()
                                .filter(this::hasItems)
                                .map(this::toDto)
                                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CreatedTablesDto> getCreatedTablesById(@PathVariable Long id) {
        Optional<CreatedTables> tableOpt = CreatedtableService.findById(id);
        if (tableOpt.isPresent() && hasItems(tableOpt.get())) {
            return ResponseEntity.ok(toDto(tableOpt.get()));
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
    @PostMapping("/generate-tables/{workId}")
    public ResponseEntity<?> generateTablesForWork(@PathVariable Long workId) {
        // 1. Autentikáció
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userService.findByUsername(username).orElse(null);
        

        // 2. Jogosultság ellenőrzése
        if (currentUser == null) {
            return ResponseEntity.status(403).build();
        }

        Work work = workService.findById(workId).orElse(null);
        if (work == null) {
            return ResponseEntity.status(404).build();
        }

        if (!currentUser.getRole().equals("admin") &&
            !currentUser.getUserId().equals(work.getUser().getUserId())) {
            return ResponseEntity.status(403).build();
        }

        // 3. Táblák generálása
        List<CreatedTables> generatedTables = tableOptimizationService.generateTables(work);

        // 4. Mentés
        generatedTables.forEach(CreatedtableService::save);
        List<CreatedTablesDto> allTables = CreatedtableService.findByWork(work).stream()
                                .filter(this::hasItems)
                                .map(this::toDto)
                                .collect(Collectors.toList());
        // 5. Válasz
        return ResponseEntity.ok(allTables);
    } 

    @GetMapping("/work/{workId}")
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

        List<CreatedTablesDto> Createdtables;
        if (currentUser.getRole().equals("admin") || 
            currentUser.getRole().equals("companyAdmin") ||
            currentUser.getRole().equals("companyUser") ||
            currentUser.getUserId().equals(work.getUser().getUserId())
                ) {
            Createdtables = CreatedtableService.findByWork(work).stream()
                                .filter(this::hasItems)
                                .map(this::toDto)
                                .collect(Collectors.toList());
        } else {
                 return ResponseEntity.status(403).build();
       
        }

        return ResponseEntity.ok(Createdtables);
    }

    private CreatedTablesDto toDto(CreatedTables ct) {
    CreatedTablesDto d = new CreatedTablesDto();
    d.setTableId(ct.getId());
    d.setPrice(ct.getPrice());
    d.setSize(ct.getSize());
    d.setLastUpdateDate(ct.getLastUpdateDate());
    d.setWork(new CreatedTablesDto.WorkOnly(ct.getWork().getWorkId()));
    d.setColor(new CreatedTablesDto.ColorOnly(ct.getColor().getColorId()));
    return d;
}

}

