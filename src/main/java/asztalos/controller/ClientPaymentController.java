package asztalos.controller;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
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
import asztalos.model.ClientPayment;
import asztalos.model.User;
import asztalos.model.Work;
import asztalos.service.ClientPaymentService;
import asztalos.service.ClientService;
import asztalos.service.UserService;
import asztalos.service.WorkService;

@CrossOrigin
@RestController
@RequestMapping("/client-payments")
public class ClientPaymentController {

    @Autowired
    private ClientPaymentService clientPaymentService;
    @Autowired
    private UserService userService;
    @Autowired
    private ClientService clientService;
    @Autowired
    private WorkService workService;

    /////////////////////////////////////
 @GetMapping
 public ResponseEntity<?> getClientPayment(@RequestParam(required = false) Long paymentId) {
     Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
     String username = authentication.getName();
     Optional<User> currentUser = userService.findByUsername(username);

     // checking if the user from the token is available
     // cannot give problem (but who de hell knows)
     if (!currentUser.isPresent()) {
         return ResponseEntity.status(403).build();
     }

     // checking if the user wants only one or more client to load
     if (paymentId != null) {
         Optional<ClientPayment> clientPayment = clientPaymentService.findById(paymentId);

         // if only one, so the user gave a paymentId we must check if the user is the same with the user in the token
         // so no one could check the others clients
         if (clientPayment.isPresent()
                 && clientPayment.get().getUser().getUserId().equals(currentUser.get().getUserId())) {
             return ResponseEntity.ok(clientPayment.get());
         } else {
             // if there is no clientPayment or the user cannot check that clientPayment 
             return ResponseEntity.status(403).build();
         }
     } else {
         // if the user want to get all the clientPayment
         // we must check if the user is admin or not
         if (currentUser.get().getRole().equals("admin")) {
             //if is admin then we must give them all the clientPayments
             List<ClientPayment> clientPayments = clientPaymentService.findAll();
             return ResponseEntity.ok(clientPayments);
         } else {
             // if is not admin then we must show them only their clientPayments
             List<ClientPayment> clientPayments = clientPaymentService.findByUser(currentUser.get());
             return ResponseEntity.ok(clientPayments);
         }
     }
 }

    
  @GetMapping("/client/{clientId}")
    public ResponseEntity<?> getClientPaymentByClient(@PathVariable Long clientId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> currentUser = userService.findByUsername(username);
        Optional<Client> currentClient = clientService.findById(clientId);
        
        // checking if the user from the token is available
        // cannot give problem (but who de hell knows)
        if (!currentUser.isPresent()) {
            return ResponseEntity.status(403).build();
        }

        // checking if the client is available
        if (!currentClient.isPresent()) {
            return ResponseEntity.status(403).build();
        }

        Client client = currentClient.get();
        User user = currentUser.get();

          // Check if the client belongs to the user or the user is admin
        if (!client.getUser().getUserId().equals(user.getUserId()) && !user.getRole().equals("admin")) {
            return ResponseEntity.status(403).build();
        }

        List<ClientPayment> clientPayments = clientPaymentService.findByClient(client);

        return ResponseEntity.ok(clientPayments);
    }



      @GetMapping("/work/{workId}")
    public ResponseEntity<?> getClientPaymentByWork(@PathVariable Long workId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> currentUser = userService.findByUsername(username);
        Optional<Work> currentWork = workService.findById(workId);
        
        // checking if the user from the token is available
        // cannot give problem (but who de hell knows)
        if (!currentUser.isPresent()) {
            return ResponseEntity.status(403).build();
        }

        // checking if the Work is available
        if (!currentWork.isPresent()) {
            return ResponseEntity.status(403).build();
        }

        Work work = currentWork.get();
        User user = currentUser.get();

          // Check if the Work belongs to the user or the user is admin
        if (!work.getUser().getUserId().equals(user.getUserId()) && !user.getRole().equals("admin")) {
            return ResponseEntity.status(403).build();
        }

        List<ClientPayment> clientPayments = clientPaymentService.findByWork(work);

        return ResponseEntity.ok(clientPayments);
    }

@GetMapping("/user")
public ResponseEntity<?> getClientPaymentByUser(@RequestParam(required = false) Long userId) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    String username = authentication.getName();
    Optional<User> currentUser = userService.findByUsername(username);

    // checking if the user from the token is available
    if (!currentUser.isPresent()) {
        return ResponseEntity.status(403).build();
    }

