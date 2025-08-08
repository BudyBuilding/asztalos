package asztalos.model;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Embeddable
public class ParameterDefinition {
    private String key;
    @Enumerated(EnumType.STRING)
    private ParameterType type;
    private String label;
    // tároljuk szövegként — backend oldalon majd parse-olod (true/number/stb)
    private String defaultValue;

    // csak ENUM esetén van értelme
    @ElementCollection
    private List<EnumOption> options = new ArrayList<>();
}