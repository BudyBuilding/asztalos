package asztalos.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "color")
public class Color {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long colorId;

    private String name;

    private String materialType;

    private Boolean active;

    private String dimension;
    private String splitDimension;

    private Boolean rotable;

    private String imageId; // changed imgUrl to imageId

    private Double price; // new price field

    @Column(name = "group_name")
    private String groupName;

    @Column(name = "image_data", columnDefinition = "bytea")
    private byte[] imageData;

    @Column(name = "image_data_reduced", columnDefinition = "bytea")
    private byte[] imageDataReduced;

    private String imageContentType;

    public byte[] getImageData() {
        return imageData;
    }

    public void setImageData(byte[] imageData) {
        this.imageData = imageData;
    }       

    public byte[] getImageDataReduced() {
        return imageDataReduced;
    }

    public void setImageDataReduced(byte[] imageDataReduced) {
        this.imageDataReduced = imageDataReduced;
    }  

    public String getImageContentType() {
        return imageContentType;
    }
                       
    public void setImageContentType(String imageContentType) {
        this.imageContentType = imageContentType;
    }

    // Getters and setters
    @JsonCreator
    public Color(@JsonProperty("colorId") Long colorId) {
        this.colorId = colorId;
    }
        
    public Color() {
    }


    public Long getColorId() {
        return colorId;
    }

    public void setColorId(Long colorId) {
        this.colorId = colorId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMaterialType() {
        return materialType;
    }

    public void setMaterialType(String materialType) {
        this.materialType = materialType;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public String getDimension() {
        return dimension;
    }

    public void setDimension(String dimension) {
        this.dimension = dimension;
    }

    public String getSplitDimension() {
        return splitDimension;
    }

    public void setSplitDimension(String splitDimension) {
        this.splitDimension = splitDimension;
    }

    public Boolean getRotable() {
        return rotable;
    }

    public void setRotable(Boolean rotable) {
        this.rotable = rotable;
    }

    public String getImageId() {
        return imageId;
    }

    public void setImageId(String imageId) {
        this.imageId = imageId;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }
}
