package asztalos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import asztalos.model.CreatedTables;
import asztalos.model.Work;

@Repository
public interface CreatedTablesRepository extends JpaRepository<CreatedTables, Long> {

    List<CreatedTables> findByWork(Work workId);
}
