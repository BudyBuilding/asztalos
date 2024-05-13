import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/objects")
public class ObjectController {

    private final ObjectService objectService;

    @Autowired
    public ObjectController(ObjectService objectService) {
        this.objectService = objectService;
    }

    @GetMapping
    public List<Object> getAllObjects() {
        return objectService.getAllObjects();
    }

    @GetMapping("/{id}")
    public Object getObjectById(@PathVariable Long id) {
        return objectService.getObjectById(id);
    }

    @PostMapping
    public Object createObject(@RequestBody Object object) {
        return objectService.createObject(object);
    }

    @PutMapping("/{id}")
    public Object updateObject(@PathVariable Long id, @RequestBody Object objectDetails) {
        return objectService.updateObject(id, objectDetails);
    }

    @DeleteMapping("/{id}")
    public void deleteObject(@PathVariable Long id) {
        objectService.deleteObject(id);
    }
}
