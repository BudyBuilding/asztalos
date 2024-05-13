import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scripts")
public class ScriptController {

    private final ScriptService scriptService;

    @Autowired
    public ScriptController(ScriptService scriptService) {
        this.scriptService = scriptService;
    }

    @GetMapping
    public List<Script> getAllScripts() {
        return scriptService.getAllScripts();
    }

    @GetMapping("/{id}")
    public Script getScriptById(@PathVariable Long id) {
        return scriptService.getScriptById(id);
    }

    @PostMapping
    public Script createScript(@RequestBody Script script) {
        return scriptService.createScript(script);
    }

    @PutMapping("/{id}")
    public Script updateScript(@PathVariable Long id, @RequestBody Script scriptDetails) {
        return scriptService.updateScript(id, scriptDetails);
    }

    @DeleteMapping("/{id}")
    public void deleteScript(@PathVariable Long id) {
        scriptService.deleteScript(id);
    }
}
