package asztalos.controller;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import asztalos.dto.CreatedItemDto;
import asztalos.model.CreatedItem;
import asztalos.model.CreatedTables;
import asztalos.model.User;
import asztalos.model.Work;
import asztalos.model.WorkObject;
import asztalos.service.CreatedItemService;
import asztalos.service.CreatedTablesService;
import asztalos.service.ObjectService;
import asztalos.service.TableOptimizationService;
import asztalos.service.UserService;
import asztalos.service.WorkService;

@CrossOrigin
@RestController
@RequestMapping("/created-items")
public class CreatedItemController {

    @Autowired
    private CreatedItemService createdItemService;

    @Autowired
    private UserService userService;

    @Autowired
    private ObjectService objectService;

    @Autowired
    private WorkService workService;

    @Autowired
    private TableOptimizationService tableOptimizationService;
    @Autowired
    private CreatedTablesService createdTablesService;
@PostMapping
public ResponseEntity<?> createCreatedItem(@RequestBody CreatedItem createdItem) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    String username = authentication.getName();
    Optional<User> currentUserOptional = userService.findByUsername(username);

    if (currentUserOptional.isEmpty()) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // 403 Forbidden
    }

    User currentUser = currentUserOptional.get();
 
    if ("user".equals(currentUser.getRole())) {
           Long workObjectId = createdItem.getObject().getObjectId();
                WorkObject object = objectService.findById(workObjectId).get();

        if (!object.getUser().getUsername().equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // 403 Forbidden
        }
    }

        CreatedItem savedItem = createdItemService.save(createdItem);
        //  generáljuk és mentsük a kapcsolódó táblákat
        List<CreatedTables> tables = tableOptimizationService.generateTables(savedItem.getObject().getWork());
        tables.forEach(createdTablesService::save);
        return ResponseEntity.ok(toDto(savedItem));
}


