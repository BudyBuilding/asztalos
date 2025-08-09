package asztalos.dto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import asztalos.model.ParameterDefinition;
import asztalos.model.ReportFormat;

public record ReportTemplateDetailDto(
    UUID id,
    String code,
    String name,
    String description,
    String queryType,
    String queryText,
    List<ParameterDefinition> parameters,
    Map<ReportFormat, String> templatesByFormat
) {}
