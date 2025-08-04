package asztalos.model;

import java.util.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

@Entity
@Table(name = "createdTables")
public class CreatedTables {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "work_id", nullable = false)
    private Work work;

    private Double price;
    
    private String size;
    private String kantLength;
    private String cutLength;
    private String usedTables;
    private String tableUsage;
    private Number partCount;
    private Number measureCount;  
  @Temporal(TemporalType.TIMESTAMP)
    private Date lastUpdateDate;                

    @ManyToOne
    @JoinColumn(name = "color_id", nullable = false)
    private Color color;

@PrePersist
    protected void onCreate() {
        lastUpdateDate = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        lastUpdateDate = new Date();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Work getWork() {
        return work;
    }

    public void setWork(Work work) {
        this.work = work;
    }

    public Color getColor() {
        return color;
    }

    public void setColor(Color color) {
        this.color = color;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }


    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

        public Date getLastUpdateDate() {
        return lastUpdateDate;
    }

    public void setLastUpdateDate(Date lastUpdateDate) {
        this.lastUpdateDate = lastUpdateDate;
    }

        public String getKantLength() {
        return kantLength;
    }

    public void setKantLength(String kantLength) {
        this.kantLength = kantLength;
    }

    public String getCutLength() {
        return cutLength;
    }

    public void setCutLength(String cutLength) {
        this.cutLength = cutLength;
    }

    public String getUsedTables() {
        return usedTables;
    }

    public void setUsedTables(String usedTables) {
        this.usedTables = usedTables;
    }

    public String getTableUsage() {
        return tableUsage;
    }

    public void setTableUsage(String tableUsage) {
        this.tableUsage = tableUsage;
    }

    public Number getPartCount() {
        return partCount;
    }

    public void setPartCount(Number partCount) {
        this.partCount = partCount;
    }
    public Number getMeasureCount() {
        return measureCount;
    }

    public void setMeasureCount(Number measureCount) {
        this.measureCount = measureCount;
    }

}
