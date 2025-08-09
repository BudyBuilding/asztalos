package asztalos.controller;

import asztalos.dto.CreateUpdateReportTemplateDto; // ha van
import asztalos.dto.ReportTemplateDetailDto;
import asztalos.dto.ReportTemplateListDto;
import asztalos.service.ReportTemplateQueryService;
import asztalos.service.ReportTemplateService; // a már meglévő create/update/delete szolgáltatásod
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/report-templates")
@RequiredArgsConstructor
public class ReportTemplateController {

    private final ReportTemplateService commandService;      // már meglevő (create/update/delete)
    private final ReportTemplateQueryService queryService;   // ÚJ (list/detail DTO)

    @GetMapping
    public List<ReportTemplateListDto> list() {
        return queryService.list();
    }

    @GetMapping("/{id}")
    public ReportTemplateDetailDto get(@PathVariable UUID id) {
        return queryService.get(id);
    }

    @PostMapping
    public Object create(@RequestBody CreateUpdateReportTemplateDto dto) {
        return commandService.create(dto); // maradhat, ahogy eddig volt
    }

    @PutMapping("/{id}")
    public Object update(@PathVariable UUID id, @RequestBody CreateUpdateReportTemplateDto dto) {
        return commandService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        commandService.delete(id);
    }
}
