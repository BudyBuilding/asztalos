package asztalos.model;

import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "script_item")
// mondjuk, hogy hagyja ki a hibernateLazyInitializer és handler mezőket
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class ScriptItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long itemId;

    // ha nem kell benne a teljes Script objektum, akár erre is tehetsz JsonIgnore-t:
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "script_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "imageData" })
    private Script script;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ref_script_id")
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "imageData" })
    private Script refScript;

    @Column(name = "ref_settings", columnDefinition = "TEXT")
    private String refSettings;

    private String name;
    private String material;
    private String qty;
    private String size;
    private String position;
    private String rotation;
    private String kant;
    private Boolean rotable;

    private String details;

    public String getDetails() { 
        return details; 
    }
    
    public void setDetails(String details) { 
        this.details = details; 
    }

    // --- getters & setters ---
    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }

    public Script getScript() { return script; }
    public void setScript(Script script) { this.script = script; }

    public Script getRefScript() { return refScript; }
    public void setRefScript(Script refScript) {
        this.refScript = refScript;
        if (refScript == null) this.refSettings = null;
    }

    public String getRefSettings() { return refSettings; }
    public void setRefSettings(String refSettings) { this.refSettings = refSettings; }

    public String getKant() { return kant; }
    public void setKant(String kant) { this.kant = kant; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getMaterial() { return material; }
    public void setMaterial(String material) { this.material = material; }

    public String getQty() { return qty; }
    public void setQty(String qty) { this.qty = qty; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public String getRotation() { return rotation; }
    public void setRotation(String rotation) { this.rotation = rotation; }

    public Boolean getRotable() { return rotable; }
    public void setRotable(Boolean rotable) { this.rotable = rotable; }
}
