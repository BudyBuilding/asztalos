package asztalos.service;

import asztalos.dto.ReportTemplateDetailDto;
import asztalos.dto.ReportTemplateListDto;

import java.util.List;
import java.util.UUID;

public interface ReportTemplateQueryService {
    List<ReportTemplateListDto> list();
    ReportTemplateDetailDto get(UUID id);
}
