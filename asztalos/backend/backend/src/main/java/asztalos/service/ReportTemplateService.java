// service/ReportTemplateService.java
package asztalos.service;

import asztalos.model.ReportTemplate;
import asztalos.dto.CreateUpdateReportTemplateDto;
import asztalos.dto.RunReportRequest;
import org.springframework.core.io.ByteArrayResource;

import java.util.List;
import java.util.UUID;

public interface ReportTemplateService {
    List<ReportTemplate> findAll();
    ReportTemplate findById(UUID id);
    ReportTemplate create(CreateUpdateReportTemplateDto dto);
    ReportTemplate update(UUID id, CreateUpdateReportTemplateDto dto);
    void delete(UUID id);

    // report futtatás
    RunResult run(UUID id, RunReportRequest request);

    class RunResult {
        public final String fileName;
        public final String contentType;
        public final ByteArrayResource resource;

        public RunResult(String fileName, String contentType, byte[] data) {
            this.fileName = fileName;
            this.contentType = contentType;
            this.resource = new ByteArrayResource(data);
        }
    }
}
