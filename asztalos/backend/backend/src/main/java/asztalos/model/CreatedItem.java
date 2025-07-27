package asztalos.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "created_item")
public class CreatedItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long itemId;

    private String name;

    private String material;

    private Integer qty;

    private String size;

    private String position;

  @Column(name = "group_id")
private String groupId;

public String getGroupId() {
    return groupId;
}

public void setGroupId(String groupId) {
    this.groupId = groupId;
}

    private String rotation;
    private String details;

    @ManyToOne
    @JoinColumn(name = "color")
    private Color color;

    @ManyToOne(cascade = { CascadeType.MERGE })   // or PERSIST, or ALL
    @JoinColumn(name = "createdTables")
    private CreatedTables CreatedTables;

    public CreatedTables gettable() {
        return CreatedTables;
    }

    private String kant;
    public void setTable(CreatedTables table) {
        this.CreatedTables = table;
    }
  
@Override
public String toString() {
    return "CreatedItem{" +
           "name='" + name + '\'' +
           ", object=" + (object != null ? object.getObjectId() : "null") +
           ", work=" + (work != null ? work.getWorkId() : "null") +
           ", qty=" + qty +
           '}';
}
    @Column(name = "table_rotation", columnDefinition = "TEXT")
    private String tableRotation;
    
    @Column(name = "table_position", columnDefinition = "TEXT")
    private String tablePosition;

    public String getKant() { 
        return kant; 
    }
    
    public void setKant(String kant) { 
        this.kant = kant; 
    }

    public String getDetails() { 
        return details; 
    }
    
    public void setDetails(String details) { 
        this.details = details; 
    }
    
    public String getTablePosition() {
        return tablePosition;
    }

    public void setTablePosition(String tablePosition) {
        this.tablePosition = tablePosition;
    }

    public String getTableRotation() {
        return tableRotation;
    }

    public void setTableRotation(String tableRotation) {
        this.tableRotation = tableRotation;
    }

    private Boolean rotable;

    @ManyToOne
    @JoinColumn(name = "object")
    private WorkObject object;

    @ManyToOne
    @JoinColumn(name = "work")
    private Work work;

    // Getters and setters

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMaterial() {
        return material;
    }

    public void setMaterial(String material) {
        this.material = material;
    }

    public Integer getQty() {
        return qty;
    }

    public void setQty(Integer qty) {
        this.qty = qty;
    }

    public String getSize() {
        return this.size;
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

    public Color getColor() {
        return color;
    }

    public void setColor(Color color) {
        this.color = color;
    }

    public Boolean isRotable() {
        return rotable;
    }

    public void setRotable(Boolean rotable) {
        this.rotable = rotable;
    }

    public WorkObject getObject() {
        return object;
    }

    public void setObject(WorkObject object) {
        this.object = object;
    }

        public Work getWork() {
        return work;
    }

    public void setWork(Work work) {
        this.work = work;
    }
}
