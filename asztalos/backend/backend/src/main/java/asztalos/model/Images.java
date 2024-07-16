package asztalos.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
public class Images {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long imageId;
	
	private String name;
	
	private String type;
	
	private String path;
	
	@Lob
	private byte[] imageData;

	 // Getters and setters
    public Long getId() {
        return imageId;
    }

    public void setId(Long imageId) {
        this.imageId = imageId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public byte[] getImageData() {
        return imageData;
    }

    public void setimageData(byte[] imageData) {
        this.imageData = imageData;
    }

}