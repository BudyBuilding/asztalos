package asztalos.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import asztalos.model.UserPayment;
import asztalos.repository.UserPaymentRepository;

@Service
public class UserPaymentService {

    @Autowired
    private UserPaymentRepository userPaymentRepository;

    public UserPayment saveUserPayment(UserPayment userPayment) {
        return userPaymentRepository.save(userPayment);
    }

    public UserPayment getUserPaymentById(Long id) {
        return userPaymentRepository.findById(id).orElse(null);
    }

    public List<UserPayment> getAllUserPayments() {
        return userPaymentRepository.findAll();
    }

    public void deleteUserPayment(Long id) {
        userPaymentRepository.deleteById(id);
    }
}
