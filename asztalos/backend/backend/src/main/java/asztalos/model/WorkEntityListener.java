package asztalos.model;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;

import asztalos.repository.UserRepository;
import asztalos.repository.WorkRepository;
import jakarta.persistence.PostPersist;
import jakarta.persistence.PostRemove;
import jakarta.persistence.PostUpdate;

public class WorkEntityListener {
  @Autowired private static UserRepository userRepo;
  @Autowired private static WorkRepository workRepo;

  @PostPersist @PostUpdate @PostRemove
  public void recomputeSold(Work w) {
    Long userId = w.getUser().getUserId();
    Double sum = workRepo.sumClientPaidByUserId(userId);
    User u = userRepo.findById(userId).orElseThrow();
    u.setSold(sum != null ? sum : 0d);
    if (w.getMeasureDate() == null) {
          w.setMeasureDate(new Date());
      }
    userRepo.save(u);
  }
}
