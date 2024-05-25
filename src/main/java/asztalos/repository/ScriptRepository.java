package asztalos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import asztalos.model.Script;

@Repository
public interface ScriptRepository extends JpaRepository<Script, Long> {
}
