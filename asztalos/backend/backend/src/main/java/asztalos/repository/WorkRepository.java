package asztalos.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import asztalos.model.Work;

public interface WorkRepository extends JpaRepository<Work, Long> {
    // Itt definiálhatsz egyedi lekérdezéseket, ha szükséges
}
