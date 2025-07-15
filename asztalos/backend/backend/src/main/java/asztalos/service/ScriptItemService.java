// src/main/java/asztalos/service/ScriptItemService.java
package asztalos.service;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import asztalos.dto.ScriptItemDto;
import asztalos.model.ScriptItem;
import asztalos.repository.ScriptItemRepository;

@Service
public class ScriptItemService {

    @Autowired
    private ScriptItemRepository scriptItemRepository;

    @PersistenceContext
    private EntityManager em;

    public ScriptItem saveScriptItem(ScriptItem scriptItem) {
        return scriptItemRepository.save(scriptItem);
    }

    public Optional<ScriptItem> findById(Long itemId) {
        return scriptItemRepository.findById(itemId);
    }

    public List<ScriptItem> findAll() {
        return scriptItemRepository.findAll();
    }

    public List<ScriptItem> findByScriptId(Long scriptId) {
        return scriptItemRepository.findByScriptScriptId(scriptId);
    }

    @Transactional(readOnly = true)
    public List<ScriptItemDto> findDtosByScriptId(Long scriptId) {
        return em.createQuery(
                "SELECT new asztalos.dto.ScriptItemDto( " +
                "  si.itemId, si.name, si.material, si.qty, si.size, " +
                "  si.position, si.rotation, si.kant, si.rotable, " +
                "  COALESCE(si.refScript.scriptId, null), si.refSettings, " +                
                "  si.script.scriptId, si.script.name,  si.details " +
                ") " +
                "FROM ScriptItem si " +
                "WHERE si.script.scriptId = :scriptId",
                ScriptItemDto.class
        )
        .setParameter("scriptId", scriptId)
        .getResultList();
    }

    @Transactional(readOnly = true)
    public List<ScriptItemDto> findAllDtos() {
        return em.createQuery(
            "SELECT new asztalos.dto.ScriptItemDto(" +
            " si.itemId, si.name, si.material, si.qty, si.size, " +
            " si.position, si.rotation, si.kant, si.rotable, " +
            " COALESCE(si.refScript.scriptId, null), si.refSettings, " +         
            " si.script.scriptId, si.script.name, si.details ) " +
            "FROM ScriptItem si",
            ScriptItemDto.class
        ).getResultList();
    }

    @Transactional(readOnly = true)
    public List<ScriptItemDto> findDtosByScriptIdRecursive(Long rootScriptId) {
        List<ScriptItemDto> result = new ArrayList<>();
        Deque<Long> queue = new ArrayDeque<>();
        Set<Long> visitedScripts = new HashSet<>();

        queue.add(rootScriptId);
        visitedScripts.add(rootScriptId);

        while (!queue.isEmpty()) {
            Long scriptId = queue.pop();
            List<ScriptItemDto> dtos = findDtosByScriptId(scriptId);

            for (ScriptItemDto dto : dtos) {
                result.add(dto);
                Long ref = dto.getRefScript();
                if (ref != null && visitedScripts.add(ref)) {
                    queue.add(ref);
                }
            }
        }

        return result;
    }

    public void deleteScriptItem(Long itemId) {
        scriptItemRepository.deleteById(itemId);
    }
}
