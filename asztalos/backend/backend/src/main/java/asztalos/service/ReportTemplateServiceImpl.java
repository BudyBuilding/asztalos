// src/main/java/asztalos/service/ReportTemplateServiceImpl.java
package asztalos.service;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import asztalos.dto.CreateUpdateReportTemplateDto;
import asztalos.dto.RunReportRequest;
import asztalos.model.ReportTemplate;
import asztalos.repository.ReportTemplateRepository;

@Service 
@RequiredArgsConstructor
public class ReportTemplateServiceImpl implements ReportTemplateService {

    // pl. repository injection
    private final ReportTemplateRepository repo;

    @Override
    @Transactional(readOnly = true)
    public List<ReportTemplate> findAll() {
        return repo.findAll();
    }

    @Override
    public ReportTemplate findById(UUID id) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'findById'");
    }

    @Override
    public ReportTemplate create(CreateUpdateReportTemplateDto dto) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'create'");
    }

    @Override
    public ReportTemplate update(UUID id, CreateUpdateReportTemplateDto dto) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'update'");
    }

    @Override
    public void delete(UUID id) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'delete'");
    }

    @Override
    public RunResult run(UUID id, RunReportRequest request) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'run'");
    }

}
