import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/works")
public class WorkController {

    private final WorkService workService;

    @Autowired
    public WorkController(WorkService workService) {
        this.workService = workService;
    }

    @GetMapping
    public List<Work> getAllWorks() {
        return workService.getAllWorks();
    }

    @GetMapping("/{id}")
    public Work getWorkById(@PathVariable Long id) {
        return workService.getWorkById(id);
    }

    @PostMapping
    public Work createWork(@RequestBody Work work) {
        return workService.createWork(work);
    }

    @PutMapping("/{id}")
    public Work updateWork(@PathVariable Long id, @RequestBody Work workDetails) {
        return workService.updateWork(id, workDetails);
    }

    @DeleteMapping("/{id}")
    public void deleteWork(@PathVariable Long id) {
        workService.deleteWork(id);
    }
}
