package asztalos.service.optimalization;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

public class MaxRectsBinPack {
    private double binWidth, binHeight;
    private List<Rect> freeRectangles;
    private List<Rect> placedRectangles;
    private Random random;

    public MaxRectsBinPack(double width, double height, long seed) {
        this.binWidth = width;
        this.binHeight = height;
        this.freeRectangles = new ArrayList<>();
        this.placedRectangles = new ArrayList<>();
        this.random = new Random(seed);
        freeRectangles.add(new Rect(0, 0, 0, width, height, false));
    }

    public List<Rect> insert(List<Rect> rectsToPack, String heuristic) {
        List<Rect> placed = new ArrayList<>();
        
        // Másolat készítése a rectsToPack listáról, hogy ne módosítsuk az eredetit
        List<Rect> shuffledRects = new ArrayList<>(rectsToPack);
        // Véletlenszerű átrendezés a seed alapján
        Collections.shuffle(shuffledRects, random);

        for (Rect rect : shuffledRects) {
            Rect bestRect = null;
            double bestScore = Double.MAX_VALUE;
            boolean bestRotated = false;

            for (Rect free : new ArrayList<>(freeRectangles)) {
                // Try without rotation
                if (rect.width <= free.width && rect.height <= free.height) {
                    Rect candidate = new Rect(rect.id, free.x, free.y, rect.width, rect.height, false);
                    if (!overlapsWithPlaced(candidate)) {
                        double score = scoreRect(candidate, free, heuristic, false);
                        if (score < bestScore) {
                            bestScore = score;
                            bestRect = free;
                            bestRotated = false;
                        }
                    }
                }
                // Try with rotation, but only if allowed
                if (rect.rotated && rect.height <= free.width && rect.width <= free.height) {
                    Rect candidate = new Rect(rect.id, free.x, free.y, rect.height, rect.width, true);
                    if (!overlapsWithPlaced(candidate)) {
                        double score = scoreRect(candidate, free, heuristic, true);
                        if (score < bestScore) {
                            bestScore = score;
                            bestRect = free;
                            bestRotated = true;
                        }
                    }
                }
            }

            if (bestRect != null) {
    // 1) Bound check: ne kerüljön kilógás
    double placeX = bestRect.x;
    double placeY = bestRect.y;
    double placeW = bestRotated ? rect.height : rect.width;
    double placeH = bestRotated ? rect.width  : rect.height;
    if (placeX + placeW  > binWidth || placeY + placeH > binHeight) {
        // kilógna, skip
        System.out.println("Placement would exceed bin bounds for rect ID " + rect.id);
        continue;
    }

    // 2) Ha határoláson belül van, állítsuk be ténylegesen
    rect.x = placeX;
    rect.y = placeY;
    if (bestRotated) {
        // swap szélesség és magasság
        double tmp = rect.width;
        rect.width  = rect.height;
        rect.height = tmp;
    }
    rect.rotated = bestRotated;

    // 3) Overlap‐ellenőrzés (lásd lent)
    if (overlapsAny(rect)) {
        System.out.println("Overlap detected at final placement for rect ID " + rect.id);
        continue;
    }

    // 4) Ha minden OK, akkor split‐eljük a free listet
    splitFreeRect(bestRect, rect);
    pruneFreeList();
} else {
                System.out.println("Could not place rect ID " + rect.id + ", size=[" + rect.width + "x" + rect.height + "]");
            }
        }
        return placed;
    }

    private boolean overlapsWithPlaced(Rect candidate) {
        for (Rect placed : placedRectangles) {
            // A width és height már a forgatás utáni állapotot tükrözi
            if (candidate.x < placed.x + placed.width &&
                candidate.x + candidate.width > placed.x &&
                candidate.y < placed.y + placed.height &&
                candidate.y + candidate.height > placed.y) {
                System.out.println("Overlap detected: Candidate ID " + candidate.id + " at [" + candidate.x + "," + candidate.y + "], size=[" + candidate.width + "x" + candidate.height + "] overlaps with Placed ID " + placed.id + " at [" + placed.x + "," + placed.y + "], size=[" + placed.width + "x" + placed.height + "]");
                return true;
            }
        }
        return false;
    }

    private double scoreRect(Rect rect, Rect free, String heuristic, boolean isRotated) {
        double dx = free.width - rect.width;
        double dy = free.height - rect.height;
        double score = 0;
        switch (heuristic) {
            case "BestShortSideFit":
                score = Math.min(dx, dy);
                break;
            case "BestLongSideFit":
                score = Math.max(dx, dy);
                break;
            case "BestAreaFit":
                score = dx * dy;
                break;
            case "ContactPointRule":
                int contactPoints = 0;
                if (rect.x == 0) contactPoints++;
                if (rect.y == 0) contactPoints++;
                if (rect.x + rect.width == binWidth) contactPoints++;
                if (rect.y + rect.height == binHeight) contactPoints++;
                score = -contactPoints;
                break;
            default:
                score = 0;
        }
        if (isRotated) {
            score += 0.5 + random.nextDouble() * 0.1;
        }
        score += random.nextDouble() * 0.05;
        return score;
    }

    private void splitFreeRect(Rect free, Rect placed) {
        freeRectangles.remove(free);

        double freeRight = free.x + free.width;
        double freeBottom = free.y + free.height;
        double placedRight = placed.x + placed.width;
        double placedBottom = placed.y + placed.height;

        if (placedRight < freeRight) {
            Rect rightRect = new Rect(0, placedRight, free.y, freeRight - placedRight, free.height, false);
            if (rightRect.width > 0 && rightRect.height > 0) {
                freeRectangles.add(rightRect);
            }
        }
        if (placed.x > free.x) {
            Rect leftRect = new Rect(0, free.x, free.y, placed.x - free.x, free.height, false);
            if (leftRect.width > 0 && leftRect.height > 0) {
                freeRectangles.add(leftRect);
            }
        }
        if (placedBottom < freeBottom) {
            Rect bottomRect = new Rect(0, free.x, placedBottom, free.width, freeBottom - placedBottom, false);
            if (bottomRect.width > 0 && bottomRect.height > 0) {
                freeRectangles.add(bottomRect);
            }
        }
        if (placed.y > free.y) {
            Rect topRect = new Rect(0, free.x, free.y, free.width, placed.y - free.y, false);
            if (topRect.width > 0 && topRect.height > 0) {
                freeRectangles.add(topRect);
            }
        }
    }

    private void pruneFreeList() {
        for (int i = 0; i < freeRectangles.size(); i++) {
            Rect r1 = freeRectangles.get(i);
            for (int j = i + 1; j < freeRectangles.size(); j++) {
                Rect r2 = freeRectangles.get(j);
                if (isContainedIn(r1, r2)) {
                    freeRectangles.remove(i);
                    i--;
                    break;
                }
                if (isContainedIn(r2, r1)) {
                    freeRectangles.remove(j);
                    j--;
                }
            }
        }
    }

    private boolean isContainedIn(Rect a, Rect b) {
        return a.x >= b.x && a.y >= b.y
            && a.x + a.width <= b.x + b.width
            && a.y + a.height <= b.y + b.height;
    }

    private boolean overlapsAny(Rect candidate) {
    for (Rect placed : placedRectangles) {
        if (candidate.x < placed.x + placed.width
         && candidate.x + candidate.width  > placed.x
         && candidate.y < placed.y + placed.height
         && candidate.y + candidate.height > placed.y) {
            return true;
        }
    }
    return false;
}
}