package asztalos.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import asztalos.model.Object;

// Spring Data JPA creates CRUD implementation at runtime automatically.
public interface ObjectRepository extends JpaRepository<Object, Long> {
}
