package asztalos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import asztalos.model.User;
import asztalos.model.UserPayment;

@Repository
public interface UserPaymentRepository extends JpaRepository<UserPayment, Long> {
    public List<UserPayment> findByUser(User user);
    
}
