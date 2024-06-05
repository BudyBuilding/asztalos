package asztalos.service;

import java.util.List;
import java.util.Optional;

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

    public Optional<ScriptItem> findById(Long itemId) {
        return scriptItemRepository.findById(itemId);
    }

    public List<ScriptItem> findByScriptId(Long scriptId) {
        return scriptItemRepository.findByScriptScriptId(scriptId);
    }

    public void deleteScriptItem(Long itemId) {
        scriptItemRepository.deleteById(itemId);
    }
}
