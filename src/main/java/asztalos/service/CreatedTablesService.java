package asztalos.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import asztalos.model.CreatedTables;
import asztalos.model.Work;
import asztalos.repository.CreatedTablesRepository;

@Service
public class CreatedTablesService {

    @Autowired
    private CreatedTablesRepository CreatedTableRepository;

    public List<CreatedTables> findAll() {
        return CreatedTableRepository.findAll();
    }

    public Optional<CreatedTables> findById(Long id) {
        return CreatedTableRepository.findById(id);
    }

    public CreatedTables createCreatedTables(CreatedTables table) {
        return CreatedTableRepository.save(table);
    }

    public CreatedTables updateCreatedTables(Long id, CreatedTables tableDetails) {
        CreatedTables table = CreatedTableRepository.findById(id).orElseThrow(() -> new RuntimeException("CreatedTables not found with id " + id));
        table.setWork(tableDetails.getWork());
        table.setPrice(tableDetails.getPrice());
        table.setColor(tableDetails.getColor());
        return CreatedTableRepository.save(table);
    }

    public void deleteCreatedTables(Long id) {
        CreatedTableRepository.deleteById(id);
    }
    public CreatedTables save(CreatedTables table) {
        return CreatedTableRepository.save(table);
    }
    // Új metódus az adott munkához tartozó CreatedTables objektumok lekérdezésére
    public List<CreatedTables> findByWork(Work work) {
        return CreatedTableRepository.findByWork(work);
    }
}
