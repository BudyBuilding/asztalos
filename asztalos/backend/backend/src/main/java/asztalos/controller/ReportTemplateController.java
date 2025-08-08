package asztalos.controller;

import asztalos.model.ReportTemplate;
import asztalos.service.ReportTemplateService;
import asztalos.dto.CreateUpdateReportTemplateDto;
import asztalos.dto.RunReportRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/report-templates")
@RequiredArgsConstructor
public class ReportTemplateController {

    private final ReportTemplateService service;

    @GetMapping
    public List<ReportTemplate> list() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ReportTemplate get(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    public ReportTemplate create(@RequestBody CreateUpdateReportTemplateDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public ReportTemplate update(@PathVariable UUID id, @RequestBody CreateUpdateReportTemplateDto dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }

    @PostMapping("/{id}/run")
    public ResponseEntity<ByteArrayResource> run(@PathVariable UUID id, @RequestBody RunReportRequest req) {
        ReportTemplateService.RunResult result = service.run(id, req);

        ContentDisposition cd = ContentDisposition.attachment()
                .filename(result.fileName)
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentDisposition(cd);
        headers.setContentType(MediaType.parseMediaType(result.contentType));

        return new ResponseEntity<>(result.resource, headers, HttpStatus.OK);
    }
}
