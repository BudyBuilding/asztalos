package asztalos.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import asztalos.model.Work;
import asztalos.service.WorkService;

@RestController
@RequestMapping("/works")
public class WorkController {

    @Autowired
    private WorkService workService;

    @GetMapping
    public List<Work> getAllWorks() {
        return workService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Work> getWorkById(@PathVariable Long id) {
        Optional<Work> work = workService.findById(id);
        if (work.isPresent()) {
            return ResponseEntity.ok(work.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public Work createWork(@RequestBody Work work) {
        return workService.save(work);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Work> updateWork(@PathVariable Long id, @RequestBody Work workDetails) {
        Optional<Work> work = workService.findById(id);
        if (work.isPresent()) {
            Work updatedWork = work.get();
            updatedWork.setUser(workDetails.getUser());
            updatedWork.setClient(workDetails.getClient());
            updatedWork.setName(workDetails.getName());
            updatedWork.setStatus(workDetails.getStatus());
            updatedWork.setPrice(workDetails.getPrice());
            updatedWork.setPaid(workDetails.getPaid());
            updatedWork.setMeasureDate(workDetails.getMeasureDate());
            updatedWork.setOrderDate(workDetails.getOrderDate());
            updatedWork.setFinishDate(workDetails.getFinishDate());
            return ResponseEntity.ok(workService.save(updatedWork));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

   @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWork(@PathVariable("id") Long id) {
        Optional<Work> work = workService.findById(id);
        if (work.isPresent()) {
            workService.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build( );
        }
    }
}
