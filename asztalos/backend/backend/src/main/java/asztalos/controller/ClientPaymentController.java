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

import asztalos.model.ClientPayment;
import asztalos.service.ClientPaymentService;

@RestController
@RequestMapping("/client-payments")
public class ClientPaymentController {

    @Autowired
    private ClientPaymentService clientPaymentService;

    @PostMapping
    public ClientPayment createClientPayment(@RequestBody ClientPayment clientPayment) {
        return clientPaymentService.saveClientPayment(clientPayment);
    }

    @GetMapping("/{id}")
    public ClientPayment getClientPaymentById(@PathVariable Long id) {
        return clientPaymentService.getClientPaymentById(id);
    }

    @GetMapping
    public List<ClientPayment> getAllClientPayments() {
        return clientPaymentService.getAllClientPayments();
    }

    @DeleteMapping("/{id}")
    public void deleteClientPayment(@PathVariable Long id) {
        clientPaymentService.deleteClientPayment(id);
    }
}
