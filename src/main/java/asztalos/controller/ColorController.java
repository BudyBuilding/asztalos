import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/colors")
public class ColorController {

    private final ColorService colorService;

    @Autowired
    public ColorController(ColorService colorService) {
        this.colorService = colorService;
    }

    @GetMapping
    public List<Color> getAllColors() {
        return colorService.getAllColors();
    }

    @GetMapping("/{id}")
    public Color getColorById(@PathVariable Long id) {
        return colorService.getColorById(id);
    }

    @PostMapping
    public Color createColor(@RequestBody Color color) {
        return colorService.createColor(color);
    }

    @PutMapping("/{id}")
    public Color updateColor(@PathVariable Long id, @RequestBody Color colorDetails) {
        return colorService.updateColor(id, colorDetails);
    }

    @DeleteMapping("/{id}")
    public void deleteColor(@PathVariable Long id) {
        colorService.deleteColor(id);
    }
}
