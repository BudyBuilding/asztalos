package asztalos.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import asztalos.model.Script;
import asztalos.service.ScriptService;

@RestController
@RequestMapping("/scripts")
public class ScriptController {

    @Autowired
    private ScriptService scriptService;

    @PostMapping
    public Script createScript(@RequestBody Script script) {
        return scriptService.saveScript(script);
    }

    @GetMapping("/{id}")
    public Script getScriptById(@PathVariable Long id) {
        return scriptService.getScriptById(id);
    }

    @GetMapping
    public List<Script> getAllScripts() {
        return scriptService.getAllScripts();
    }

    @DeleteMapping("/{id}")
    public void deleteScript(@PathVariable Long id) {
        scriptService.deleteScript(id);
    }
}
