package asztalos.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import asztalos.model.User;
import asztalos.model.UserPayment;
import asztalos.repository.UserPaymentRepository;

@Service
public class UserPaymentService {

    @Autowired
    private UserPaymentRepository userPaymentRepository;

    public UserPayment save(UserPayment userPayment) {
        return userPaymentRepository.save(userPayment);
    }

    public Optional<UserPayment> findById(Long id) {
        return userPaymentRepository.findById(id);
    }

    public List<UserPayment> findAll() {
        return userPaymentRepository.findAll();
    }
    public List<UserPayment> findByUser(User user) {
        return userPaymentRepository.findByUser(user);
    }

    public void delete(Long id) {
        userPaymentRepository.deleteById(id);
    }
}
