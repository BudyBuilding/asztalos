package asztalos.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import asztalos.model.CreatedItem;
import asztalos.model.WorkObject;
import asztalos.repository.CreatedItemRepository;

@Service
public class CreatedItemService {

    @Autowired
    private CreatedItemRepository createdItemRepository;

    public CreatedItem save(CreatedItem createdItem) {
        return createdItemRepository.save(createdItem);
    }

    public Optional<CreatedItem> findById(Long id) {
        return createdItemRepository.findById(id);
    }

    public List<CreatedItem> findByObject(WorkObject object) {
        return createdItemRepository.findByObject(object);
    }

    public List<CreatedItem> findAll() {
        return createdItemRepository.findAll();
    }

    public void delete(Long id) {
        createdItemRepository.deleteById(id);
    }
}
