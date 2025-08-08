package asztalos.model;

import jakarta.persistence.Embeddable;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Embeddable
public class EnumOption {
    private String id;
    private String label;
}