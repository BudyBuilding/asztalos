package asztalos.dto;

public class ScriptItemDto {
    private Long itemId;
    private String name;
    private String material;
    private String qty;
    private String size;
    private String position;
    private String rotation;
    private String kant;
    private String details;
    private Boolean rotable;
    private Long refScript;
    private String refSettings; 

    private Long scriptId;
    private String scriptName;

    // Constructors
    public ScriptItemDto() {}
    /* 
    public ScriptItemDto(
        Long itemId,        // si.itemId
        String name,        // si.name
        String material,    // si.material
        String qty,         // si.qty
        String size,        // si.size
        String position,    // si.position
        String rotation,    // si.rotation
        String kant,        // si.kant
        Boolean rotable,    // si.rotable
        Long refScript,     // si.refScript
        String refSettings, // si.refSettings
        Long scriptId,      // si.script.scriptId
        String scriptName,  // si.script.name
        String details      // si.details
    )
*/

    public ScriptItemDto(
        Long itemId,
        String name,
        String material,
        String qty,
        String size,
        String position,
        String rotation,
        String kant,
        Boolean rotable,
        Long refScript,
        String refSettings,
        Long scriptId,
        String scriptName
    ) {
        this.itemId     = itemId;
        this.name       = name;
        this.material   = material;
        this.qty        = qty;
        this.size       = size;
        this.position   = position;
        this.rotation   = rotation;
        this.kant       = kant;
        this.rotable    = rotable;
        this.refScript  = refScript;
        this.refSettings= refSettings;
        this.scriptId   = scriptId;
        this.scriptName = scriptName;
    }
    
    public ScriptItemDto(
        Long itemId, String name, String material, String qty, String size,
        String position, String rotation, String kant, Boolean rotable,
        Long refScript, String refSettings, Long scriptId, String scriptName, String details
    ) {
        this.itemId = itemId;
        this.name = name;
        this.material = material;
        this.qty = qty;
        this.size = size;
        this.position = position;
        this.rotation = rotation;
        this.kant = kant;
        this.rotable = rotable;
        this.refScript = refScript;
        this.refSettings = refSettings;
        this.scriptId = scriptId;
        this.scriptName = scriptName;
        this.details = details;
    }

    // Getters and setters
    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }

    public Long getRefScript() { return refScript; }
    public void setRefScript(Long refScript) { this.refScript = refScript; }  

    public String getRefSettings() { return refSettings; }
    public void setRefSettings(String refSettings) { this.refSettings = refSettings; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getMaterial() { return material; }
    public void setMaterial(String material) { this.material = material; }

    public String getQty() { return qty; }
    public void setQty(String qty) { this.qty = qty; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public String getRotation() { return rotation; }
    public void setRotation(String rotation) { this.rotation = rotation; }

    public String getKant() { return kant; }
    public void setKant(String kant) { this.kant = kant; }

    public Boolean getRotable() { return rotable; }
    public void setRotable(Boolean rotable) { this.rotable = rotable; }

    public Long getScriptId() { return scriptId; }
    public void setScriptId(Long scriptId) { this.scriptId = scriptId; }

    public String getScriptName() { return scriptName; }
    public void setScriptName(String scriptName) { this.scriptName = scriptName; }
}
