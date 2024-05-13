import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkRepository extends JpaRepository<Work, Long> {
    // Munkák lekérdezése a munka neve alapján
    List<Work> findByName(String name);
    
    // Munkák lekérdezése egy bizonyos ügyfélhez tartozóan
    List<Work> findByClientId(Long clientId);
    
    // Munkák lekérdezése egy bizonyos felhasználóhoz tartozóan
    List<Work> findByUserId(Long userId);
    
    // Aktív munkák lekérdezése
    List<Work> findByActiveTrue();
    
    // Nem aktív munkák lekérdezése
    List<Work> findByActiveFalse();
}
