package asztalos.dto;

import java.util.Date;

public class CreatedTablesDto {
    private Long tableId;
    private Double price;
    private String size;
    private Date lastUpdateDate;

    private WorkOnly work;
    private ColorOnly color;

    public Long getTableId() {
        return tableId;
    }

    public void setTableId(Long tableId) {
        this.tableId = tableId;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public Date getLastUpdateDate() {
        return lastUpdateDate;
    }

    public void setLastUpdateDate(Date lastUpdateDate) {
        this.lastUpdateDate = lastUpdateDate;
    }

    public WorkOnly getWork() {
        return work;
    }

    public void setWork(WorkOnly work) {
        this.work = work;
    }

    public ColorOnly getColor() {
        return color;
    }

    public void setColor(ColorOnly color) {
        this.color = color;
    }

    public static class WorkOnly {
        private Long workId;

        public WorkOnly(Long workId) {
            this.workId = workId;
        }

        public Long getWorkId() {
            return workId;
        }

        public void setWorkId(Long workId) {
            this.workId = workId;
        }
    }

    public static class ColorOnly {
        private Long colorId;

        public ColorOnly(Long colorId) {
            this.colorId = colorId;
        }

        public Long getColorId() {
            return colorId;
        }

        public void setColorId(Long colorId) {
            this.colorId = colorId;
        }
    }
}
