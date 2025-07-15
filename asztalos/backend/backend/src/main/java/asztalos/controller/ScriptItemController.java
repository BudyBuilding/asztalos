// src/main/java/asztalos/controller/ScriptItemController.java
package asztalos.controller;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import asztalos.dto.ScriptItemDto;
import asztalos.model.Script;
import asztalos.model.ScriptItem;
import asztalos.model.User;
import asztalos.service.ScriptItemService;
import asztalos.service.ScriptService;
import asztalos.service.UserService;

@CrossOrigin
@RestController
@RequestMapping("/script-item")
public class ScriptItemController {

    @Autowired
    private ScriptItemService scriptItemService;

    @Autowired
    private UserService userService;

    @Autowired
    private ScriptService scriptService;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * DTO-alapú lista lekérdezés: csak a szükséges mezőket adja vissza.
     */
    @GetMapping("/script/{scriptId}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ScriptItemDto>> getScriptItemsByScriptId(
            @PathVariable Long scriptId) {
       // List<ScriptItemDto> dtos = scriptItemService.findDtosByScriptId(scriptId);
        List<ScriptItemDto> dtos = scriptItemService.findDtosByScriptIdRecursive(scriptId);
        return ResponseEntity.ok(dtos);
    }

    /**
     * (Eredeti, entitás-alapú lekérdezés – ha még használod máshol)
     */
    @GetMapping("/{itemId}")
    public ResponseEntity<ScriptItem> getScriptItemById(@PathVariable Long itemId) {
        Optional<ScriptItem> scriptItem = scriptItemService.findById(itemId);
        return scriptItem
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Controller
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<ScriptItemDto>> getAllScriptItems() {
        List<ScriptItemDto> dtos = scriptItemService.findAllDtos();
        return ResponseEntity.ok(dtos);
    }

/*
    @PostMapping
    public ResponseEntity<ScriptItem> createScriptItem(
            @RequestBody Map<String, Object> body) {
        Authentication auth = SecurityContextHolder
                .getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Object sid = body.containsKey("script_id")
                        ? body.get("script_id")
                        : body.get("scriptId");
        if (sid == null) {
            return ResponseEntity.badRequest().build();
        }
        Long scriptId;
        try {
            scriptId = sid instanceof Number
                       ? ((Number) sid).longValue()
                       : Long.parseLong(sid.toString());
        } catch (NumberFormatException ex) {
            return ResponseEntity.badRequest().build();
        }

        Script parent = scriptService.findById(scriptId);
        if (parent == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        ScriptItem item = new ScriptItem();
        item.setScript(parent);
        item.setMaterial(
            body.getOrDefault("material", "").toString());
        item.setName(
            body.getOrDefault("name", "").toString());

        if (body.containsKey("qty")) {
            item.setQty(body.get("qty").toString());
        }
        if (body.containsKey("size")) {
            item.setSize(body.get("size").toString());
        }
        try {
            if (body.containsKey("position")) {
                Object pos = body.get("position");
                item.setPosition(pos instanceof String
                    ? pos.toString()
                    : objectMapper.writeValueAsString(pos));
            }
            if (body.containsKey("rotation")) {
                Object rot = body.get("rotation");
                item.setRotation(rot instanceof String
                    ? rot.toString()
                    : objectMapper.writeValueAsString(rot));
            }
        } catch (JsonProcessingException e) {
            return ResponseEntity.status(
                    HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

        if (body.containsKey("kant")) {
            item.setKant(body.get("kant").toString());
        }               

        if (body.containsKey("refSettings")) {
            item.setRefSettings(body.get("refSettings").toString());
        }

        if (body.containsKey("rotable")) {
            item.setRotable(
                Boolean.parseBoolean(body.get("rotable").toString()));
        }               
        if (body.containsKey("details")) {
            item.setDetails(body.get("details").toString());
        }                           


        ScriptItem created = scriptItemService.saveScriptItem(item);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(created);
    }
*/
    @PostMapping
    public ResponseEntity<ScriptItem> createScriptItem(
            @RequestBody Map<String, Object> body) {
        // Authentication and script_id validation
        Object sid = body.containsKey("script_id") ? body.get("script_id") : body.get("scriptId");
        Long scriptId = sid instanceof Number ? ((Number) sid).longValue() : Long.parseLong(sid.toString());
        Script parent = scriptService.findById(scriptId);
        if (parent == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    
        ScriptItem item = new ScriptItem();
        item.setScript(parent);
        item.setMaterial(body.getOrDefault("material", "").toString());
        item.setName(body.getOrDefault("name", "").toString());
        if (body.containsKey("qty")) {
            item.setQty(body.get("qty").toString());
        }
        if (body.containsKey("size")) {
            item.setSize(body.get("size").toString());
        }
        if (body.containsKey("position")) {
            Object pos = body.get("position");
            try {
                item.setPosition(pos instanceof String ? pos.toString() : objectMapper.writeValueAsString(pos));
            } catch (JsonProcessingException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }
        if (body.containsKey("rotation")) {
            Object rot = body.get("rotation");
            try {
                item.setRotation(rot instanceof String ? rot.toString() : objectMapper.writeValueAsString(rot));
            } catch (JsonProcessingException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }
        if (body.containsKey("kant")) {
            item.setKant(body.get("kant").toString());
        }
        if (body.containsKey("refSettings")) {
            item.setRefSettings(body.get("refSettings").toString());
        }
        if (body.containsKey("rotable")) {
            item.setRotable(Boolean.parseBoolean(body.get("rotable").toString()));
        }
        if (body.containsKey("details")) {
            item.setDetails(body.get("details").toString());
        }
        if (body.containsKey("refScriptId")) {
            Object raw = body.get("refScriptId");
            if (raw != null) {
                Long refId = raw instanceof Number
                    ? ((Number) raw).longValue()
                    : Long.parseLong(raw.toString());
                Script ref = scriptService.findById(refId);
                if (ref != null) {
                    item.setRefScript(ref);
                }
            }
            // else: nem adtál meg refScriptId-t, szóval egyszerűen kihagyjuk
        }
    
        ScriptItem created = scriptItemService.saveScriptItem(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ScriptItem> updateScriptItem(
            @PathVariable Long id,
            @RequestBody ScriptItem details) {

        Authentication auth = SecurityContextHolder
                .getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Optional<User> currentUser =
                userService.findByUsername(auth.getName());
        if (!currentUser.isPresent()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Optional<ScriptItem> existingOpt =
                scriptItemService.findById(id);
        if (!existingOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        ScriptItem existing = existingOpt.get();

        try {
            for (Field field :
                    ScriptItem.class.getDeclaredFields()) {
                field.setAccessible(true);
                Object value = field.get(details);
                if (value != null &&
                    !"script".equals(field.getName())) {
                    field.set(existing, value);
                }
            }
        } catch (IllegalAccessException e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .build();
        }

        existing.setScript(existing.getScript());
        ScriptItem updated =
                scriptItemService.saveScriptItem(existing);
        return ResponseEntity.ok(updated);
    }

   @DeleteMapping("/{itemId}")
public ResponseEntity<Void> deleteScriptItem(@PathVariable Long itemId) {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !auth.isAuthenticated()) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
    Optional<User> currentUser = userService.findByUsername(auth.getName());
    if (!currentUser.isPresent()) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    Optional<ScriptItem> itemOpt = scriptItemService.findById(itemId);
    if (!itemOpt.isPresent()) {
        return ResponseEntity.notFound().build();
    }
    ScriptItem item = itemOpt.get();

    // a script tulajdonosa vagy admin törölhet:
    User me = currentUser.get();
    boolean isOwner = item.getScript().getUser().getUserId().equals(me.getUserId());
    boolean isAdmin = "admin".equalsIgnoreCase(me.getRole());
    if (!isOwner && !isAdmin) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    scriptItemService.deleteScriptItem(itemId);
    return ResponseEntity.noContent().build();
}

}
