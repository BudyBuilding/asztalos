package asztalos.dto;

// új DTO class a response‐hoz
public class CreatedItemDto {
    private Long itemId;
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

    // csak ID‐k a beágyazott objecteknél
    private IdOnly color;
    private IdOnly object;
    private IdOnly table;
    private IdOnly work;

    // ———————————— Getterek és setterek ————————————

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

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

    public IdOnly getColor() {
        return color;
    }

    public void setColor(IdOnly color) {
        this.color = color;
    }

    public IdOnly getObject() {
        return object;
    }

    public void setObject(IdOnly object) {
        this.object = object;
    }

    public IdOnly getTable() {
        return table;
    }

    public void setTable(IdOnly table) {
        this.table = table;
    }

    public IdOnly getWork() {
        return work;
    }

    public void setWork(IdOnly work) {
        this.work = work;
    }

    // ———————————— Belső IdOnly osztály ————————————
    public static class IdOnly {
        private Long id;

        public IdOnly(Long id) {
            this.id = id;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }
    }
}
