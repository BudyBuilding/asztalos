package asztalos.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import asztalos.model.Color;
import asztalos.service.ColorService;

@RestController
@RequestMapping("/colors")
public class ColorController {

    @Autowired
    private ColorService colorService;

    @PostMapping
    public Color createColor(@RequestBody Color color) {
        return colorService.saveColor(color);
    }

    @GetMapping("/{id}")
    public Color getColorById(@PathVariable Long id) {
        return colorService.getColorById(id);
    }

    @GetMapping
    public List<Color> getAllColors() {
        return colorService.getAllColors();
    }

    @DeleteMapping("/{id}")
    public void deleteColor(@PathVariable Long id) {
        colorService.deleteColor(id);
    }
}
