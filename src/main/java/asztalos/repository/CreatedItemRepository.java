package asztalos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import asztalos.model.CreatedItem;
import asztalos.model.Work;
import asztalos.model.WorkObject;

@Repository
public interface CreatedItemRepository extends JpaRepository<CreatedItem, Long> {
    public List<CreatedItem> findByObject(WorkObject object);
    public List<CreatedItem> findByWork(Work work);
}
