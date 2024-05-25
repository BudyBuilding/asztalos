package asztalos.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import asztalos.model.ScriptItem;
import asztalos.repository.ScriptItemRepository;

@Service
public class ScriptItemService {

    @Autowired
    private ScriptItemRepository scriptItemRepository;

    public ScriptItem saveScriptItem(ScriptItem scriptItem) {
        return scriptItemRepository.save(scriptItem);
    }

    public ScriptItem getScriptItemById(Long id) {
        return scriptItemRepository.findById(id).orElse(null);
    }

    public List<ScriptItem> getAllScriptItems() {
        return scriptItemRepository.findAll();
    }

    public void deleteScriptItem(Long id) {
        scriptItemRepository.deleteById(id);
    }
}
