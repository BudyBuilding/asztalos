package asztalos.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import asztalos.model.Client;
import asztalos.model.ClientPayment;
import asztalos.model.User;
import asztalos.model.Work;
import asztalos.repository.ClientPaymentRepository;


@Service
public class ClientPaymentService {

    @Autowired
    private ClientPaymentRepository clientPaymentRepository;

    public ClientPayment save(ClientPayment clientPayment) {
        return clientPaymentRepository.save(clientPayment);
    }

    public Optional<ClientPayment> findById(Long id) {
        return clientPaymentRepository.findById(id);
    }

    public List<ClientPayment> findByUser(User user) {
        return clientPaymentRepository.findByUser(user);
    }

    public List<ClientPayment> findByClient(Client client) {
        return clientPaymentRepository.findByClient(client);
    }
    
    public List<ClientPayment> findByWork(Work work) {
        return clientPaymentRepository.findByWork(work);
    }

    public List<ClientPayment> findAll() {
        return clientPaymentRepository.findAll();
    }

    public void delete(Long id) {
        clientPaymentRepository.deleteById(id);
    }
}
