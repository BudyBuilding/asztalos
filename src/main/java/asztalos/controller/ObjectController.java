package asztalos.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import asztalos.model.WorkObject;
import asztalos.service.ObjectService;

@RestController
@RequestMapping("/objects")
public class ObjectController {

    @Autowired
    private ObjectService objectService;

    @GetMapping
    public List<WorkObject> getAllObjects() {
        return objectService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkObject> getObjectById(@PathVariable Long id) {
        Optional<WorkObject> WorkObject = objectService.findById(id);
        if (WorkObject.isPresent()) {
            return ResponseEntity.ok(WorkObject.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public WorkObject createObject(@RequestBody WorkObject WorkObject) {
        return objectService.save(WorkObject);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkObject> updateObject(@PathVariable Long id, @RequestBody WorkObject objectDetails) {
        Optional<WorkObject> WorkObject = objectService.findById(id);
        if (WorkObject.isPresent()) {
            WorkObject updatedObject = WorkObject.get();
            updatedObject.setWork(objectDetails.getWork());
            updatedObject.setUser(objectDetails.getUser());
            updatedObject.setClient(objectDetails.getClient());
            updatedObject.setName(objectDetails.getName());
          //  updatedObject.setUsedScript(objectDetails.getUsedScript());
            updatedObject.setUsedColors(objectDetails.getUsedColors());
            return ResponseEntity.ok(objectService.save(updatedObject));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteObject(@PathVariable Long id) {
        objectService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
