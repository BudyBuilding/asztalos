package asztalos.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import asztalos.model.Color;
import asztalos.repository.ColorRepository;

@Service
public class ColorService {

    @Autowired
    private ColorRepository colorRepository;

    public Color saveColor(Color color) {
        return colorRepository.save(color);
    }

    public Color findById(Long id) {
        return colorRepository.findById(id).orElse(null);
    }

    public List<Color> getAllColors() {
        return colorRepository.findAll();
    }

    public void deleteColor(Long id) {
        colorRepository.deleteById(id);
    }
}
