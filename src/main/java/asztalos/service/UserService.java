import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Felhasználó létrehozása
    public User createUser(User user) {
        // itt hajtsd végre a szükséges ellenőrzéseket vagy üzleti logikát
        return userRepository.save(user);
    }

    // Felhasználók lekérdezése
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Felhasználó keresése azonosító alapján
    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    // Felhasználó frissítése
    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id).orElse(null);
        if (user != null) {
            // itt hajtsd végre a frissítési logikát
            return userRepository.save(user);
        }
        return null;
    }

    // Felhasználó törlése
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
