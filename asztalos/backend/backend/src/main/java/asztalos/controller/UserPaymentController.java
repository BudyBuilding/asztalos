package asztalos.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import asztalos.model.UserPayment;
import asztalos.service.UserPaymentService;

@RestController
@RequestMapping("/user_payments")
public class UserPaymentController {

    @Autowired
    private UserPaymentService userPaymentService;

    @PostMapping
    public UserPayment createUserPayment(@RequestBody UserPayment userPayment) {
        return userPaymentService.saveUserPayment(userPayment);
    }

    @GetMapping("/{id}")
    public UserPayment getUserPaymentById(@PathVariable Long id) {
        return userPaymentService.getUserPaymentById(id);
    }

    @GetMapping
    public List<UserPayment> getAllUserPayments() {
        return userPaymentService.getAllUserPayments();
    }

    @DeleteMapping("/{id}")
    public void deleteUserPayment(@PathVariable Long id) {
        userPaymentService.deleteUserPayment(id);
    }
}
