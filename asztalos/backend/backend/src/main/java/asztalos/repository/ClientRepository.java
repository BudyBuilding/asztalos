package asztalos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import asztalos.model.Client;
import asztalos.model.User;

public interface ClientRepository extends JpaRepository<Client, Long> {
 List<Client> findByUser(User user);
}
