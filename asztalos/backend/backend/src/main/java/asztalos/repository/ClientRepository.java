import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    // Ügyfelek lekérdezése nevük alapján
    List<Client> findByName(String name);
    
    // Ügyfél lekérdezése e-mail címük alapján
    Client findByEmail(String email);
    
    // Ügyfelek lekérdezése egy bizonyos csoportból
    List<Client> findByGroupName(String groupName);
    
    // Aktív ügyfelek lekérdezése
    List<Client> findByActiveTrue();
    
    // Nem aktív ügyfelek lekérdezése
    List<Client> findByActiveFalse();
    
    // Ügyfelek lekérdezése egy bizonyos csoportból, akiknek a neve tartalmazza a megadott részletet
    List<Client> findByGroupNameContaining(String partialGroupName);
}
