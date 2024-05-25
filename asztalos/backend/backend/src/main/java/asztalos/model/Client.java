package asztalos.model;

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
@Table(name = "client")
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long clientId;

   @ManyToOne
   @JoinColumn(name = "\"user\"")  // Az 'user' oszlop idézőjelek között
     private User user;


    @Column(nullable = false)
    private double clientSold;

    @Column(nullable = false)
    private String name;

    private String description;
    private String address;
    private String telephone;

 @JsonCreator
 public Client(@JsonProperty("clientID") Long clientId) {
     this.clientId = clientId;
 }
    
 public Client() {
    }

    // Getters és setters
    public Long getClientId() {
        return clientId;
    }

    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public double getClientSold() {
        return clientSold;
    }

    public void setClientSold(double clientSold) {
        this.clientSold = clientSold;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }
}
