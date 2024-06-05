package asztalos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import asztalos.model.ScriptItem;

@Repository
public interface ScriptItemRepository extends JpaRepository<ScriptItem, Long> {
    public List<ScriptItem> findByScriptScriptId(Long scriptId);
}
