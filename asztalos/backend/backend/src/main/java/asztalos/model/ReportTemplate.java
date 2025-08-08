package asztalos.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Entity
@Table(name = "report_templates")
public class ReportTemplate {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, unique = true, length = 120)
    private String code; // pl. "rep-boards-by-color"

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    private QueryType queryType = QueryType.SQL;

    @Lob
    @Column(nullable = false)
    private String queryText; // pl. "SELECT ... WHERE date BETWEEN :from AND :to"

    @ElementCollection
    @CollectionTable(
        name = "report_parameters",
        joinColumns = @JoinColumn(name = "report_template_id")
    )
    private List<ParameterDefinition> parameters = new ArrayList<>();

    // formátum → template content (pl. CSV-nél nem kell, XLSX/PDF-nél lehet)
    @ElementCollection
    @CollectionTable(
        name = "report_templates_by_format",
        joinColumns = @JoinColumn(name = "report_template_id")
    )
    @MapKeyEnumerated(EnumType.STRING)
    @MapKeyColumn(name = "format_key")
    @Column(name = "template_content", columnDefinition = "TEXT")
    private Map<ReportFormat, String> templatesByFormat = new EnumMap<>(ReportFormat.class);

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}
