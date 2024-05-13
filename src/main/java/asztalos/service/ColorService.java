import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ColorService {

    private final ColorRepository colorRepository;

    @Autowired
    public ColorService(ColorRepository colorRepository) {
        this.colorRepository = colorRepository;
    }

    // Szín létrehozása
    public Color createColor(Color color) {
        // itt hajtsd végre a szükséges ellenőrzéseket vagy üzleti logikát
        return colorRepository.save(color);
    }

    // Színek lekérdezése
    public List<Color> getAllColors() {
        return colorRepository.findAll();
    }

    // Szín keresése azonosító alapján
    public Color getColorById(Long id) {
        return colorRepository.findById(id).orElse(null);
    }

    // Szín frissítése
    public Color updateColor(Long id, Color colorDetails) {
        Color color = colorRepository.findById(id).orElse(null);
        if (color != null) {
            // itt hajtsd végre a frissítési logikát
            return colorRepository.save(color);
        }
        return null;
    }

    // Szín törlése
    public void deleteColor(Long id) {
        colorRepository.deleteById(id);
    }
}
