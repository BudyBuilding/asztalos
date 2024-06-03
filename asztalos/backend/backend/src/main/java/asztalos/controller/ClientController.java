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

        if (!currentUser.isPresent()) {
            return ResponseEntity.status(403).build();
        }

        // Az aktuális felhasználó szerepének ellenőrzése
        if (currentUser.get().getRole().equals("admin")) {
            // Az admin szerepű felhasználóknak megjeleníthetjük az összes klienst
            List<Client> clients = clientService.findAll(); 
            return ResponseEntity.ok(clients);
        } else {
            // Az egyéb felhasználóknak csak a saját klienseiket mutatjuk meg
            List<Client> clients = clientService.findByUser(currentUser.get());
            return ResponseEntity.ok(clients);
        }   
    }

    @PostMapping
    public ResponseEntity<?> createClient(@RequestBody Client client) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> currentUser = userService.findByUsername(username);

        if (!currentUser.isPresent()) {
            return ResponseEntity.status(403).build();
        }
        
        // Beállítjuk az új ügyfél felhasználóját az aktuális felhasználóra
        client.setUser(currentUser.get());

        // Ügyfél létrehozása
        Client createdClient = clientService.save(client);
        return ResponseEntity.ok(createdClient);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Client> updateClient(@PathVariable Long id, @RequestBody Client clientDetails) {
        Optional<Client> clientOptional = clientService.findById(id);
        if (clientOptional.isPresent()) {
            Client existingClient = clientOptional.get();        
            existingClient.setName(clientDetails.getName());
            existingClient.setAddress(clientDetails.getAddress());
            existingClient.setTelephone(clientDetails.getTelephone());
            // Az existingClient további tulajdonságait is frissítheted szükség szerint

            // A frissített klienst elmentjük
            Client updatedClient = clientService.save(existingClient);
            return ResponseEntity.ok(updatedClient);
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClient(@PathVariable("id") Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> user = userService.findByUsername(username);

        if (!user.isPresent()) {
            return ResponseEntity.status(403).build();
        }

        Optional<Client> client = clientService.findById(id);
        if (client.isPresent() && client.get().getUser().getUserId().equals(user.get().getUserId())) {
            // A kliens felhasználóját megváltoztatjuk az adatbázisban
            client.get().setUser(userService.findById(-1L).get()); // -1L a kívánt user ID
            clientService.save(client.get()); // Mentsük el a módosított klienst
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.status(403).build();
        }
    }

}

