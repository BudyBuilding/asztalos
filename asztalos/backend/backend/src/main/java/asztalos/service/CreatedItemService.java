package asztalos.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import asztalos.model.CreatedItem;
import asztalos.repository.CreatedItemRepository;

@Service
public class CreatedItemService {

    @Autowired
    private CreatedItemRepository createdItemRepository;

    public CreatedItem saveCreatedItem(CreatedItem createdItem) {
        return createdItemRepository.save(createdItem);
    }

    public CreatedItem getCreatedItemById(Long id) {
        return createdItemRepository.findById(id).orElse(null);
    }

    public List<CreatedItem> getAllCreatedItems() {
        return createdItemRepository.findAll();
    }

    public void deleteCreatedItem(Long id) {
        createdItemRepository.deleteById(id);
    }
}
