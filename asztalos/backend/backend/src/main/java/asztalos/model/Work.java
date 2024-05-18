package asztalos.model;

import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "works")
public class Work {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // A munka azonosítója
    @Column(name = "work_id")
    private String workID;

    // A munkát végző felhasználó azonosítója
    @Column(name = "user_id")
    private Long userID;

    // A munka neve
    private String name;

    // Az ügyfél azonosítója, akinek a munkát elvégzik
    @Column(name = "client_id")
    private Long clientID;

    // A munkához kapcsolódó objektumok azonosítói
    @ElementCollection
    @CollectionTable(name = "work_objects", joinColumns = @JoinColumn(name = "work_id"))
    @Column(name = "object_id")
    private List<Long> objectIDs;

    // A munka ára
    private double price;

    // Fizetett összeg és dátum
    @ElementCollection
    @CollectionTable(name = "work_payments", joinColumns = @JoinColumn(name = "work_id"))
    @Column(name = "payment_info")
    private List<String> paid;

    // Konstruktor
    public Work() {
    }

    // Getterek és setterek
    // A munka azonosítója
    public Long getId() {
        return id;
    }

    // A munkát végző felhasználó azonosítója
    public Long getUserID() {
        return userID;
    }

    public void setUserID(Long userID) {
        this.userID = userID;
    }

    // A munka neve
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    // Az ügyfél azonosítója, akinek a munkát elvégzik
    public Long getClientID() {
        return clientID;
    }

    public void setClientID(Long clientID) {
        this.clientID = clientID;
    }

    // A munkához kapcsolódó objektumok azonosítói
    public List<Long> getObjectIDs() {
        return objectIDs;
    }

    public void setObjectIDs(List<Long> objectIDs) {
        this.objectIDs = objectIDs;
    }

    // A munka ára
    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    // Fizetett összeg és dátum
    public List<String> getPaid() {
        return paid;
    }

    public void setPaid(List<String> paid) {
        this.paid = paid;
    }

    // A munka azonosítója
    public String getWorkID() {
        return workID;
    }

    public void setWorkID(String workID) {
        this.workID = workID;
    }
}
