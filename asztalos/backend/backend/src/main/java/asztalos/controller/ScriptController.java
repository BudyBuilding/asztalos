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

import asztalos.model.Script;
import asztalos.service.ScriptService;

@RestController
@RequestMapping("/scripts")
public class ScriptController {

    @Autowired
    private ScriptService scriptService;

    @GetMapping
    public List<Script> findAll() {
        return scriptService.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Script> findById(@PathVariable Long id) {
        return scriptService.findById(id);
    }

    // create a Script
    @ResponseStatus(HttpStatus.CREATED) // 201
    @PostMapping
    public Script create(@RequestBody Script Script) {
        return scriptService.save(Script);
    }

    // update a Script
    @PutMapping
    public Script update(@RequestBody Script Script) {
        return scriptService.save(Script);
    }

    // delete a Script
    @ResponseStatus(HttpStatus.NO_CONTENT) // 204
    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable Long id) {
        scriptService.deleteById(id);
    }

}
