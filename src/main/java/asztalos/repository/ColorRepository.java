package asztalos.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import asztalos.model.Color;

// Spring Data JPA creates CRUD implementation at runtime automatically.
public interface ColorRepository extends JpaRepository<Color, Long> {
}
