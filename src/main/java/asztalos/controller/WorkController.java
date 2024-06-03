package asztalos.controller;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import asztalos.model.User;
import asztalos.model.Work;
import asztalos.service.UserService;
import asztalos.service.WorkService;

@RestController
@RequestMapping("/works")
public class WorkController {

    @Autowired
    private WorkService workService;

    @Autowired
    private UserService userService;

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
           if (currentUser.get().getRole().equals("admin")) {
               //if is admin then we must give them all the works
               List<Work> works = workService.findAll();
               return ResponseEntity.ok(works);
           } else {
               // if is not admin then we must show them only their works
               List<Work> works = workService.findByUser(currentUser.get());
               return ResponseEntity.ok(works);
           }
       }
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
            if (!existingwork.getUser().getUserId().equals(currentUser.get().getUserId()) && !currentUser.get().getRole().equals("admin")) {
                return ResponseEntity.status(403).build(); // Unauthorized
            }

            // Updating work details
            try {
                // Az Work osztály összes mezőjének lekérése
                Field[] fields = Work.class.getDeclaredFields();

                // Végigmegyünk az összes mezőn
                for (Field field : fields) {
                    field.setAccessible(true); // A mező hozzáférhetővé tétele
                    Object value = field.get(workDetails); // Az érték lekérése az eredeti munkaobjektumból
                    if (value != null) {
                        field.set(updatedWork, value); // Az érték beállítása az új munkaobjektumban
                    }
                }
            } catch (IllegalAccessException e) {
                e.printStackTrace(); // IllegalAccessException kezelése
            }

            return ResponseEntity.ok(workService.save(existingwork));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