    User user; // Declare the variable here

    // checking if the user wants only one or more client to load
    if (userId != null) {
        User tokenUser = currentUser.get(); // Get the user from the token
        if (tokenUser.getRole().equalsIgnoreCase("admin")) {
            user = userService.findById(userId).orElse(null);
        } else {
            return ResponseEntity.status(403).build();
        }
    } else {
        user = currentUser.get(); // If userId is null, use the user from the token
    }

    if (user != null) {
        List<ClientPayment> clientPayments = clientPaymentService.findByUser(user);
        return ResponseEntity.ok(clientPayments);
    }

    return ResponseEntity.status(403).build();
}

    /////////////////////////////////////
    
    @PostMapping
public ResponseEntity<ClientPayment> createClientPayment(@RequestBody ClientPayment clientPayment) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    String username = authentication.getName();
    Optional<User> currentUser = userService.findByUsername(username);

    // checking if the user from the token is available
    if (!currentUser.isPresent()) {
        return ResponseEntity.status(403).build();
    }

    User user = currentUser.get();

    // Allow only admin or user to create a client payment
    if (!user.getRole().equalsIgnoreCase("admin") && !user.getRole().equalsIgnoreCase("user")) {
        return ResponseEntity.status(403).build();
    }

    // Set the user for the client payment if the role is user
    if (user.getRole().equalsIgnoreCase("user")) {
        clientPayment.setUser(user);
    }

    ClientPayment createdClientPayment = clientPaymentService.save(clientPayment);
    return ResponseEntity.ok(createdClientPayment);
}



@PutMapping("/{id}")
public ResponseEntity<ClientPayment> updateClientPayment(@PathVariable Long id,
        @RequestBody ClientPayment clientPaymentDetails) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    String username = authentication.getName();
    Optional<User> currentUser = userService.findByUsername(username);

    // checking if the user from the token is available
    if (!currentUser.isPresent()) {
        return ResponseEntity.status(403).build();
    }

    User user = currentUser.get();

    // Allow only admin or user to update a client payment
    if (!user.getRole().equalsIgnoreCase("admin") && !user.getRole().equalsIgnoreCase("user")) {
        return ResponseEntity.status(403).build();
    }

    Optional<ClientPayment> clientPayment = clientPaymentService.findById(id);
    if (!clientPayment.isPresent()) {
        return ResponseEntity.notFound().build();
    }

    ClientPayment existingClientPayment = clientPayment.get();

    // If the user is not admin, ensure they can only update their own client payments
    if (user.getRole().equalsIgnoreCase("user") && !existingClientPayment.getUser().getUserId().equals(user.getUserId())) {
        return ResponseEntity.status(403).build();
    }

    try {
        Field[] fields = ClientPayment.class.getDeclaredFields();
        for (Field field : fields) {
            field.setAccessible(true);
            Object value = field.get(clientPaymentDetails);
            if (value != null) {
                field.set(existingClientPayment, value);
            }
        }
    } catch (IllegalAccessException e) {
                    throw new RuntimeException("An error occurred while updating client payment details", e);
            }

    return ResponseEntity.ok(clientPaymentService.save(existingClientPayment));
}

    

    @DeleteMapping("/{id}")
public ResponseEntity<Void> deleteClientPayment(@PathVariable Long id) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    String username = authentication.getName();
    Optional<User> currentUser = userService.findByUsername(username);

    // checking if the user from the token is available
    if (!currentUser.isPresent()) {
        return ResponseEntity.status(403).build();
    }

    User user = currentUser.get();

    // Allow only admin or user to delete a client payment
    if (!user.getRole().equalsIgnoreCase("admin") && !user.getRole().equalsIgnoreCase("user")) {
        return ResponseEntity.status(403).build();
    }

    Optional<ClientPayment> clientPayment = clientPaymentService.findById(id);
    if (!clientPayment.isPresent()) {
        return ResponseEntity.notFound().build();
    }

    ClientPayment existingClientPayment = clientPayment.get();

    // If the user is not admin, ensure they can only delete their own client payments
    if (user.getRole().equalsIgnoreCase("user") && !existingClientPayment.getUser().getUserId().equals(user.getUserId())) {
        return ResponseEntity.status(403).build();
    }

    clientPaymentService.delete(id);
    return ResponseEntity.noContent().build();
}

}
