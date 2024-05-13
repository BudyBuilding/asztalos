import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkService {

    private final WorkRepository workRepository;

    @Autowired
    public WorkService(WorkRepository workRepository) {
        this.workRepository = workRepository;
    }

    // Munka létrehozása
    public Work createWork(Work work) {
        // itt hajtsd végre a szükséges ellenőrzéseket vagy üzleti logikát
        return workRepository.save(work);
    }

    // Munkák lekérdezése
    public List<Work> getAllWorks() {
        return workRepository.findAll();
    }

    // Munka keresése azonosító alapján
    public Work getWorkById(Long id) {
        return workRepository.findById(id).orElse(null);
    }

    // Munka frissítése
    public Work updateWork(Long id, Work workDetails) {
        Work work = workRepository.findById(id).orElse(null);
        if (work != null) {
            // itt hajtsd végre a frissítési logikát
            return workRepository.save(work);
        }
        return null;
    }

    // Munka törlése
    public void deleteWork(Long id) {
        workRepository.deleteById(id);
    }
}
