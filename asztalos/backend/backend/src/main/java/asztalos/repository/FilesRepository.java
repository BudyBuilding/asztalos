package asztalos.repository;
import org.springframework.data.jpa.repository.JpaRepository;

import asztalos.model.Files;


public interface FilesRepository extends JpaRepository<Files, Long> {

	Files findByName(String name);
}