package asztalos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import asztalos.model.UserPayment;

@Repository
public interface UserPaymentRepository extends JpaRepository<UserPayment, Long> {
}
