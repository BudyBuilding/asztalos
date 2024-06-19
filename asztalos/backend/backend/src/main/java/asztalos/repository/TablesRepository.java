package asztalos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import asztalos.model.Tables;
import asztalos.model.Work;

@Repository
public interface TablesRepository extends JpaRepository<Tables, Long> {

    List<Tables> findByWork(Work workId);
}
