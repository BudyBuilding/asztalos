package asztalos.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import asztalos.model.Client;

// Spring Data JPA creates CRUD implementation at runtime automatically.
public interface ClientRepository extends JpaRepository<Client, Long> {
}
