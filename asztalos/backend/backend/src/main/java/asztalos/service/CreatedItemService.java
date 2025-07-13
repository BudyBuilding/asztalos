package asztalos.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import asztalos.model.CreatedItem;
import asztalos.model.CreatedTables;
import asztalos.model.WorkObject;
import asztalos.model.Work;

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

    public List<CreatedItem> findByWork(Work work) {
        return createdItemRepository.findByWork(work);
    }

    public List<CreatedItem> findAll() {
        return createdItemRepository.findAll();
    }

    public void delete(Long id) {
        createdItemRepository.deleteById(id);
    }

    public List<CreatedItem> findByTable(CreatedTables table) {
        long tableId = table.getId();
        return createdItemRepository.findAll().stream()
            .filter(ci -> containsTableId(ci.getTablePosition(), tableId))
            .collect(Collectors.toList());
    }
    
    private boolean containsTableId(String tablePosition, long tableId) {
        if (tablePosition == null || tablePosition.isEmpty()) {
            return false;
        }
        // pl. "[1140,0,1,89],[1346,0,1,89]"
        // szétválasztjuk egységekre
        String[] parts = tablePosition
            .replace("],[","]|[")    // "[…][…]" → "[…]|[…]"; így split könnyebb
            .split("\\|");
        for (String part : parts) {
            // töröljük a zárójeleket, majd vesszővel szétdaraboljuk
            String inner = part.replace("[","").replace("]","");
            String[] nums = inner.split(",");
            if (nums.length == 4) {
                try {
                    long id = Long.parseLong(nums[3].trim());
                    if (id == tableId) {
                        return true;
                    }
                } catch (NumberFormatException e) {
                    // ha nem szám, továbblépünk
                }
            }
        }
        return false;
    }
 

}
