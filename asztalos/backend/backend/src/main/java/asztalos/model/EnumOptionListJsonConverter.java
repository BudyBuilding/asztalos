// model/EnumOptionListJsonConverter.java
package asztalos.model;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Collections;
import java.util.List;

@Converter
public class EnumOptionListJsonConverter implements AttributeConverter<List<EnumOption>, String> {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final TypeReference<List<EnumOption>> TYPE = new TypeReference<>() {};

    @Override
    public String convertToDatabaseColumn(List<EnumOption> attribute) {
        try {
            return attribute == null ? "[]" : MAPPER.writeValueAsString(attribute);
        } catch (Exception e) {
            throw new IllegalStateException("EnumOption list serialize error", e);
        }
    }

    @Override
    public List<EnumOption> convertToEntityAttribute(String dbData) {
        try {
            if (dbData == null || dbData.isBlank()) return Collections.emptyList();
            return MAPPER.readValue(dbData, TYPE);
        } catch (Exception e) {
            throw new IllegalStateException("EnumOption list parse error", e);
        }
    }
}
