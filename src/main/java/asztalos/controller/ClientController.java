package asztalos.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import asztalos.model.Client;
import asztalos.service.ClientService;

@RestController
@RequestMapping("/client")
public class ClientController {

    @Autowired
    private ClientService clientService;

    @GetMapping
    public List<Client> findAll() {
        return clientService.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Client> findById(@PathVariable Long id) {
        return clientService.findById(id);
    }

    // create a Client
    @ResponseStatus(HttpStatus.CREATED) // 201
    @PostMapping
    public Client create(@RequestBody Client Client) {
        return clientService.save(Client);
    }

    // update a Client
    @PutMapping
    public Client update(@RequestBody Client Client) {
        return clientService.save(Client);
    }

    // delete a Client
    @ResponseStatus(HttpStatus.NO_CONTENT) // 204
    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable Long id) {
        clientService.deleteById(id);
    }

}
