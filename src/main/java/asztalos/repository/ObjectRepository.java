import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ObjectRepository extends JpaRepository<Object, Long> {
    // Objektumok lekérdezése név alapján
    List<Object> findByName(String name);
    
    // Objektumok lekérdezése egy bizonyos felhasználóhoz tartozóan
    List<Object> findByUserId(Long userId);
    
    // Objektumok lekérdezése egy bizonyos munkához tartozóan
    List<Object> findByWorkId(Long workId);
    
    // Aktív objektumok lekérdezése
    List<Object> findByActiveTrue();
    
    // Nem aktív objektumok lekérdezése
    List<Object> findByActiveFalse();
}
