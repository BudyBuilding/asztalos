package asztalos.service;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import asztalos.model.*;
import asztalos.repository.*;
import asztalos.service.optimalization.Rect;
import java.util.function.Supplier;

@Service
public class TableOptimizationService {

    private static final Logger log = LoggerFactory.getLogger(TableOptimizationService.class);

    @Autowired
    private CreatedItemRepository createdItemRepository;

    @Autowired
    private CreatedTablesRepository createdTablesRepository;

    @Autowired
    private WorkRepository workRepository;

@Transactional
public List<CreatedTables> generateTables(Work workParam, Long seed) {
    log.info("Called generateTables for Work ID: {}, with seed: {}", workParam.getWorkId(), seed);
    Work work = workRepository.getWorkById(workParam.getWorkId());
    long effectiveSeed = (seed != null) ? seed : System.currentTimeMillis();

    // 1) Tisztítás
    List<CreatedItem> items = createdItemRepository.findByWork(work);
    log.info("Fetched {} CreatedItems", items.size());
    for (CreatedItem item : items) {
        item.setTablePosition("");
        item.setTableRotation(null);
        item.setTable(null);
        createdItemRepository.save(item);
    }

    // 2) Csoportosítás szín szerint
    Map<Color, List<CreatedItem>> itemsByColor = new LinkedHashMap<>();
    for (CreatedItem item : items) {
        if (item.getColor() == null
         || invalidDim(item.getColor().getDimension())
         || invalidDim(item.getSize())) {
            log.warn("Skipping invalid item {}", item.getItemId());
            continue;
        }
        itemsByColor.computeIfAbsent(item.getColor(), c -> new ArrayList<>())
                    .add(item);
    }

    List<CreatedTables> resultTables = new ArrayList<>();
    double padding = 3.0;

    // 3) Színcsoportonként:
    for (Map.Entry<Color, List<CreatedItem>> entry : itemsByColor.entrySet()) {
        Color color = entry.getKey();
        List<CreatedItem> group = entry.getValue();

       group.sort(Comparator.comparingDouble((CreatedItem item) -> {
           double w = parseDim(item.getSize(), 0);
           double h = parseDim(item.getSize(), 1);
           return w * h;
       }).reversed());

        // 3a) Előkészítjük a Rect-eket és idMap‑et
        List<Rect> toPlace = new ArrayList<>();
        Map<Integer, CreatedItem> idMap = new HashMap<>();
        int rid = 0;
        for (CreatedItem ci : group) {
            int qty = Optional.ofNullable(ci.getQty()).orElse(1);
            double rawW = parseDim(ci.getSize(), 0);
            double rawH = parseDim(ci.getSize(), 1);
            double w = rawW + 2*padding;
            double h = rawH + 2*padding;
            boolean canRotate = Boolean.TRUE.equals(color.getRotable())
                             || Boolean.TRUE.equals(ci.isRotable());
            for (int i = 0; i < qty; i++) {
                toPlace.add(new Rect(rid, 0, 0, w, h, canRotate));
                idMap.put(rid, ci);
                rid++;
            }
        }

        // 3b) Split‑tábla (max 1 darab)
        boolean usedSplit = false;
        String splitDim = color.getSplitDimension();
        log.debug("Color {}: splitDimension = {}", color.getColorId(), splitDim);
        if (splitDim != null && splitDim.startsWith("[") && splitDim.contains(",")) {
            double splitW = parseDim(splitDim, 1);
            double splitH = parseDim(splitDim, 0);
            log.debug("Parsed splitW={} splitH={} for color {}", splitW, splitH, color.getColorId());
            if (splitW > 0 && splitH > 0 && !toPlace.isEmpty()) {
                // létrehozunk egy split‑táblát
                CreatedTables halfTable = createdTablesRepository.save(
                    createNewTable(work, color, splitDim)
               );
               resultTables.add(halfTable);
               log.info("Using SPLIT table ID {} for color {}", halfTable.getId(), color.getColorId());
               // kipakoljuk az elemeket erre a split‑táblára
               double[] skyline = new double[(int)Math.ceil(splitW)];
               Arrays.fill(skyline, 0);
               List<Rect> placed = new ArrayList<>();
               List<Rect> remaining = new ArrayList<>();
 for (Rect r : toPlace) {
    boolean placedFlag = false;
    double bestY = Double.MAX_VALUE;
    int bestX = -1;
    boolean usedRot = false;

    for (boolean tryRot : new boolean[]{false, true}) {
        if (tryRot && !r.rotated) continue;
        double ww = tryRot ? r.height : r.width;
        double hh = tryRot ? r.width : r.height;
        for (int x = 0; x <= splitW - ww; x++) {
            double y = 0;
            for (int i = 0; i < (int)ww; i++) {
                y = Math.max(y, skyline[x + i]);
            }
            if (y + hh <= splitH && y < bestY && !overlaps(x, y, ww, hh, placed)) {
                bestY = y; bestX = x; usedRot = tryRot; placedFlag = true;
            }
        }
        if (placedFlag) break;
    }

    if (placedFlag) {
        r.x = bestX; r.y = bestY;
        if (usedRot) { double tmp = r.width; r.width = r.height; r.height = tmp; }
        r.rotated = usedRot;
        for (int i = 0; i < (int)r.width; i++) skyline[bestX + i] = r.y + r.height;
        placed.add(r);
    } else {
        remaining.add(r);
    }
}

               // mentjük a pozíciókat a DB‑be a split‑táblára
               for (Rect r : placed) {
                   CreatedItem ci = idMap.get(r.id);
                   String pos = String.format("[%.0f,%.0f,%d,%d]",
                       r.x, r.y, r.rotated ? 0 : 1, halfTable.getId()
                   );
                   ci.setTablePosition(
                       (ci.getTablePosition() == null || ci.getTablePosition().isEmpty())
                       ? pos
                       : ci.getTablePosition() + "," + pos
                    );
                    ci.setTableRotation(String.valueOf(r.rotated ? 0 : 1));
                    ci.setTable(halfTable);
                    createdItemRepository.save(ci);
                }
                toPlace = remaining;
                usedSplit = true;
                log.debug("After split, remaining toPlace = {}", toPlace.size());
            } else {
                log.debug("Split skipped: split dims invalid or no items to place");
            }
        }
        if (!usedSplit) {
        // 3c) Full‑sheet logika (ismétlődő táblák)
        double sheetW = parseDim(color.getDimension(), 1);
        double sheetH = parseDim(color.getDimension(), 0);
        if (sheetW <= 0 || sheetH <= 0) {
            throw new IllegalArgumentException("Invalid sheet dims: " + color.getDimension());
        }

        List<CreatedTables> tables = createdTablesRepository.findByWorkAndColor(work, color);
        AtomicInteger tableIndex = new AtomicInteger(0);
        Supplier<CreatedTables> nextTable = () -> {
            int idx = tableIndex.getAndIncrement();
            if (idx < tables.size()) {
                CreatedTables ex = tables.get(idx);
                ex.setPrice(color.getPrice() != null ? color.getPrice() : 0.0);
                createdTablesRepository.save(ex);
                log.info("Reusing table {} – updated price", ex.getId());
                return ex;
            } else {
                CreatedTables nt = createdTablesRepository.save(
                    createNewTable(work, color, color.getDimension())
                );
                tables.add(nt);
                return nt;
            }
        };

        while (!toPlace.isEmpty()) {
            CreatedTables ct = nextTable.get();
            resultTables.add(ct);
            log.info("Using FULL table ID {} for color {}", ct.getId(), color.getColorId());

            double[] skyline = new double[(int)Math.ceil(sheetW)];
            Arrays.fill(skyline, 0);
            List<Rect> placed = new ArrayList<>();
            List<Rect> remaining = new ArrayList<>();

            for (Rect r : toPlace) {
                boolean placedFlag = false;
                double bestY = Double.MAX_VALUE;
                int bestX = -1;
                boolean usedRot = false;

                for (boolean tryRot : new boolean[]{false, true}) {
                    if (tryRot && !r.rotated) continue;
                    double ww = tryRot ? r.height : r.width;
                    double hh = tryRot ? r.width : r.height;
                    for (int x = 0; x <= sheetW - ww; x++) {
                        double y = 0;
                        for (int i = 0; i < (int)ww; i++) {
                            y = Math.max(y, skyline[x + i]);
                        }
                        if (y + hh <= sheetH && y < bestY
                         && !overlaps(x, y, ww, hh, placed)) {
                            bestY = y; bestX = x; usedRot = tryRot; placedFlag = true;
                        }
                    }
                    if (placedFlag) break;
                }

                if (placedFlag) {
                    r.x = bestX; r.y = bestY;
                    if (usedRot) {
                        double tmp = r.width; r.width = r.height; r.height = tmp;
                    }
                    r.rotated = usedRot;
                    for (int i = 0; i < (int)r.width; i++) {
                        skyline[bestX + i] = r.y + r.height;
                    }
                    placed.add(r);
                } else {
                    remaining.add(r);
                }
            }

            for (Rect r : placed) {
                CreatedItem ci = idMap.get(r.id);
                String pos = String.format("[%.0f,%.0f,%d,%d]",
                    r.x, r.y, r.rotated ? 0 : 1, ct.getId()
                );
                ci.setTablePosition(
                    (ci.getTablePosition() == null || ci.getTablePosition().isEmpty())
                    ? pos
                    : ci.getTablePosition() + "," + pos
                );
                ci.setTableRotation(String.valueOf(r.rotated ? 0 : 1));
                ci.setTable(ct);
                createdItemRepository.save(ci);
            }
            toPlace = remaining;
        }
        if (!toPlace.isEmpty() && !resultTables.isEmpty()
            && color.getSplitDimension() != null) {
            CreatedTables lastTable = resultTables.get(resultTables.size() - 1);
            log.info("Applying split packing on last FULL table ID {}", lastTable.getId());
            List<Rect> remainingRects = new ArrayList<>(toPlace);
            toPlace.clear();
            applySplitPacking(lastTable, remainingRects, idMap, padding);
        }
    }}

    // 4) Végső árösszeg és mentés
    double totalWoodPrice = resultTables.stream()
        .mapToDouble(CreatedTables::getPrice)
        .sum();
    work.setWoodPrice(totalWoodPrice);
    workRepository.save(work);

    return resultTables;
}


