// service/ReportTemplateServiceImpl.java
package asztalos.service;

import asztalos.model.*;
import asztalos.repository.ReportTemplateRepository;
import asztalos.dto.CreateUpdateReportTemplateDto;
import asztalos.dto.ReportTemplateDetailDto;
import asztalos.dto.ReportTemplateListDto;
import asztalos.dto.RunReportRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.sql.ResultSetMetaData;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ReportTemplateQueryServiceImpl implements ReportTemplateQueryService {

    private final ReportTemplateRepository repo;

    @Transactional(readOnly = true)
    @Override
    public List<ReportTemplateListDto> list() {
        return repo.findAll().stream()
                .map(t -> new ReportTemplateListDto(
                        t.getId(), t.getCode(), t.getName(), t.getDescription()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public ReportTemplateDetailDto get(UUID id) {
        ReportTemplate t = repo.findById(id).orElseThrow();
        return new ReportTemplateDetailDto(
                t.getId(),
                t.getCode(),
                t.getName(),
                t.getDescription(),
                t.getQueryType() != null ? t.getQueryType().name() : null,
                t.getQueryText(),
                t.getParameters(),
                t.getTemplatesByFormat()
        );
    }
}