package asztalos.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import asztalos.model.ClientPayment;
import asztalos.repository.ClientPaymentRepository;

@Service
public class ClientPaymentService {

    @Autowired
    private ClientPaymentRepository clientPaymentRepository;

    public ClientPayment saveClientPayment(ClientPayment clientPayment) {
        return clientPaymentRepository.save(clientPayment);
    }

    public ClientPayment getClientPaymentById(Long id) {
        return clientPaymentRepository.findById(id).orElse(null);
    }

    public List<ClientPayment> getAllClientPayments() {
        return clientPaymentRepository.findAll();
    }

    public void deleteClientPayment(Long id) {
        clientPaymentRepository.deleteById(id);
    }
}
