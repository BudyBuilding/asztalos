package asztalos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import asztalos.model.User;
import asztalos.model.Work;
import asztalos.model.WorkObject;

public interface ObjectRepository extends JpaRepository<WorkObject, Long> {

    public List<WorkObject> findByUser(User user);
    public List<WorkObject> findByWork(Work work);
}
