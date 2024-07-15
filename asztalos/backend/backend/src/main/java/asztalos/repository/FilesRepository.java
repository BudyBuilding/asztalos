package asztalos.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import asztalos.model.Files;


public interface FilesRepository extends JpaRepository<Files, Long> {
    List<Files> findAll();
	Files findByName(String name);
}