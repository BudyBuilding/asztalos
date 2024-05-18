package asztalos.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import asztalos.model.Script;

// Spring Data JPA creates CRUD implementation at runtime automatically.
public interface ScriptRepository extends JpaRepository<Script, Long> {
}
