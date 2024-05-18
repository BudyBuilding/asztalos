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

import asztalos.model.Work;
import asztalos.service.WorkService;

@RestController
@RequestMapping("/works")
public class WorkController {

    @Autowired
    private WorkService workService;

    @GetMapping
    public List<Work> findAll() {
        return WorkService.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Work> findById(@PathVariable Long id) {
        return WorkService.findById(id);
    }

    // create a Work
    @ResponseStatus(HttpStatus.CREATED) // 201
    @PostMapping
    public Work create(@RequestBody Work Work) {
        return WorkService.save(Work);
    }

    // update a Work
    @PutMapping
    public Work update(@RequestBody Work Work) {
        return WorkService.save(Work);
    }

    // delete a Work
    @ResponseStatus(HttpStatus.NO_CONTENT) // 204
    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable Long id) {
        WorkService.deleteById(id);
    }

}
