package asztalos.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import asztalos.model.Client;
import asztalos.model.User;
import asztalos.service.ClientService;
import asztalos.service.UserService;

@RestController
@RequestMapping("/clients")
public class ClientController {

    @Autowired
    private ClientService clientService;
    
    @Autowired
    private UserService userService;

    // Loading only one or all client related for an user with token   
    // Considerating that if the user is an admin
    // for the admins all the clients must be visible 
    @GetMapping
    public ResponseEntity<?> getClients(@RequestParam(required = false) Long clientId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> currentUser = userService.findByUsername(username);

        // checking if the user from the token is available
        // cannot give problem (but who de hell knows)
        if (!currentUser.isPresent()) {
            return ResponseEntity.status(403).build();
        }

        // checking if the user is admin
        if (currentUser.get().getRole().equals("admin")) {
            // if the user who makes the call is an admin
            // is so he must get all the clients 
            List<Client> clients = clientService.findAll();
            return ResponseEntity.ok(clients);
        } else {
            // in that case if the user is not admin then it must get only his clients
            List<Client> clients = clientService.findByUser(currentUser.get());
            return ResponseEntity.ok(clients);
        }
    }

    // creating new client
    @PostMapping
    public ResponseEntity<?> createClient(@RequestBody Client client) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> currentUser = userService.findByUsername(username);

        // checking if the user from the token is available
        // cannot give problem (but who de hell knows)
        if (!currentUser.isPresent()) {
            return ResponseEntity.status(403).build();
        }

        // setting up the new clients user
        client.setUser(currentUser.get());

        // creating the new client object and filling up with the data
        Client createdClient = clientService.save(client);
        return ResponseEntity.ok(createdClient);
    }

    // modifying a client
    @PutMapping("/{id}")
    public ResponseEntity<Client> updateClient(@PathVariable Long id, @RequestBody Client clientDetails) {
        Optional<Client> clientOptional = clientService.findById(id);

        // searching if there is a client with that id
        if (clientOptional.isPresent()) {

            // if there is a client then making a Client object from the Optional
            Client existingClient = clientOptional.get();
            
            //updating some data about it
            existingClient.setName(clientDetails.getName());
            existingClient.setAddress(clientDetails.getAddress());
            existingClient.setTelephone(clientDetails.getTelephone());
            // todo making more updates if it's neccessary

            // saving the updated client object
            Client updatedClient = clientService.save(existingClient);
            return ResponseEntity.ok(updatedClient);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // deleting a client
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClient(@PathVariable("id") Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> user = userService.findByUsername(username);

        // searching if there is an user with that username from the token
        if (!user.isPresent()) {
            return ResponseEntity.status(403).build();
        }

        Optional<Client> client = clientService.findById(id);
        
        // checking if there is a client record with that clientID
        if (client.isPresent() && client.get().getUser().getUserId().equals(user.get().getUserId())) {
            
            //if there is a client then we must change his user attribute to the -1 user
            //we load that user and update with his data
            client.get().setUser(userService.findById(-1L).get());
            
            //saving the updates
            clientService.save(client.get()); 
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.status(403).build();
        }
    }
}

