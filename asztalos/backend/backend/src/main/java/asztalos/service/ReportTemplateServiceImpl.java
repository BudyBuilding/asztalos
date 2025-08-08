// service/ReportTemplateServiceImpl.java
package asztalos.service;

import asztalos.model.*;
import asztalos.repository.ReportTemplateRepository;
import asztalos.dto.CreateUpdateReportTemplateDto;
import asztalos.dto.RunReportRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.sql.ResultSetMetaData;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ReportTemplateServiceImpl implements ReportTemplateService {

    private final ReportTemplateRepository repository;
    private final NamedParameterJdbcTemplate jdbc;

    @Override
    public List<ReportTemplate> findAll() {
        return repository.findAll();
    }

    @Override
    public ReportTemplate findById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("ReportTemplate not found: " + id));
    }

    @Override
    public ReportTemplate create(CreateUpdateReportTemplateDto dto) {
        if (repository.existsByCode(dto.getCode())) {
            throw new IllegalArgumentException("Duplikált report code: " + dto.getCode());
        }
        ReportTemplate t = new ReportTemplate();
        applyDto(t, dto);
        return repository.save(t);
    }

    @Override
    public ReportTemplate update(UUID id, CreateUpdateReportTemplateDto dto) {
        ReportTemplate t = findById(id);
        // code nem változtatása esetén oké; ha változik, akkor ellenőrizd
        if (!Objects.equals(t.getCode(), dto.getCode()) && repository.existsByCode(dto.getCode())) {
            throw new IllegalArgumentException("Duplikált report code: " + dto.getCode());
        }
        applyDto(t, dto);
        return repository.save(t);
    }

    @Override
    public void delete(UUID id) {
        try {
            repository.deleteById(id);
        } catch (EmptyResultDataAccessException ignored) {}
    }

    private void applyDto(ReportTemplate t, CreateUpdateReportTemplateDto dto) {
        t.setCode(dto.getCode());
        t.setName(dto.getName());
        t.setDescription(dto.getDescription());
        t.setQueryType(dto.getQueryType() == null ? QueryType.SQL : dto.getQueryType());
        t.setQueryText(dto.getQueryText());
        t.setParameters(dto.getParameters() == null ? new ArrayList<>() : dto.getParameters());
        t.setTemplatesByFormat(dto.getTemplatesByFormat() == null ? new EnumMap<>(ReportFormat.class) : dto.getTemplatesByFormat());
    }

    @Override
    public RunResult run(UUID id, RunReportRequest req) {
        ReportTemplate t = findById(id);
        ReportFormat format = req.getFormat() == null ? ReportFormat.CSV : req.getFormat();

        // 1) paraméterek felkészítése (DATE_RANGE flattenelés)
        Map<String, Object> flatParams = flattenParams(t, req.getParams());

        // 2) lekérdezés
        if (t.getQueryType() != QueryType.SQL) {
            throw new UnsupportedOperationException("Jelenleg csak SQL queryType támogatott.");
        }

        List<Map<String, Object>> rows = jdbc.queryForList(t.getQueryText(),
                new MapSqlParameterSource(flatParams));

        // 3) formátum szerinti render
        switch (format) {
            case CSV -> {
                byte[] data = renderCsv(rows);
                String name = buildFileName(req.getFileName(), t.getCode(), "csv");
                return new RunResult(name, "text/csv; charset=UTF-8", data);
            }
            case XLSX -> {
                // TODO: exceljs/Apache POI helyett Java-ban Apache POI
                byte[] data = renderXlsxPlaceholder(rows);
                String name = buildFileName(req.getFileName(), t.getCode(), "xlsx");
                return new RunResult(name, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", data);
            }
            case PDF -> {
                // TODO: PDF render (pl. iText, OpenPDF, wkhtmltopdf/puppeteer)
                byte[] data = renderPdfPlaceholder(rows, t.getTemplatesByFormat().get(ReportFormat.PDF));
                String name = buildFileName(req.getFileName(), t.getCode(), "pdf");
                return new RunResult(name, "application/pdf", data);
            }
            default -> throw new IllegalArgumentException("Ismeretlen formátum: " + format);
        }
    }

    private Map<String, Object> flattenParams(ReportTemplate t, Map<String, Object> input) {
        Map<String, Object> out = new HashMap<>();
        if (input == null) return out;

        for (ParameterDefinition def : t.getParameters()) {
            Object v = input.get(def.getKey());
            if (def.getType() == ParameterType.DATE_RANGE) {
                // várjuk: {from: 'YYYY-MM-DD', to: 'YYYY-MM-DD'}
                if (v instanceof Map<?, ?> m) {
                    Object from = m.get("from");
                    Object to = m.get("to");
                    out.put(def.getKey() + "_from", parseDate(from));
                    out.put(def.getKey() + "_to", parseDate(to));
                }
            } else {
                out.put(def.getKey(), v);
            }
        }
        // ha a query :from és :to-t vár, használd a kulcsnevet ehhez illesztve
        // vagy a sablonban eleve :period_from, :period_to
        return out;
    }

    private LocalDate parseDate(Object o) {
        if (o == null) return null;
        if (o instanceof String s && !s.isBlank()) {
            return LocalDate.parse(s);
        }
        return null;
    }

    private String buildFileName(String requested, String code, String ext) {
        String base = (requested == null || requested.isBlank()) ? code : requested;
        return base + "." + ext;
    }

    private byte[] renderCsv(List<Map<String, Object>> rows) {
        StringBuilder sb = new StringBuilder();
        if (rows.isEmpty()) {
            // nincs sor, de írjunk header-t? itt üres CSV-t adunk vissza
            return sb.toString().getBytes(StandardCharsets.UTF_8);
        }
        // header
        Set<String> headers = rows.get(0).keySet();
        sb.append(csvLine(headers));

        // rows
        for (Map<String, Object> row : rows) {
            List<String> vals = new ArrayList<>();
            for (String h : headers) {
                Object val = row.get(h);
                vals.add(val == null ? "" : String.valueOf(val));
            }
            sb.append(csvLine(vals));
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String csvLine(Collection<String> cells) {
        StringBuilder line = new StringBuilder();
        boolean first = true;
        for (String c : cells) {
            if (!first) line.append(',');
            first = false;
            line.append(csvEscape(c));
        }
        line.append("\n");
        return line.toString();
    }

    private String csvEscape(String s) {
        if (s == null) return "";
        boolean needsQuote = s.contains(",") || s.contains("\"") || s.contains("\n") || s.contains("\r");
        String out = s.replace("\"", "\"\"");
        return needsQuote ? ("\"" + out + "\"") : out;
    }

    private byte[] renderXlsxPlaceholder(List<Map<String, Object>> rows) {
        // TODO: Apache POI-val felépíteni a tényleges Excel fájlt
        return ("XLSX export készül… Sorok száma: " + rows.size())
                .getBytes(StandardCharsets.UTF_8);
    }

    private byte[] renderPdfPlaceholder(List<Map<String, Object>> rows, String pdfTemplate) {
        // TODO: PDF motor (OpenPDF/iText/Thymeleaf->HTML->PDF) + template alkalmazása
        String text = "PDF export készül… Sorok száma: " + rows.size()
                + "\nSablon hossza: " + (pdfTemplate == null ? 0 : pdfTemplate.length());
        return text.getBytes(StandardCharsets.UTF_8);
    }
}
