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

        List<CreatedItem> items = createdItemRepository.findByWork(work);
        log.info("Fetched {} CreatedItems", items.size());

        for (CreatedItem item : items) {
            item.setTablePosition("");
            item.setTableRotation(null);
            item.setTable(null);
            createdItemRepository.save(item);
        }

        Map<Color, List<CreatedItem>> itemsByColor = new LinkedHashMap<>();
        for (CreatedItem item : items) {
            if (item.getColor() == null || invalidDim(item.getColor().getDimension()) || invalidDim(item.getSize())) {
                log.warn("Skipping invalid item {}", item.getItemId());
                continue;
            }
            itemsByColor.computeIfAbsent(item.getColor(), c -> new ArrayList<>()).add(item);
        }

        List<CreatedTables> resultTables = new ArrayList<>();
        double padding = 3.0;

        for (Map.Entry<Color, List<CreatedItem>> entry : itemsByColor.entrySet()) {
            Color color = entry.getKey();
            List<CreatedItem> group = entry.getValue();
            double sheetW = parseDim(color.getDimension(), 1);
            double sheetH = parseDim(color.getDimension(), 0);
            if (sheetW <= 0 || sheetH <= 0) {
                throw new IllegalArgumentException("Invalid sheet dims: " + color.getDimension());
            }

            List<CreatedTables> tables = createdTablesRepository.findByWorkAndColor(work, color);
            final AtomicInteger tableIndex = new AtomicInteger(0);
            Supplier<CreatedTables> nextTable = () -> {
                int idx = tableIndex.getAndIncrement();
                if (idx < tables.size()) {
                    CreatedTables existing = tables.get(idx);
                    double updatedPrice = color.getPrice() != null ? color.getPrice() : 0.0;
                    existing.setPrice(updatedPrice);
                    createdTablesRepository.save(existing);
                    log.info("Reusing table {} – updated price to {}", existing.getId(), updatedPrice);
                    return existing;
                } else {
                    CreatedTables t = createNewTable(work, color, color.getDimension());
                    t = createdTablesRepository.save(t);
                    tables.add(t);
                    return t;
                }
            };

            List<Rect> toPlace = new ArrayList<>();
            Map<Integer, CreatedItem> idMap = new HashMap<>();
            int rid = 0;
            for (CreatedItem item : group) {
                int qty = Optional.ofNullable(item.getQty()).orElse(1);
                double rawW = parseDim(item.getSize(), 0);
                double rawH = parseDim(item.getSize(), 1);
                double w = rawW + 2 * padding;
                double h = rawH + 2 * padding;
                boolean canRotate = Boolean.TRUE.equals(color.getRotable()) || Boolean.TRUE.equals(item.isRotable());
                log.info("Item {}: size={}x{}, qty={}, canRotate={}", item.getItemId(), rawW, rawH, qty, canRotate);
                for (int i = 0; i < qty; i++) {
                    toPlace.add(new Rect(rid, 0, 0, w, h, canRotate));
                    idMap.put(rid, item);
                    rid++;
                }
            }

            while (!toPlace.isEmpty()) {
                CreatedTables currentTable = nextTable.get();
                resultTables.add(currentTable);
                log.info("Using table ID {} for color {}", currentTable.getId(), color.getColorId());

                int skylineWidth = (int) Math.ceil(sheetW);
                double[] skyline = new double[skylineWidth];
                Arrays.fill(skyline, 0);

                List<Rect> placed = new ArrayList<>();
                List<Rect> remaining = new ArrayList<>();

                for (Rect r : toPlace) {
                    boolean placedFlag = false;
                    double bestY = Double.MAX_VALUE;
                    int bestX = -1;
                    boolean usedRotation = false;

                    for (boolean tryRotated : new boolean[]{false, true}) {
                        if (tryRotated && !r.rotated) continue;

                        double w = tryRotated ? r.height : r.width;
                        double h = tryRotated ? r.width : r.height;

                        for (int x = 0; x <= sheetW - w; x++) {
                            double y = 0;
                            for (int i = 0; i < (int) w; i++) {
                                y = Math.max(y, skyline[x + i]);
                            }
                            if (y + h <= sheetH && y < bestY && !overlaps(x, y, w, h, placed)) {
                                bestY = y;
                                bestX = x;
                                usedRotation = tryRotated;
                                placedFlag = true;
                            }
                        }
                        if (placedFlag) break;
                    }

                    if (placedFlag) {
                        r.x = bestX;
                        r.y = bestY;
                        if (usedRotation) {
                            double tmp = r.width;
                            r.width = r.height;
                            r.height = tmp;
                        }
                        r.rotated = usedRotation;
                        for (int i = 0; i < (int) r.width; i++) {
                            skyline[bestX + i] = r.y + r.height;
                        }
                        placed.add(r);
                    } else {
                        remaining.add(r);
                    }
                }

                for (Rect r : placed) {
                    CreatedItem it = idMap.get(r.id);
                    String pos = String.format("[%.0f,%.0f,%d,%d]", r.x, r.y, r.rotated ? 0 : 1, currentTable.getId());
                    String prev = it.getTablePosition();
                    it.setTablePosition((prev == null || prev.isEmpty()) ? pos : prev + "," + pos);
                    it.setTableRotation(String.valueOf(r.rotated ? 0 : 1));
                    it.setTable(currentTable);
                    createdItemRepository.save(it);
                }
                toPlace = remaining;
            }
        }

        double totalWoodPrice = resultTables.stream().mapToDouble(CreatedTables::getPrice).sum();
        work.setWoodPrice(totalWoodPrice);
        workRepository.save(work);
        return resultTables;
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
