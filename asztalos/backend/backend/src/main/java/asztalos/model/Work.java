package asztalos.model;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
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
@Table(name = "work")
public class Work {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long workId;

    @ManyToOne
    @JoinColumn(name = "\"user\"")
    private User user;

    @ManyToOne
    @JoinColumn(name = "client")
    private Client client;
    private String name;
    private String status;
  

    private Double clientPrice = 0d;
    private Double clientPaid  = 0d;
    private Double label       = 0d;
    private Double woodPrice   = 0d;

    // Logikai mező false-ként induljon
    private Boolean isOrdered;

    // Céges oldalon kalkulálandó mezők is 0-dal indulnak
    private Double companyWoodPrice = 0d;
    private Double companyPrice     = 0d;
    private Double companyLabel     = 0d;
    private Double userPaid         = 0d;

    private String kantLength;
    private String cutLength;
    private String usedTables;
    private String tableUsage;
    private Number partCount;
    private Number measureCount;  

  @Temporal(TemporalType.TIMESTAMP)
    private Date lastUpdateDate ;
    private Date measureDate;
    private Date orderDate;
    private Date finishDate;
    private Date companyFinishDate;
    private Date cancelDate;
    private Date scheduleDate;
    private String companyStatus;
    private String room;

@PrePersist
    protected void onCreate() {
        lastUpdateDate = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        lastUpdateDate = new Date();
    }

    public Boolean getIsOrdered() {
        return isOrdered;
    }

    public void setIsOrdered(Boolean isOrdered) {
        this.isOrdered = isOrdered;
    }

    public Double getCompanyWoodPrice() {
        return companyWoodPrice;
    }

    public void setCompanyWoodPrice(Double companyWoodPrice) {
        this.companyWoodPrice = companyWoodPrice;
    }    
    
    public Double getCompanyPrice() {
        return companyPrice;
    }

    public void setCompanyPrice(Double companyPrice) {
        this.companyPrice = companyPrice;
    }   
    
    public Double getCompanyLabel() {
        return companyLabel;
    }

    public void setCompanyLabel(Double companyLabel) {
        this.companyLabel = companyLabel;
    }    
    public Double getUserPaid() {
        return userPaid;
    }

    public void setUserPaid(Double userPaid) {
        this.userPaid = userPaid;
    }

    public String getCompanyStatus() {
        return companyStatus;
    }

    public void setCompanyStatus(String companyStatus) {
        this.companyStatus = companyStatus;
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

    // Getters és setters
    @JsonCreator
    public Work(@JsonProperty("workId") Long workId) {
        this.workId = workId;
    }
     
    public Work(){}

    public Long getWorkId() {
        return workId;
    }

    public void setWorkId(Long workId) {
        this.workId = workId;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRoom() {
        return room;
    }

    public void setRoom(String room) {
        this.room = room;
    }

    public Double getClientPrice() {
        return clientPrice;
    }

    public void setClientPrice(Double clientPrice) {
        this.clientPrice = clientPrice;
    }

    public Double getLabel() {
        return label;
    }

    public void setLabel(Double label) {
        this.label = label;
    }

    public Double getWoodPrice() {
        return woodPrice;
    }

    public void setWoodPrice(Double woodPrice) {
        this.woodPrice = woodPrice;
    }

    public Double getClientPaid() {
        return clientPaid;
    }

    public void setClientPaid(Double clientPaid) {
        this.clientPaid = clientPaid;
    }

    public Date getLastUpdateDate() {
        return lastUpdateDate;
    }

    public void setLastUpdateDate(Date lastUpdateDate) {
        this.lastUpdateDate = lastUpdateDate;
    }

    public Date getMeasureDate() {
        return measureDate;
    }

    public void setMeasureDate(Date measureDate) {
        this.measureDate = measureDate;
    }

    public Date getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(Date orderDate) {
        this.orderDate = orderDate;
    }

    public Date getFinishDate() {
        return finishDate;
    }

    public void setFinishDate(Date finishDate) {
        this.finishDate = finishDate;
    }

    public Date getCompanyFinishDate() {
        return companyFinishDate;
    }

    public void setCompanyFinishDate(Date companyFinishDate) {
        this.companyFinishDate = companyFinishDate;
    }
    public Date getCancelDate() {
        return cancelDate;
    }

    public void setCancelDate(Date cancelDate) {
        this.cancelDate = cancelDate;
    }

    public Date getScheduleDate() {
        return scheduleDate;
    }

    public void setScheduleDate(Date scheduleDate) {
        this.scheduleDate = scheduleDate;
    }
}

