import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScriptService {

    private final ScriptRepository scriptRepository;

    @Autowired
    public ScriptService(ScriptRepository scriptRepository) {
        this.scriptRepository = scriptRepository;
    }

    // Script létrehozása
    public Script createScript(Script script) {
        // itt hajtsd végre a szükséges ellenőrzéseket vagy üzleti logikát
        return scriptRepository.save(script);
    }

    // Scriptek lekérdezése
    public List<Script> getAllScripts() {
        return scriptRepository.findAll();
    }

    // Script keresése azonosító alapján
    public Script getScriptById(Long id) {
        return scriptRepository.findById(id).orElse(null);
    }

    // Script frissítése
    public Script updateScript(Long id, Script scriptDetails) {
        Script script = scriptRepository.findById(id).orElse(null);
        if (script != null) {
            // itt hajtsd végre a frissítési logikát
            return scriptRepository.save(script);
        }
        return null;
    }

    // Script törlése
    public void deleteScript(Long id) {
        scriptRepository.deleteById(id);
    }
}
