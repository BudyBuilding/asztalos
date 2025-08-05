package asztalos.controller;

import java.lang.reflect.Field;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
import asztalos.model.CreatedTables;
import asztalos.model.User;
import asztalos.model.Work;
import asztalos.service.ClientService;
import asztalos.service.CreatedTablesService;
import asztalos.service.TableOptimizationService;
import asztalos.service.UserService;
import asztalos.service.WorkService;

@CrossOrigin
@RestController
@RequestMapping("/works")
public class WorkController {

    @Autowired
    private WorkService workService;

    @Autowired
    private UserService userService;

    @Autowired
    private ClientService clientService;

    @Autowired
    private TableOptimizationService tableOptimizationService;
    @Autowired
    private CreatedTablesService createdTablesService;

    // Loading only one or all work related for an user with token   
    // Considerating that if the user is an admin
    // for the admins all the works must be visible 
   @GetMapping
   public ResponseEntity<?> getworks(@RequestParam(required = false) Long workId) {
       Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
       String username = authentication.getName();
       Optional<User> currentUser = userService.findByUsername(username);

       // checking if the user from the token is available
       // cannot give problem (but who de hell knows)
       if (!currentUser.isPresent()) {
           return ResponseEntity.status(403).build();
       }

       // checking if the user wants only one or more work to load
       if (workId != null) {
           Optional<Work> work = workService.findById(workId);

           // if only one, so the user gave a workId we must check if the user is the same with the user in the token
           // so no one could check the others works
           if (work.isPresent() && work.get().getUser().getUserId().equals(currentUser.get().getUserId())) {
               return ResponseEntity.ok(work.get());
           } else {
               // if there is no work or the user cannot check that work 
               return ResponseEntity.status(403).build();
           }
       } else {
           // if the user want to get all the work
           // we must check if the user is admin or not
           if (currentUser.get().getRole().equals("admin"))  {
               //if is admin then we must give them all the works
               List<Work> works = workService.findAll();
               return ResponseEntity.ok(works);
           } else {
           if (currentUser.get().getRole().equals("companyAdmin") || 
               currentUser.get().getRole().equals("companyUser")) {
              //  List<Work> works = workService.findAll();

                List<Work> works = workService.findAll().stream()
                .filter(w -> Boolean.TRUE.equals(w.getIsOrdered()))
                .collect(Collectors.toList());

                return ResponseEntity.ok(works);
           } else {
               // if is not admin then we must show them only their works
               List<Work> works = workService.findByUser(currentUser.get());
               return ResponseEntity.ok(works);
           }
       }}
   }

   @GetMapping("/client/{clientId}")
    public ResponseEntity<?> getWorksByClient(@PathVariable Long clientId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> currentUser = userService.findByUsername(username);

        // checking if the user from the token is available
        // cannot give problem (but who de hell knows)
        if (!currentUser.isPresent()) {
            return ResponseEntity.status(403).build();
        }

        // Check if the client exists
        Optional<Client> client = clientService.findById(clientId);
        if (!client.isPresent()) {
            return ResponseEntity.status(404).build();
        }

        // Check if the client belongs to the current user
        if (!client.get().getUser().getUserId().equals(currentUser.get().getUserId())
                && !currentUser.get().getRole().equals("admin")
                    && !currentUser.get().getRole().equals("companyAdmin")
                    && !currentUser.get().getRole().equals("companyUser")) {
            return ResponseEntity.status(403).build(); // Unauthorized
        }

        // Fetch works associated with the client
        List<Work> works = workService.findByClient(client.get());
        return ResponseEntity.ok(works);
    }

    
       // modifying a work
    @PutMapping("/{id}")
    public ResponseEntity<Work> updatework(@PathVariable Long id, @RequestBody Work workDetails) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> currentUser = userService.findByUsername(username);

        // checking if the user from the token is available
        // cannot give problem (but who de hell knows)
        if (!currentUser.isPresent()) {
            return ResponseEntity.status(403).build();
        }

        // searching for the original work
        Optional<Work> workOptional = workService.findById(id);

        // checking if there is any work to modify
        if (workOptional.isPresent()) {
            Work existingwork = workOptional.get();
            Work updatedWork = workOptional.get();

            // Checking if the work belongs to the current user
            if (!existingwork.getUser().getUserId().equals(currentUser.get().getUserId())
                    && !currentUser.get().getRole().equals("admin")
                    && !currentUser.get().getRole().equals("companyAdmin")
                    && !currentUser.get().getRole().equals("companyUser")
                    ) {   
                return ResponseEntity.status(403).build(); // Unauthorized
            }

            // Updating work details
            try {
                // Az Work osztály összes mezőjének lekérése
                Field[] fields = Work.class.getDeclaredFields();

                // Végigmegyünk az összes mezőn
                for (Field field : fields) {
                    field.setAccessible(true);
                    Object value = field.get(workDetails);
                    field.set(updatedWork, value); // -> null is lehet
                }
            } catch (IllegalAccessException e) {
                    throw new RuntimeException("An error occurred while updating user details", e);
            }

            // 1) elmentjük a frissített Work-öt
            Work saved = workService.save(existingwork);

            // 2) generáljuk az új táblákat az adott munkához
            List<CreatedTables> generated = tableOptimizationService.generateTables(saved);
            // 3) és mentjük is őket
            generated.forEach(createdTablesService::save);

            // 4) visszatérünk a mentett (és már táblákkal kiegészített) munkával
            return ResponseEntity.ok(saved);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // deleting a work
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWork(@PathVariable("id") Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> user = userService.findByUsername(username);

        // searching if there is an user with that username from the token
        if (!user.isPresent()) {
            return ResponseEntity.status(403).build();
        }

        Optional<Work> work = workService.findById(id);

        // checking if there is a work record with that workID
        if (work.isPresent() && (work.get().getUser().getUserId().equals(user.get().getUserId())
                || user.get().getRole().equals("admin"))) {

            //if there is a work then we must change his user attribute to the -1 user
            //we load that user and update with his data
            work.get().setUser(userService.findById(-1L).get());

            //saving the updates
            workService.save(work.get());
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.status(403).build();
        }
    }
    
    // creating new work
@PostMapping
public ResponseEntity<?> createWork(@RequestBody Work work) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    String username = authentication.getName();
    Optional<User> currentUser = userService.findByUsername(username);
    Optional<Client> currentClient = clientService.findById(work.getClient().getClientId());

    if (!currentClient.isPresent()) {
        return ResponseEntity.status(404).build();
    }
    if (!currentUser.isPresent()) {
        return ResponseEntity.status(403).build();
    }

    // Felhasználó és kliens beállítása
    work.setUser(currentUser.get());
    work.setClient(currentClient.get());

    // Alapértelmezett értékek
    work.setClientPrice(0d);
    work.setClientPaid(0d);
    work.setUserPaid(0d);         // ← ide kell hozzáadni
    work.setStatus("measured");
    work.setLabel(0d);
    work.setMeasureDate(new Date());
    work.setRoom("[2500,5000,5000]");

    Work createdWork = workService.save(work);
    return ResponseEntity.ok(createdWork);
}

}
