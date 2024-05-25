package asztalos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import asztalos.model.CreatedItem;

@Repository
public interface CreatedItemRepository extends JpaRepository<CreatedItem, Long> {
}
