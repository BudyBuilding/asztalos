package asztalos.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "object")
public class WorkObject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long objectId;

    @ManyToOne
    @JoinColumn(name = "work")
    private Work work;

    @ManyToOne
   @JoinColumn(name = "\"user\"")
    private User user;

    @ManyToOne
    @JoinColumn(name = "client")
    private Client client;

    private String name;

    private String size;
    private String position;
    private String rotation;
    
    private String setting;

    @ManyToOne
    @JoinColumn(name = "used_script")
    private Script usedScript;

    @Column(name = "used_colors")
    private List<String> usedColors;

    // Getters és setters

    @JsonCreator
    public WorkObject(@JsonProperty("objectId") Long objectId) {
        this.objectId = objectId;
    }

    public WorkObject() {}
        

    public Long getObjectId() {
        return objectId;
    }

    public void setObjectId(Long objectId) {
        this.objectId = objectId;
    }

    public Work getWork() {
        return work;
    }

    public void setWork(Work work) {
        this.work = work;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Client getClient() {
        return client;
    }

    public void setClient(Client client) {
        this.client = client;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public String getRotation() {
        return rotation;
    }

    public void setRotation(String rotation) {
        this.rotation = rotation;
    }
    
    public String getSetting() {
        return setting;
    }

    public void setSetting(String setting) {
        this.setting = setting;
    }    

    public Script getUsedScript() {
        return usedScript;
    }

    public void setUsedScript(Script usedScript) {
        this.usedScript = usedScript;
    }

    public List<String> getUsedColors() {
        return usedColors;
    }

    public void setUsedColors(List<String> usedColors) {
        this.usedColors = usedColors;
    }
}

