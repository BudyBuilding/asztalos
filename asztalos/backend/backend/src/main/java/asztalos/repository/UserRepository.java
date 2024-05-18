package asztalos.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import asztalos.model.User;

// Spring Data JPA creates CRUD implementation at runtime automatically.
public interface UserRepository extends JpaRepository<User, Long> {
}
