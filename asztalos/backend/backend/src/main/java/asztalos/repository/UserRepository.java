package asztalos.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import asztalos.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    public Optional<User> findByEmail(String email);
}