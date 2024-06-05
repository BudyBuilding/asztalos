package asztalos.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import asztalos.model.User;
import asztalos.model.WorkObject;
import asztalos.repository.ObjectRepository;

@Service
public class ObjectService {

    @Autowired
    private ObjectRepository objectRepository;

    public List<WorkObject> findAll() {
        return objectRepository.findAll();
    }

    public Optional<WorkObject> findById(Long id) {
        return objectRepository.findById(id);
    }

    public WorkObject save(WorkObject workObject) {
        return objectRepository.save(workObject);
    }

    public void deleteById(Long id) {
        objectRepository.deleteById(id);
    }

    public List<WorkObject> findByUser(User user) {
        return objectRepository.findByUser(user);
    }
}