@PostMapping("/items")
public ResponseEntity<?> createMultipleCreatedItems(@RequestBody List<CreatedItem> createdItemList) {
    Logger logger = LoggerFactory.getLogger(CreatedItemController.class);
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    String username = authentication.getName();
    User currentUser = userService.findByUsername(username).orElse(null);

    logger.info("Received payload for createMultipleCreatedItems: {}", createdItemList);

    if (currentUser == null) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    if (createdItemList == null || createdItemList.isEmpty()) {
        return ResponseEntity.badRequest().body("Empty item list");
    }

    try {
        Work work = null;

        for (CreatedItem createdItem : createdItemList) {
            Long workObjectId = createdItem.getObject().getObjectId();
            WorkObject object = objectService.findById(workObjectId).orElse(null);

            if (object == null) {
                return ResponseEntity.status(551).body("object is null");
            }

            if (object.getUser() == null) {
                return ResponseEntity.status(552).body("User is null in object: " + object);
            }

            if ("user".equals(currentUser.getRole()) &&
                !object.getUser().getUsername().equals(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            // Set work (once) for use later
            if (work == null) {
                work = createdItem.getWork();
            }

            // Save the item
            createdItemService.save(createdItem);
        }

        // Generate tables only ONCE after saving all items
        if (work != null) {
            List<CreatedTables> tables = tableOptimizationService.generateTables(work);
            tables.forEach(createdTablesService::save);
        }

        return ResponseEntity.ok(createdItemList);

    } catch (Exception e) {
        logger.error("An error occurred while creating items", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}

    @GetMapping("/{id}")
    public ResponseEntity<?> getCreatedItemById(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userService.findByUsername(username).orElse(null);

        if (currentUser == null) {
            return ResponseEntity.status(403).build();
        }

        CreatedItem item = createdItemService.findById(id).get();
        if (item == null) {
            return ResponseEntity.status(404).build();
        }

        if (!currentUser.getRole().equals("admin") && !item.getObject().getUser().getUsername().equals(username)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(toDto(item));
    }

    @GetMapping("object/{objectId}")
    public ResponseEntity<?> getCreatedItemByObject(@PathVariable Long objectId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userService.findByUsername(username).get();
        WorkObject object = objectService.findById(objectId).get();

        if (currentUser == null) {
            return ResponseEntity.status(403).build();
        }

        if (object == null) {
            return ResponseEntity.status(404).build();
        }

        List<CreatedItem> items;
        if (currentUser.getRole().equals("admin") || currentUser.getUserId().equals(object.getUser().getUserId())) {
            items = createdItemService.findByObject(object);
        } else {
            return ResponseEntity.status(403).build();

        }
    List<CreatedItemDto> dtos = items.stream()
      .map(this::toDto)
      .collect(Collectors.toList());
    return ResponseEntity.ok(dtos);
    }

@GetMapping("work/{workId}")
public ResponseEntity<?> getCreatedItemByWork(@PathVariable Long workId) {
    User currentUser = userService.findByUsername(
         SecurityContextHolder.getContext().getAuthentication().getName()
    ).orElse(null);
    if (currentUser == null) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    Work work = workService.findById(workId).orElse(null);
    if (work == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    String role = currentUser.getRole();
    boolean isAdmin    = "admin".equals(role);
    boolean isCompany  = "companyAdmin".equals(role) || "companyUser".equals(role);
    boolean isOwner    = currentUser.getUserId().equals(work.getUser().getUserId());

    // company-szerepkör csak akkor, ha isOrdered == true
    if (isCompany && !Boolean.TRUE.equals(work.getIsOrdered())) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    // végleges jogosultságellenőrzés: admin, owner, vagy company
    if (!(isAdmin || isOwner || isCompany)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    List<CreatedItem> items = createdItemService.findByWork(work);
        List<CreatedItemDto> dtos = createdItemService.findByWork(work).stream()
      .map(this::toDto)
      .collect(Collectors.toList());
    return ResponseEntity.ok(dtos);
}


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCreatedItem(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userService.findByUsername(username).orElse(null);

        if (currentUser == null) {
            return ResponseEntity.status(403).build();
        }

        CreatedItem item = createdItemService.findById(id).get();

        if (item == null) {
            return ResponseEntity.status(404).build();
        }

        if (!currentUser.getRole().equals("admin") && !item.getObject().getUser().getUsername().equals(username)) {
            return ResponseEntity.status(403).build();
        }
        CreatedItem toDelete = createdItemService.findById(id).get();
        Work work = toDelete.getObject().getWork();
        createdItemService.delete(id);
        // törlés után is újrageneráljuk a táblákat
        List<CreatedTables> tables = tableOptimizationService.generateTables(work);
        tables.forEach(createdTablesService::save);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("delete/items")
public ResponseEntity<?> deleteMultipleCreatedItems(@RequestBody List<Long> ids) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    String username = authentication.getName();
    User currentUser = userService.findByUsername(username).orElse(null);

    if (currentUser == null) {
        return ResponseEntity.status(403).build();
    }

    Work work = null;
    for (Long id : ids) {
        CreatedItem item = createdItemService.findById(id).get();
        if (work == null) {
            work = item.getObject().getWork();
        }
        createdItemService.delete(id);
    }
    // egyszer regáljuk újra a táblákat a teljes törlés után
    if (work != null) {
        List<CreatedTables> tables = tableOptimizationService.generateTables(work);
        tables.forEach(createdTablesService::save);
    }
    return ResponseEntity.noContent().build();
}


     @PutMapping("/{id}")
    public ResponseEntity<?> updateCreatedItem(@PathVariable Long id, @RequestBody CreatedItem updatedItem) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userService.findByUsername(username).orElse(null);


        Optional<CreatedItem> existingItemopt = createdItemService.findById(id);
        if (!existingItemopt.isPresent()) {
            return ResponseEntity.status(404).build();
        }

        CreatedItem existingItem = existingItemopt.get();
  /*      try {
            Field[] fields = CreatedItem.class.getDeclaredFields();
            for (Field field : fields) {
                field.setAccessible(true);
                Object value = field.get(updatedItem);
                if (value != null) {
                    field.set(existingItem, value);
                }
            }
        } catch (IllegalAccessException e) {
                    throw new RuntimeException("An error occurred while updating created item", e);
        }*/

        try {
            for (Field field : CreatedItem.class.getDeclaredFields()) {
                String name = field.getName();
           if ("object".equals(name)
            || "work".equals(name)
            || "itemId".equals(name)
            || "table".equals(name)    // ← így nem írjuk felül a táblakapcsolatot
           ) {
                    continue;
                }
                field.setAccessible(true);
                Object value = field.get(updatedItem);
                if (value != null) {
                    field.set(existingItem, value);
                }
            }
        } catch (IllegalAccessException e) {
            throw new RuntimeException("An error occurred while updating created item", e);
        }


        CreatedItem savedItem = createdItemService.save(existingItem);
        // módosítás után is újrageneráljuk a táblákat
        Work work = savedItem.getObject().getWork();
        List<CreatedTables> tables = tableOptimizationService.generateTables(work);
        tables.forEach(createdTablesService::save);
        return ResponseEntity.ok(toDto(savedItem));
    }
private CreatedItemDto toDto(CreatedItem ci) {
  CreatedItemDto d = new CreatedItemDto();
  d.setItemId(ci.getItemId());
  d.setName(ci.getName());
  d.setDetails(ci.getDetails());
  d.setMaterial(ci.getMaterial());
  d.setKant(ci.getKant());
  d.setQty(ci.getQty());
  d.setRotation(ci.getRotation());
  d.setSize(ci.getSize());
  d.setPosition(ci.getPosition());
  d.setRotation(ci.getRotation());
  d.setTablePosition(ci.getTablePosition());
  d.setTableRotation(ci.getTableRotation());

    d.setColor(new CreatedItemDto.ColorOnly(
        ci.getColor() != null ? ci.getColor().getColorId() : null
    ));
    d.setObject(new CreatedItemDto.ObjectOnly(
        ci.getObject() != null ? ci.getObject().getObjectId() : null
    ));
    d.setTable(new CreatedItemDto.TableOnly(
        ci.gettable() != null ? ci.gettable().getId() : null
    ));
    d.setWork(new CreatedItemDto.WorkOnly(
        ci.getWork() != null ? ci.getWork().getWorkId() : null
    ));
  return d;
}


}
