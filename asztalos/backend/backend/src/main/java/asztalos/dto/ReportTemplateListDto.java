package asztalos.dto;

import java.util.UUID;

public record ReportTemplateListDto(
    UUID id,
    String code,
    String name,
    String description
) {}
