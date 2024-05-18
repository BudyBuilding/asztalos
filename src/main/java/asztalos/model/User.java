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
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private String userID;

    private String name;
    private String username;
    private String address;
    private String telephone;
    private String email;
    private String password;
    @Column(name = "cutting_company")
    private String cuttingCompany;
    @ElementCollection
    @CollectionTable(name = "user_clients", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "client_id")
    private List<Long> clientIDs;
    @ElementCollection
    @CollectionTable(name = "user_works", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "work_id")
    private List<Long> workIDs;
    @ElementCollection
    @CollectionTable(name = "user_objects", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "object_id")
    private List<Long> objectIDs;
    @ElementCollection
    @CollectionTable(name = "user_scripts", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "script_id")
    private List<Long> scriptIDs;
    private double sold;
    private String settings;
    private String log;
    @ElementCollection
    @CollectionTable(name = "user_sold_log", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "sold_log_entry")
    private List<String> soldLog;

    // Konstruktor
    public User() {
    }

    // Getterek és setterek
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    //userID
    public String getUserID() {
        return userID;
    }

    public void setUserID(String userID) {
        this.userID = userID;
    }

    //name
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    //username
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    //address
    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    //telephone
    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    //email
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    //password
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    //cutting company
    public String getCuttingCompany() {
        return cuttingCompany;
    }

    public void setCuttingCompany(String cuttingCompany) {
        this.cuttingCompany = cuttingCompany;
    }

    //clientIDs
    public List<Long> getClientIDs() {
        return clientIDs;
    }

    public void setClientIDs(List<Long> clientIDs) {
        this.clientIDs = clientIDs;
    }

    //workIDs
    public List<Long> getWorkIDs() {
        return workIDs;
    }

    public void setWorkIDs(List<Long> workIDs) {
        this.workIDs = workIDs;
    }

    //objectIDs
    public List<Long> getObjectIDs() {
        return objectIDs;
    }

    public void setObjectIDs(List<Long> objectIDs) {
        this.objectIDs = objectIDs;
    }

    //scriptIDs
    public List<Long> getScriptIDs() {
        return scriptIDs;
    }

    public void setScriptIDs(List<Long> scriptIDs) {
        this.scriptIDs = scriptIDs;
    }

    //sold
    public double getSold() {
        return sold;
    }

    public void setSold(double sold) {
        this.sold = sold;
    }

    //settings
    public String getSettings() {
        return settings;
    }

    public void setSettings(String settings) {
        this.settings = settings;
    }

    //log
    public String getLog() {
        return log;
    }

    public void setLog(String log) {
        this.log = log;
    }

    //soldlog
    public List<String> getSoldLog() {
        return soldLog;
    }

    public void setSoldLog(List<String> soldLog) {
        this.soldLog = soldLog;
    }

}
