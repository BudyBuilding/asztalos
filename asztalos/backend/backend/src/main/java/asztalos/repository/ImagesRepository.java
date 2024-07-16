package asztalos.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import asztalos.model.Images;


public interface ImagesRepository extends JpaRepository<Images, Long> {
    @Override
    List<Images> findAll();
	Images findByName(String name);
}