package asztalos.controller;

import java.lang.reflect.Field;
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

import asztalos.model.User;
import asztalos.model.UserPayment;
import asztalos.service.UserPaymentService;
import asztalos.service.UserService;

@RestController
@RequestMapping("/user-payments")
public class UserPaymentController {

    @Autowired
    private UserPaymentService userPaymentService;
    
    @Autowired
    private UserService userService;

   @GetMapping
    public ResponseEntity<?> getUserPayments(@RequestParam(required = false) Long paymentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> currentUser = userService.findByUsername(username);
        
        if (!currentUser.isPresent()) {
            return ResponseEntity.status(403).build();
        }

        if (paymentId != null) {
            Optional<UserPayment> userPayment = userPaymentService.findById(paymentId);
            if (!userPayment.isPresent()) {
                return ResponseEntity.status(404).build();
            }

            if (currentUser.get().getRole().equals("admin") || userPayment.get().getUser().equals(currentUser.get())) {
                return ResponseEntity.ok(userPayment.get());
            } else {
                return ResponseEntity.status(403).build();
            }
        } else {
            if (currentUser.get().getRole().equals("admin")) {
                List<UserPayment> userPayments = userPaymentService.findAll();
                return ResponseEntity.ok(userPayments);
            } else {
                List<UserPayment> userPayments = userPaymentService.findByUser(currentUser.get());
                return ResponseEntity.ok(userPayments);
            }
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserPaymentsByUserId(@PathVariable Long userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> currentUser = userService.findByUsername(username);
        
        if (!currentUser.isPresent() || !currentUser.get().getRole().equals("admin")) {
            return ResponseEntity.status(403).build();
        }

        Optional<User> user = userService.findById(userId);
        if (!user.isPresent()) {
            return ResponseEntity.status(404).build();
        }

        List<UserPayment> userPayments = userPaymentService.findByUser(user.get());
        return ResponseEntity.ok(userPayments);
    }
    @PostMapping
    public ResponseEntity<UserPayment> createUserPayment(@RequestBody UserPayment userPayment) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> user = userService.findByUsername(username);
        
        if (!user.isPresent()) {
            return ResponseEntity.status(403).build();
        }

        User currentUser = user.get();
        userPayment.setUser(currentUser);

        UserPayment createdUserPayment = userPaymentService.save(userPayment);
        return ResponseEntity.ok(createdUserPayment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserPayment> updateUserPayment(@PathVariable Long id, @RequestBody UserPayment userPaymentDetails) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> currentUser = userService.findByUsername(username);
        
        if (!currentUser.isPresent()) {
            return ResponseEntity.status(403).build();
        }

        Optional<UserPayment> userPayment = userPaymentService.findById(id);
        if (!userPayment.isPresent()) {
            return ResponseEntity.status(404).build();
        }

        if (!currentUser.get().getRole().equals("admin")) {
            UserPayment existingUserPayment = userPayment.get();
            if (!existingUserPayment.getUser().equals(currentUser.get())) {
                return ResponseEntity.status(403).build();
            }
        }

        try {
            Field[] fields = UserPayment.class.getDeclaredFields();
            for (Field field : fields) {
                field.setAccessible(true);
                Object value = field.get(userPaymentDetails);
                if (value != null) {
                    field.set(userPayment.get(), value);
                }
            }
        } catch (IllegalAccessException e) {
                    throw new RuntimeException("An error occurred while updating user payment details", e);
            }

        return ResponseEntity.ok(userPaymentService.save(userPayment.get()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserPayment(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> currentUser = userService.findByUsername(username);
        
        if (!currentUser.isPresent()) {
            return ResponseEntity.status(403).build();
        }

        Optional<UserPayment> userPayment = userPaymentService.findById(id);
        if (!userPayment.isPresent()) {
            return ResponseEntity.status(404).build();
        }

        if (!currentUser.get().getRole().equals("admin")) {
            UserPayment existingUserPayment = userPayment.get();
            if (!existingUserPayment.getUser().equals(currentUser.get())) {
                return ResponseEntity.status(403).build();
            }
        }

        userPaymentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
