import javax.persistence.*;

@Entity
@Table(name = "objects")
public class Object {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Az objektum azonosítója
    @Column(name = "object_id")
    private String objectID;

    // A felhasználó azonosítója, akihez az objektum tartozik
    @Column(name = "user_id")
    private Long userID;

    // Az objektum neve
    private String name;

    // A munka azonosítója, amelyhez az objektum tartozik
    @Column(name = "work_id")
    private String workID;

    // Az objektum létrehozásának dátuma
    private String date;

    // Az objektum képének URL-je
    @Column(name = "img_url")
    private String imgUrl;

    // Az objektumhoz kapcsolódó szkript azonosítója
    @Column(name = "script_id")
    private Long scriptID;

    // Konstruktor
    public WorkObject() {
    }

    // Getterek és setterek
    // Az objektum azonosítója
    public Long getId() {
        return id;
    }

    // A felhasználó azonosítója, akihez az objektum tartozik
    public Long getUserID() {
        return userID;
    }

    public void setUserID(Long userID) {
        this.userID = userID;
    }

    // Az objektum neve
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    // A munka azonosítója, amelyhez az objektum tartozik
    public String getWorkID() {
        return workID;
    }

    public void setWorkID(String workID) {
        this.workID = workID;
    }

    // Az objektum létrehozásának dátuma
    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    // Az objektum azonosítója
    public String getObjectID() {
        return objectID;
    }

    public void setObjectID(String objectID) {
        this.objectID = objectID;
    }

    // Az objektum képének URL-je
    public String getImgUrl() {
        return imgUrl;
    }

    public void setImgUrl(String imgUrl) {
        this.imgUrl = imgUrl;
    }

    // Az objektumhoz kapcsolódó szkript azonosítója
    public Long getScriptID() {
        return scriptID;
    }

    public void setScriptID(Long scriptID) {
        this.scriptID = scriptID;
    }
}