    private void applySplitPacking(CreatedTables table, List<Rect> rects, Map<Integer,CreatedItem> idMap, double padding) {
        String splitDim = table.getSize();
        double splitW = parseDim(splitDim, 1);
        double splitH = parseDim(splitDim, 0);
        double[] skyline = new double[(int)Math.ceil(splitW)];
        Arrays.fill(skyline, 0);
        List<Rect> placed = new ArrayList<>();
        List<Rect> leftover = new ArrayList<>();
        for (Rect r : rects) {
            boolean placedFlag = false;
            double bestY = Double.MAX_VALUE;
            int bestX = -1;
            boolean usedRot = false;
            for (boolean tryRot : new boolean[]{false,true}) {
                if (tryRot && !r.rotated) continue;
                double ww = tryRot ? r.height : r.width;
                double hh = tryRot ? r.width  : r.height;
                for (int x = 0; x <= splitW - ww; x++) {
                    double y = 0;
                    for (int i = 0; i < (int)ww; i++) y = Math.max(y, skyline[x+i]);
                    if (y+hh <= splitH && y < bestY && !overlaps(x,y,ww,hh,placed)) {
                        bestY=y; bestX=x; usedRot=tryRot; placedFlag=true;
                    }
                }
                if (placedFlag) break;
            }
            if (placedFlag) {
                r.x=bestX; r.y=bestY;
                if (usedRot) { double tmp=r.width; r.width=r.height; r.height=tmp; }
                r.rotated=usedRot;
                for (int i=0;i<(int)r.width;i++) skyline[bestX+i]=r.y+r.height;
                placed.add(r);
            } else {
                leftover.add(r);
           }
       }
        // pozíciók mentése a DB-be
        for (Rect r : placed) {
            CreatedItem ci = idMap.get(r.id);
            String pos = String.format("[%.0f,%.0f,%d,%d]",
                r.x, r.y, r.rotated?0:1, table.getId()
            );
            ci.setTablePosition(
                ci.getTablePosition()==null||ci.getTablePosition().isEmpty()
                ? pos : ci.getTablePosition()+","+pos
            );
            ci.setTableRotation(String.valueOf(r.rotated?0:1));
            ci.setTable(table);
            createdItemRepository.save(ci);
        }
        // ha maradtak elemek, új tábla(ka)t indíthatunk...
    }

    private boolean overlaps(double x, double y, double w, double h, List<Rect> placed) {
        for (Rect r : placed) {
            if (x < r.x + r.width && x + w > r.x && y < r.y + r.height && y + h > r.y) {
                return true;
            }
        }
        return false;
    }

    @Transactional
    public List<CreatedTables> generateTables(Work work) {
        return generateTables(work, null);
    }

    private boolean invalidDim(String d) {
        return d == null || !d.startsWith("[") || !d.contains(",");
    }

    private double parseDim(String s, int idx) {
        String[] parts = s.replaceAll("\\[|\\]", "").split(",");
        return Double.parseDouble(parts[idx].trim());
    }

    private CreatedTables createNewTable(Work work, Color color, String size) {
        CreatedTables table = new CreatedTables();
        table.setWork(work);
        table.setColor(color);
        table.setSize(size);
        double price = color.getPrice() != null ? color.getPrice() : 0.0;
        table.setPrice(price);
        log.info("Created new table (color {}) with price {}", color.getColorId(), price);
        return table;
    }
}
