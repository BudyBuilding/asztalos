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
    private ColorOnly color;
    private ObjectOnly object;
    private TableOnly table;
    private WorkOnly work;

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

    public ColorOnly getColor() {
        return color;
    }

    public void setColor(ColorOnly color) {
        this.color = color;
    }

    public ObjectOnly getObject() {
        return object;
    }

    public void setObject(ObjectOnly object) {
        this.object = object;
    }

    public TableOnly getTable() {
        return table;
    }

    public void setTable(TableOnly table) {
        this.table = table;
    }

    public WorkOnly getWork() {
        return work;
    }

    public void setWork(WorkOnly work) {
        this.work = work;
    }

    public static class ColorOnly {
        private Long colorId;
        public ColorOnly(Long colorId) { this.colorId = colorId; }
        public Long getColorId() { return colorId; }
        public void setColorId(Long colorId) { this.colorId = colorId; }
    }
    public static class ObjectOnly {
        private Long objectId;
        public ObjectOnly(Long objectId) { this.objectId = objectId; }
        public Long getObjectId() { return objectId; }
        public void setObjectId(Long objectId) { this.objectId = objectId; }
    }
    public static class TableOnly {
        private Long tableId;
        public TableOnly(Long tableId) { this.tableId = tableId; }
        public Long getTableId() { return tableId; }
        public void setTableId(Long tableId) { this.tableId = tableId; }
    }
    public static class WorkOnly {
        private Long workId;
        public WorkOnly(Long workId) { this.workId = workId; }
        public Long getWorkId() { return workId; }
        public void setWorkId(Long workId) { this.workId = workId; }
    }
}
