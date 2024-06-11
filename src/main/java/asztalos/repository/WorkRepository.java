package asztalos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import asztalos.model.Client;
import asztalos.model.User;
import asztalos.model.Work;

public interface WorkRepository extends JpaRepository<Work, Long> {
    List<Work> findByUser(User user);
    List<Work> findByClient(Client client);
}
