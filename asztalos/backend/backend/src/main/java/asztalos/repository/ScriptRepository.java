import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScriptRepository extends JpaRepository<Script, Long> {
    // Scriptek lekérdezése név alapján
    List<Script> findByName(String name);
    
    // Scriptek lekérdezése egy bizonyos felhasználóhoz tartozóan
    List<Script> findByUserId(Long userId);
    
    // Aktív scriptek lekérdezése
    List<Script> findByActiveTrue();
    
    // Nem aktív scriptek lekérdezése
    List<Script> findByActiveFalse();
}
