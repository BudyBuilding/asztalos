package asztalos.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import asztalos.model.WorkObject;

public interface ObjectRepository extends JpaRepository<WorkObject, Long> {
    // Itt definiálhatsz egyedi lekérdezéseket, ha szükséges
}
