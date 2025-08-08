package asztalos.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import asztalos.model.ReportTemplate;

import java.util.Optional;
import java.util.UUID;

public interface ReportTemplateRepository extends JpaRepository<ReportTemplate, UUID> {
    Optional<ReportTemplate> findByCode(String code);
    boolean existsByCode(String code);
}