import javax.persistence.*;
import java.util.List;

@Entity
@Table(name = "scripts")
public class Script {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // A script azonosítója
    @Column(name = "script_id")
    private String scriptID;

    // A felhasználó azonosítója, akihez a script tartozik
    @Column(name = "user_id")
    private Long userID;

    // A script neve
    private String name;

    // A scripthez kapcsolódó kép URL-je
    @Column(name = "img_url")
    private String imgUrl;

    // A script elemek listája
    @ElementCollection
    @CollectionTable(name = "script_items", joinColumns = @JoinColumn(name = "script_id"))
    @Column(name = "item")
    private List<String> items;

    // A script beállításainak listája
    @ElementCollection
    @CollectionTable(name = "script_settings", joinColumns = @JoinColumn(name = "script_id"))
    @Column(name = "setting")
    private List<String> settings;

    // Konstruktor
    public Script() {
    }

    // Getterek és setterek
    // A script azonosítója
    public Long getId() {
        return id;
    }

    // A felhasználó azonosítója, akihez a script tartozik
    public Long getUserID() {
        return userID;
    }

    public void setUserID(Long userID) {
        this.userID = userID;
    }

    // A script neve
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    // A script azonosítója
    public String getScriptID() {
        return scriptID;
    }

    public void setScriptID(String scriptID) {
        this.scriptID = scriptID;
    }

    // A scripthez kapcsolódó kép URL-je
    public String getImgUrl() {
        return imgUrl;
    }

    public void setImgUrl(String imgUrl) {
        this.imgUrl = imgUrl;
    }

    // A script elemek listája
    public List<String> getItems() {
        return items;
    }

    public void setItems(List<String> items) {
        this.items = items;
    }

    // A script beállításainak listája
    public List<String> getSettings() {
        return settings;
    }

    public void setSettings(List<String> settings) {
        this.settings = settings;
    }
}
