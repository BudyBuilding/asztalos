// MaxRectsBinPack.java

package asztalos.service.optimalization;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Random;

public class MaxRectsBinPack {
    private final double binW, binH;
    private final List<Rect> freeRects = new ArrayList<>();
    private final List<Rect> placedRects = new ArrayList<>();
    private final Random rnd;

    public MaxRectsBinPack(double width, double height, long seed) {
        this.binW = width;
        this.binH = height;
        this.rnd  = new Random(seed);
        freeRects.add(new Rect(-1, width, height, false)); // inicializáló üres terület
    }

    /**
     * Heurisztikával vezérelt max‐rect placement.
     * @param toPack list of Rect (ismét nem módosítjuk a width/height mezőket)
     * @param heuristic "BestShortSideFit"|"BestAreaFit"|...
     */
    public List<Rect> insert(List<Rect> toPack, String heuristic) {
        List<Rect> placed = new ArrayList<>();

        for (Rect rect : toPack) {
            Rect bestFree = null;
            boolean bestRot = false;
            double bestScore = Double.MAX_VALUE;

            // 1) keresünk minden szabad téglalapban, mindkét orientációt
            for (Rect free : freeRects) {
                for (boolean rot : new boolean[]{false, true}) {
                    if (rot && !rect.canRotate) continue;
                    double rw = rot ? rect.origH : rect.origW;
                    double rh = rot ? rect.origW : rect.origH;
                    if (rw <= free.getW() && rh <= free.getH()) {
                        double score = scoreRect(rw, rh, free, heuristic);
                        if (score < bestScore) {
                            bestScore = score;
                            bestFree  = free;
                            bestRot   = rot;
                        }
                    }
                }
            }

            // 2) ha találtunk megfelelő free‐rectet, elhelyezzük
            if (bestFree != null) {
                rect.x       = bestFree.x;
                rect.y       = bestFree.y;
                rect.rotated = bestRot;
                placed.add(rect);
                placedRects.add(rect);

                splitFreeRect(bestFree, rect);
                pruneFreeList();
            }
        }

        return placed;
    }

    private double scoreRect(double rw, double rh, Rect free, String heuristic) {
        double dw = free.getW() - rw;
        double dh = free.getH() - rh;
        switch (heuristic) {
            case "BestShortSideFit": return Math.min(dw, dh);
            case "BestLongSideFit":  return Math.max(dw, dh);
            case "BestAreaFit":      return dw * dh;
            case "ContactPointRule":
                int contacts = 0;
                if (free.x == 0) contacts++;
                if (free.y == 0) contacts++;
                if (free.x + free.getW() == binW) contacts++;
                if (free.y + free.getH() == binH) contacts++;
                return -contacts;
            default:
                return 0;
        }
    }

    private void splitFreeRect(Rect free, Rect placed) {
        freeRects.remove(free);
        double fx = free.x, fy = free.y;
        double fw = free.getW(), fh = free.getH();
        double px = placed.x, py = placed.y;
        double pw = placed.getW(), ph = placed.getH();

        if (px + pw < fx + fw) {
            freeRects.add(new Rect(-1, (fx+pw), fy, fw-pw, fh, false));
        }
        if (px > fx) {
            freeRects.add(new Rect(-1, fx, fy, px-fx, fh, false));
        }
        if (py + ph < fy + fh) {
            freeRects.add(new Rect(-1, fx, (fy+ph), fw, fh-ph, false));
        }
        if (py > fy) {
            freeRects.add(new Rect(-1, fx, fy, fw, py-fy, false));
        }
    }

    private void pruneFreeList() {
        for (int i = 0; i < freeRects.size(); i++) {
            Rect a = freeRects.get(i);
            for (int j = i + 1; j < freeRects.size(); j++) {
                Rect b = freeRects.get(j);
                if (contains(a, b)) {
                    freeRects.remove(i--);
                    break;
                }
                if (contains(b, a)) {
                    freeRects.remove(j--);
                }
            }
        }
    }

    private boolean contains(Rect a, Rect b) {
        return a.x <= b.x
            && a.y <= b.y
            && a.x + a.getW() >= b.x + b.getW()
            && a.y + a.getH() >= b.y + b.getH();
    }
}
