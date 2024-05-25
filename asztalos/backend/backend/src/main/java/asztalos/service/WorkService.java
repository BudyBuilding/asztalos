package asztalos.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import asztalos.model.Work;
import asztalos.repository.WorkRepository;

@Service
public class WorkService {

    @Autowired
    private WorkRepository workRepository;

    public List<Work> findAll() {
        return workRepository.findAll();
    }

    public Optional<Work> findById(Long id) {
        return workRepository.findById(id);
    }

    public Work save(Work work) {
        return workRepository.save(work);
    }

    public void deleteById(Long id) {
        workRepository.deleteById(id);
    }
}

