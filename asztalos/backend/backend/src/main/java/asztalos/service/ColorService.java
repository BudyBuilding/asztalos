package asztalos.service;

    import java.util.List;
    import java.util.Optional;

    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.stereotype.Service;

    import asztalos.model.Color;
import asztalos.repository.ColorRepository;

    @Service
    public class ColorService {

        @Autowired
        private ColorRepository colorRepository;

        public List<Color> findAll() {
            return colorRepository.findAll();
        }

        public Optional<Color> findById(Long id) {
            return colorRepository.findById(id);
        }

        public Color save(Color color) {
            return colorRepository.save(color);
        }

        public void deleteById(Long id) {
            colorRepository.deleteById(id);
        }

    }
