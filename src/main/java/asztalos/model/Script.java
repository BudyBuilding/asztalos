package asztalos.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "script")
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Script {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long scriptId;

    private String name;

    @ManyToOne
    @JoinColumn(name = "\"user\"")
    private User user;

    private String imgUrl;
    private String room;

    @Column(length = 1000)
    private String setting;

    @Column(name = "image_data", columnDefinition = "bytea")
    private byte[] imageData;

    private String imageContentType;

    public byte[] getImageData() {
        return imageData;
    }

    public void setImageData(byte[] imageData) {
        this.imageData = imageData;
    }       

    public String getImageContentType() {
        return imageContentType;
    }
                       
    public void setImageContentType(String imageContentType) {
        this.imageContentType = imageContentType;
    }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    @JsonCreator
    public Script(@JsonProperty("scriptId") Long scriptId) {
        this.scriptId = scriptId;
    }
}
