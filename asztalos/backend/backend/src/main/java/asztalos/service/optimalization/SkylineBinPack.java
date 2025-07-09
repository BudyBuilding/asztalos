package asztalos.service.optimalization;
import java.util.*;

public class SkylineBinPack {
    private final double binWidth, binHeight;
    private final List<Rect> placed = new ArrayList<>();

    public SkylineBinPack(double width, double height) {
        this.binWidth = width;
        this.binHeight = height;
    }

    public List<Rect> insert(List<Rect> rects) {
        List<Rect> result = new ArrayList<>();
        double currentY = 0, currentX = 0, maxHeightInRow = 0;

        for (Rect r : rects) {
            if (currentX + r.width > binWidth) {
                currentX = 0;
                currentY += maxHeightInRow;
                maxHeightInRow = 0;
            }

            if (currentY + r.height > binHeight) continue;

            r.x = currentX;
            r.y = currentY;
            currentX += r.width;
            maxHeightInRow = Math.max(maxHeightInRow, r.height);

            result.add(r);
            placed.add(r);
        }
        return result;
    }
}
