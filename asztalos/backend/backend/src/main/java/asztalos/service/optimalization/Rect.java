// Rect.java
package asztalos.service.optimalization;

public class Rect {
    public final int    id;
    public double       x, y;
    public final double origW, origH;
    public final boolean canRotate;
    public boolean      rotated = false;

    // Eredeti konstruktor: méret és forgathatóság
    public Rect(int id, double w, double h, boolean canRotate) {
        this.id        = id;
        this.x         = 0;
        this.y         = 0;
        this.origW     = w;
        this.origH     = h;
        this.canRotate = canRotate;
    }

    // További konstruktor: pozíció + méret + forgathatóság
    public Rect(int id, double x, double y, double w, double h, boolean canRotate) {
        this(id, w, h, canRotate);
        this.x = x;
        this.y = y;
    }

    public double getW() { return rotated ? origH : origW; }
    public double getH() { return rotated ? origW : origH; }
}