import javax.persistence.*;
import java.util.List;

@Entity
@Table(name = "clients")
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Az ügyfél neve
    private String name;

    // Az ügyfél címe
    private String address;

    // Az ügyfél telefonszáma
    private String telephone;
    
    // Az ügyfél azonosítója
    @Column(name = "client_id")
    private String clientID;

    // Az ügyfélhez kapcsolódó felhasználó azonosítója
    @Column(name = "user_id")
    private Long userID;

    // Az ügyfélhez kapcsolódó munkák azonosítói
    @ElementCollection
    @CollectionTable(name = "client_works", joinColumns = @JoinColumn(name = "client_id"))
    @Column(name = "work_id")
    private List<Long> workIDs;

    // Konstruktor
    public Client() {
    }

    // Getterek és setterek
    // Az ügyfél azonosítója
    public Long getId() {
        return id;
    }

    // Az ügyfél neve
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    // Az ügyfél címe
    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    // Az ügyfél telefonszáma
    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    // Az ügyfél azonosítója
    public String getClientID() {
        return clientID;
    }

    public void setClientID(String clientID) {
        this.clientID = clientID;
    }

    // Az ügyfélhez kapcsolódó felhasználó azonosítója
    public Long getUserID() {
        return userID;
    }

    public void setUserID(Long userID) {
        this.userID = userID;
    }

    // Az ügyfélhez kapcsolódó munkák azonosítói
    public List<Long> getWorkIDs() {
        return workIDs;
    }

    public void setWorkIDs(List<Long> workIDs) {
        this.workIDs = workIDs;
    }
}
