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

import asztalos.model.ScriptItem;
import asztalos.service.ScriptItemService;

@RestController
@RequestMapping("/script-item")
public class ScriptItemController {

    @Autowired
    private ScriptItemService scriptItemService;

    @PostMapping
    public ScriptItem createScriptItem(@RequestBody ScriptItem scriptItem) {
        return scriptItemService.saveScriptItem(scriptItem);
    }

    @GetMapping("/{id}")
    public ScriptItem getScriptItemById(@PathVariable Long id) {
        return scriptItemService.getScriptItemById(id);
    }

    @GetMapping
    public List<ScriptItem> getAllScriptItems() {
        return scriptItemService.getAllScriptItems();
    }

    @DeleteMapping("/{id}")
    public void deleteScriptItem(@PathVariable Long id) {
        scriptItemService.deleteScriptItem(id);
    }
}
