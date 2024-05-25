package asztalos.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import asztalos.model.Script;
import asztalos.repository.ScriptRepository;

@Service
public class ScriptService {

    @Autowired
    private ScriptRepository scriptRepository;

    public Script saveScript(Script script) {
        return scriptRepository.save(script);
    }

    public Script getScriptById(Long id) {
        return scriptRepository.findById(id).orElse(null);
    }

    public List<Script> getAllScripts() {
        return scriptRepository.findAll();
    }

    public void deleteScript(Long id) {
        scriptRepository.deleteById(id);
    }
}
