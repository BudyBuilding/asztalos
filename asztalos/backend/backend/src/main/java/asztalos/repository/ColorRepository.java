package asztalos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import asztalos.model.Color;

@Repository
public interface ColorRepository extends JpaRepository<Color, Long> {
}
