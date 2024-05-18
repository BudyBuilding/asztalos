package asztalos.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "colors")
public class Color {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    
    private Long id;

    // A color azonosítója
    @Column(name = "color_id")
    private String colorID;

    // A szín neve
    private String name;

    // A szín típusa
    private String type;

    // A szín aktivitása
    private boolean active;

    // A szín mérete (hossz, szélesség, vastagság)
    private double length;
    private double width;
    private double thickness;

    // A szín elforgatása
    private double rotation;

    // A szín képének URL-je
    @Column(name = "img_url")
    private String imgUrl;

    // Konstruktor
    public Color() {
    }

    // Getterek és setterek
    // A color azonosítója
    public Long getId() {
        return id;
    }

    // A color azonosítója
    public String getColorID() {
        return colorID;
    }

    public void setColorID(String colorID) {
        this.colorID = colorID;
    }

    // A szín neve
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    // A szín típusa
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    // A szín aktivitása
    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    // A szín mérete (hossz, szélesség, vastagság)
    public double getLength() {
        return length;
    }

    public void setLength(double length) {
        this.length = length;
    }

    public double getWidth() {
        return width;
    }

    public void setWidth(double width) {
        this.width = width;
    }

    public double getThickness() {
        return thickness;
    }

    public void setThickness(double thickness) {
        this.thickness = thickness;
    }

    // A szín elforgatása
    public double getRotation() {
        return rotation;
    }

    public void setRotation(double rotation) {
        this.rotation = rotation;
    }

    // A szín képének URL-je
    public String getImgUrl() {
        return imgUrl;
    }

    public void setImgUrl(String imgUrl) {
        this.imgUrl = imgUrl;
    }
}
