package asztalos.service.optimalization;

public class Rect {
    public int id;
    public double x;
    public double y;
    public double width;
    public double height;
    public boolean rotated;

    public Rect(int id, double x, double y, double width, double height, boolean rotated) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.rotated = rotated;
    }
}
