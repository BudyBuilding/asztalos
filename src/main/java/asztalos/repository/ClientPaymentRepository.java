package asztalos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import asztalos.model.Client;
import asztalos.model.ClientPayment;
import asztalos.model.User;
import asztalos.model.Work;

@Repository
public interface ClientPaymentRepository extends JpaRepository<ClientPayment, Long> {
    public List<ClientPayment> findByUser(User user);
    public List<ClientPayment> findByClient(Client client);
    public List<ClientPayment> findByWork(Work work);
}
