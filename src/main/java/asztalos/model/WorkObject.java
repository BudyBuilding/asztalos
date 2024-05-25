package asztalos.model;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
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
    @JoinColumn(name = "work"    )
    private Work work;

    @ManyToOne
   @JoinColumn(name = "\"user\"")
    private User user;

    @ManyToOne
    @JoinColumn(name = "client"    )
    private Client client;

    private String name;

    //@ManyToOne
    //@JoinColumn(name = "used_script", referencedColumnName = "script_id")
   // private Script usedScript;

    @ElementCollection
  //  @CollectionTable(name = "object_colors", joinColumns = @JoinColumn(name = "object_id"))
    @Column(name = "color")
    private List<String> usedColors;

    // Getters és setters
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
/* *
    public Script getUsedScript() {
        return usedScript;
    }

    public void setUsedScript(Script usedScript) {
        this.usedScript = usedScript;
    }
*/
    public List<String> getUsedColors() {
        return usedColors;
    }

    public void setUsedColors(List<String> usedColors) {
        this.usedColors = usedColors;
    }
}

