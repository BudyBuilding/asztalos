import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ObjectService {

    private final ObjectRepository objectRepository;

    @Autowired
    public ObjectService(ObjectRepository objectRepository) {
        this.objectRepository = objectRepository;
    }

    // Objektum létrehozása
    public Object createObject(Object object) {
        // itt hajtsd végre a szükséges ellenőrzéseket vagy üzleti logikát
        return objectRepository.save(object);
    }

    // Objektumok lekérdezése
    public List<Object> getAllObjects() {
        return objectRepository.findAll();
    }

    // Objektum keresése azonosító alapján
    public Object getObjectById(Long id) {
        return objectRepository.findById(id).orElse(null);
    }

    // Objektum frissítése
    public Object updateObject(Long id, Object objectDetails) {
        Object object = objectRepository.findById(id).orElse(null);
        if (object != null) {
            // itt hajtsd végre a frissítési logikát
            return objectRepository.save(object);
        }
        return null;
    }

    // Objektum törlése
    public void deleteObject(Long id) {
        objectRepository.deleteById(id);
    }
}
