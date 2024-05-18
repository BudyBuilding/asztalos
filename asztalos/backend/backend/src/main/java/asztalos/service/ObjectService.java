package asztalos.service;

    import java.util.List;
    import java.util.Optional;

    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.stereotype.Service;

    import asztalos.model.Object;
import asztalos.repository.ObjectRepository;

    @Service
    public class ObjectService {

        @Autowired
        private ObjectRepository objectRepository;

        public List<Object> findAll() {
            return objectRepository.findAll();
        }

        public Optional<Object> findById(Long id) {
            return objectRepository.findById(id);
        }

        public Object save(Object object) {
            return objectRepository.save(object);
        }

        public void deleteById(Long id) {
            objectRepository.deleteById(id);
        }

    }
