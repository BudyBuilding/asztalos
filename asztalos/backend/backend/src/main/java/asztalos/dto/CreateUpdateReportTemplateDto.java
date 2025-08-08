package asztalos.dto;

import asztalos.model.ParameterDefinition;
import asztalos.model.QueryType;
import asztalos.model.ReportFormat;
import lombok.*;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class CreateUpdateReportTemplateDto {
    private String code;
    private String name;
    private String description;
    private QueryType queryType;
    private String queryText;
    private List<ParameterDefinition> parameters;
    private Map<ReportFormat, String> templatesByFormat = new EnumMap<>(ReportFormat.class);
}