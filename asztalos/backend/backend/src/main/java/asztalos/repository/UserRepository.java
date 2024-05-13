import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Felhasználók lekérdezése nevük alapján
    List<User> findByName(String name);
    
    // Felhasználók lekérdezése e-mail címük alapján
    User findByEmail(String email);
    
    // Felhasználók lekérdezése egy bizonyos csoportból
    List<User> findByGroupName(String groupName);
    
    // Aktív felhasználók lekérdezése
    List<User> findByActiveTrue();
    
    // Nem aktív felhasználók lekérdezése
    List<User> findByActiveFalse();
    
    // Felhasználók lekérdezése, akik rendelkeznek egy adott jogosultsággal
    List<User> findByPermissions(String permission);
    
    // Felhasználók lekérdezése egy bizonyos csoportból, akiknek a neve tartalmazza a megadott részletet
    List<User> findByGroupNameContaining(String partialGroupName);
}
