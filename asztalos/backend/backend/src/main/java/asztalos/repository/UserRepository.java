package asztalos.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import asztalos.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    // Itt definiálhatsz egyedi lekérdezéseket, ha szükséges
}