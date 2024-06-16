package asztalos.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import asztalos.model.Tables;
import asztalos.model.Work;
import asztalos.repository.TablesRepository;

@Service
public class TablesService {

    @Autowired
    private TablesRepository tableRepository;

    public List<Tables> findAll() {
        return tableRepository.findAll();
    }

    public Optional<Tables> findById(Long id) {
        return tableRepository.findById(id);
    }

    public Tables createTables(Tables table) {
        return tableRepository.save(table);
    }

    public Tables updateTables(Long id, Tables tableDetails) {
        Tables table = tableRepository.findById(id).orElseThrow(() -> new RuntimeException("Tables not found with id " + id));
        table.setName(tableDetails.getName());
        table.setWork(tableDetails.getWork());
        table.setQuantity(tableDetails.getQuantity());
        table.setType(tableDetails.getType());
        table.setPrice(tableDetails.getPrice());
        return tableRepository.save(table);
    }

    public void deleteTables(Long id) {
        tableRepository.deleteById(id);
    }

    // Új metódus az adott munkához tartozó Tables objektumok lekérdezésére
    public List<Tables> findByWork(Work work) {
        return tableRepository.findByWork(work);
    }
}
