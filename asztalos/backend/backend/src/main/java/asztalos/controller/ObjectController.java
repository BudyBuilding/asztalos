package asztalos.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import asztalos.model.Object;
import asztalos.service.ObjectService;

@RestController
@RequestMapping("/objects")
public class ObjectController {

    @Autowired
    private ObjectService objectService;

    @GetMapping
    public List<Object> findAll() {
        return objectService.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Object> findById(@PathVariable Long id) {
        return objectService.findById(id);
    }

    // create a Object
    @ResponseStatus(HttpStatus.CREATED) // 201
    @PostMapping
    public Object create(@RequestBody Object Object) {
        return objectService.save(Object);
    }

    // update a Object
    @PutMapping
    public Object update(@RequestBody Object Object) {
        return objectService.save(Object);
    }

    // delete a Object
    @ResponseStatus(HttpStatus.NO_CONTENT) // 204
    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable Long id) {
        objectService.deleteById(id);
    }

}
