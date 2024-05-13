import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ColorRepository extends JpaRepository<Color, Long> {
    // Színek lekérdezése név alapján
    List<Color> findByName(String name);
    
    // Aktív színek lekérdezése
    List<Color> findByActiveTrue();
    
    // Nem aktív színek lekérdezése
    List<Color> findByActiveFalse();
}
