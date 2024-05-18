package asztalos.service;

    import java.util.List;
    import java.util.Optional;

    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.stereotype.Service;

    import asztalos.model.Script;
    import asztalos.repository.ScriptRepository;

    @Service
    public class ScriptService {

        @Autowired
        private ScriptRepository scriptRepository;

        public List<Script> findAll() {
            return scriptRepository.findAll();
        }

        public Optional<Script> findById(Long id) {
            return scriptRepository.findById(id);
        }

        public Script save(Script script) {
            return scriptRepository.save(script);
        }

        public void deleteById(Long id) {
            scriptRepository.deleteById(id);
        }

    }
