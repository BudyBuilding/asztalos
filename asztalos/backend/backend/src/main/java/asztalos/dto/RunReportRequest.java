package asztalos.dto;

import lombok.*;

import java.util.Map;

import asztalos.model.ReportFormat;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class RunReportRequest {
    private ReportFormat format;              // CSV, XLSX, PDF
    private Map<String, Object> params;       // { "period": { "from": "...", "to": "..." }, "status": "open", ... }
    private String fileName;                  // opcionális custom fájlnév (kiterjesztés nélkül)
}