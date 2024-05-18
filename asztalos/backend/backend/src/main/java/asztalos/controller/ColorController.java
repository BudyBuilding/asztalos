package asztalos.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import asztalos.model.Color;
import asztalos.service.ColorService;

@RestController
@RequestMapping("/colors")
public class ColorController {

    @Autowired
    private ColorService colorService;

    @GetMapping
    public List<Color> findAll() {
        return colorService.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Color> findById(@PathVariable Long id) {
        return colorService.findById(id);
    }

    // create a Color
    @ResponseStatus(HttpStatus.CREATED) // 201
    @PostMapping
    public Color create(@RequestBody Color Color) {
        return colorService.save(Color);
    }

    // update a Color
    @PutMapping
    public Color update(@RequestBody Color Color) {
        return colorService.save(Color);
    }

    // delete a Color
    @ResponseStatus(HttpStatus.NO_CONTENT) // 204
    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable Long id) {
        colorService.deleteById(id);
    }

}
