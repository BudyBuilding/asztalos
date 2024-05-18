package asztalos.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import asztalos.model.Work;

// Spring Data JPA creates CRUD implementation at runtime automatically.
public interface WorkRepository extends JpaRepository<Work, Long> {
}
