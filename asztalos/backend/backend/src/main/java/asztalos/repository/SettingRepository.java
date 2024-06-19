package asztalos.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import asztalos.model.Setting;

public interface SettingRepository extends JpaRepository<Setting, Long> {
    Optional<Setting> findByName(String name);
}