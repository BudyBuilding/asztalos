// SkylineBinPack.java

package asztalos.service.optimalization;

import java.util.ArrayList;
import java.util.List;

public class SkylineBinPack {
    private final double binW, binH;
    private final List<Rect> placed = new ArrayList<>();

    public SkylineBinPack(double width, double height) {
        this.binW = width;
        this.binH = height;
    }

    /**
     * „Line‐by‐line” packer: nem optimalizál, de legalább nem enged átfedést.
     * Elvárás: a paddinget, forgatást és sort‐előkészítést a hívó kód intézi.
     */
    public List<Rect> insert(List<Rect> rects) {
        List<Rect> result = new ArrayList<>();
        double curX = 0, curY = 0, rowH = 0;

        for (Rect r : rects) {
            double w = r.getW(), h = r.getH();

            // ha nem fér egy sorban
            if (curX + w > binW) {
                curX = 0;
                curY += rowH;
                rowH = 0;
            }
            // ha már magasságban sem fér
            if (curY + h > binH) {
                continue;
            }

            // elhelyezés
            r.x = curX;
            r.y = curY;
            placed.add(r);
            result.add(r);

            // sor állapot frissítése
            curX += w;
            rowH = Math.max(rowH, h);
        }

        return result;
    }
}
