package asztalos.dto;

public class CreatedItemUpdateRequestDto {
    // a frissíthető mezők
    private String name;
    private String details;
    private String material;
    private String kant;
    private Integer qty;
    private Boolean rotable;
    private String size;
    private String position;
    private String rotation;
    private String tablePosition;
    private String tableRotation;

    // csak az ID‑k a kapcsolódó entitásokhoz
    private Long colorId;
    private Long objectId;
    private Long workId;
    private Long tableId;

    // ——————— Getterek és setterek ———————

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public String getDetails() {
        return details;
    }
    public void setDetails(String details) {
        this.details = details;
    }

    public String getMaterial() {
        return material;
    }
    public void setMaterial(String material) {
        this.material = material;
    }

    public String getKant() {
        return kant;
    }
    public void setKant(String kant) {
        this.kant = kant;
    }

    public Integer getQty() {
        return qty;
    }
    public void setQty(Integer qty) {
        this.qty = qty;
    }

    public Boolean getRotable() {
        return rotable;
    }
    public void setRotable(Boolean rotable) {
        this.rotable = rotable;
    }

    public String getSize() {
        return size;
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

    public Long getColorId() {
        return colorId;
    }
    public void setColorId(Long colorId) {
        this.colorId = colorId;
    }

    public Long getObjectId() {
        return objectId;
    }
    public void setObjectId(Long objectId) {
        this.objectId = objectId;
    }

    public Long getWorkId() {
        return workId;
    }
    public void setWorkId(Long workId) {
        this.workId = workId;
    }

    public Long getTableId() {
        return tableId;
    }
    public void setTableId(Long tableId) {
        this.tableId = tableId;
    }
}
