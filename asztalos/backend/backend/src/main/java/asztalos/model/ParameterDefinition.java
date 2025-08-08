// model/ParameterDefinition.java
package asztalos.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Embeddable
public class ParameterDefinition {

    private String key;

    @Enumerated(EnumType.STRING)
    private ParameterType type;

    private String label;

    private String defaultValue;

    // NEM @ElementCollection! JSON-ként tároljuk:
    @Lob
    @Convert(converter = EnumOptionListJsonConverter.class)
    @Column(name = "options_json", columnDefinition = "TEXT")
    private List<EnumOption> options;
}
