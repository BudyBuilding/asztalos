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
                // 1) Candidate előkészítése
                Rect candidate = new Rect(
                    rect.id,
                    bestRect.x, bestRect.y,
                    bestRotated ? rect.height : rect.width,
                    bestRotated ? rect.width  : rect.height,
                    bestRotated
                );
                // 2) Dupla overlap‑ellenőrzés
                if (overlapsWithPlaced(candidate)) {
                    continue;
                }
                // 3) Véglegesítés
                rect.x = candidate.x;
                rect.y = candidate.y;
                rect.width  = candidate.width;
                rect.height = candidate.height;
                rect.rotated= candidate.rotated;
                placed.add(rect);
                placedRectangles.add(rect);
                splitFreeRect(bestRect, rect);
                pruneFreeList();
            } else {
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
        if (!isContainedIn(placed, free)) {
            return;
        }
        freeRectangles.remove(free);

    double freeRight   = free.x + free.width;
    double freeBottom  = free.y + free.height;
    double placedRight = placed.x + placed.width;
    double placedBottom= placed.y + placed.height;

    // jobboldali fragment
    if (placedRight < freeRight) {
        double w = freeRight - placedRight;
        Rect rightRect = new Rect(0, placedRight, free.y, w, free.height, false);
        if (w > 0 && free.height > 0) freeRectangles.add(rightRect);
    }
    // baloldali fragment
    if (placed.x > free.x) {
        double w = placed.x - free.x;
        Rect leftRect = new Rect(0, free.x, free.y, w, free.height, false);
        if (w > 0 && free.height > 0) freeRectangles.add(leftRect);
    }
    // alsó fragment
    if (placedBottom < freeBottom) {
        double h = freeBottom - placedBottom;
        Rect bottomRect = new Rect(0, free.x, placedBottom, free.width, h, false);
        if (free.width > 0 && h > 0) freeRectangles.add(bottomRect);
    }
    // felső fragment
    if (placed.y > free.y) {
        double h = placed.y - free.y;
        Rect topRect = new Rect(0, free.x, free.y, free.width, h, false);
        if (free.width > 0 && h > 0) freeRectangles.add(topRect);
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
}