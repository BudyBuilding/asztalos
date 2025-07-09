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
import asztalos.service.optimalization.MaxRectsBinPack;         
import asztalos.service.optimalization.Rect;    
import java.util.function.Supplier;

@Service
public class TableOptimizationService_orig {

    private static final Logger log = LoggerFactory.getLogger(TableOptimizationService.class);

    @Autowired
    private CreatedItemRepository createdItemRepository;

    @Autowired
    private CreatedTablesRepository createdTablesRepository;
    
    @Autowired
    private WorkRepository workRepository;
    /**
     * Generates cutting tables (sheets) for all items in a work,
     * grouping by sheet color/material and packing with 3mm padding.
     * Now handles item quantity by placing each piece separately and
     * concatenating positions in tablePosition.
     * @param work The work to generate tables for
     * @param seed Optional seed for randomization of placement
     */
    @Transactional
    public List<CreatedTables> generateTables(Work work, Long seed) {
        log.info("Called generateTables for Work ID: {}, with seed: {}", work.getWorkId(), seed);

        // Ha nincs seed megadva, használjunk egy alapértelmezettet (pl. aktuális idő)
        long effectiveSeed = (seed != null) ? seed : System.currentTimeMillis();

        // Fetch items
        List<CreatedItem> items = createdItemRepository.findByWork(work);
        log.info("Fetched {} CreatedItems", items.size());

        // Clear previous item positions
        for (CreatedItem item : items) {
            item.setTablePosition("");
            item.setTableRotation(null);
            item.setTable(null);
            createdItemRepository.save(item);
        }

        // Group items by color
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

        // Process each color group
        for (Map.Entry<Color, List<CreatedItem>> entry : itemsByColor.entrySet()) {
            Color color = entry.getKey();
            List<CreatedItem> group = entry.getValue();
            double sheetW = parseDim(color.getDimension(), 1);
            double sheetH = parseDim(color.getDimension(), 0);
            if (sheetW <= 0 || sheetH <= 0) {
                throw new IllegalArgumentException("Invalid sheet dims: " + color.getDimension());
            }

            // Fetch or initialize tables for this work & color
            List<CreatedTables> tables = createdTablesRepository.findByWorkAndColor(work, color);
            final AtomicInteger tableIndex = new AtomicInteger(0);
            Supplier<CreatedTables> nextTable = () -> {
                int idx = tableIndex.getAndIncrement();
                if (idx < tables.size()) {
                    CreatedTables existing = tables.get(idx);
                    // price-frissítés
                    double updatedPrice = color.getPrice() != null ? color.getPrice() : 0.0;
                    existing.setPrice(updatedPrice);
                    createdTablesRepository.save(existing);  // ha azonnal menteni akarod
                    log.info("Reusing table {} – updated price to {}", existing.getId(), updatedPrice);
                    return existing;
                } else {
                    CreatedTables t = createNewTable(work, color, color.getDimension());
                    t = createdTablesRepository.save(t);
                    tables.add(t);
                    return t;
                }
            };



            // Prepare rectangles with logging
            List<Rect> toPack = new ArrayList<>();
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
                    toPack.add(new Rect(rid, 0, 0, w, h, canRotate));
                    idMap.put(rid, item);
                    rid++;
                }
            }

            // Pack and log placement
            while (!toPack.isEmpty()) {
                MaxRectsBinPack packer = new MaxRectsBinPack(sheetW, sheetH, effectiveSeed);
                List<Rect> placed = packer.insert(toPack, "BestShortSideFit");

                CreatedTables currentTable = nextTable.get();
                resultTables.add(currentTable);
                log.info("Using table ID {} for color {}", currentTable.getId(), color.getColorId());

                List<Rect> remaining = new ArrayList<>();
                for (Rect r : toPack) {
                    CreatedItem it = idMap.get(r.id);
                    if (placed.contains(r)) {
                        // Ellenőrizzük a határokat a padding figyelembevételével
                        if (r.x + r.width > sheetW || r.y + r.height > sheetH) {
                            log.error("Item {} exceeds sheet bounds: pos=[{},{}], size=[{},{}], sheet=[{},{}]", 
                                    it.getItemId(), r.x, r.y, r.width, r.height, sheetW, sheetH);
                            remaining.add(r);
                            continue;
                        }
                
                        // A pozíciók mentésekor nem adjuk hozzá a paddinget, mert az már benne van a méretekben
                        String pos = String.format("[%.0f,%.0f,%d,%d]", r.x, r.y,
                                r.rotated ? 0 : 1, currentTable.getId());
                        log.info("Placed item {} piece #{} at {}, rotated={}", it.getItemId(), r.id, pos, r.rotated);
                        String prev = it.getTablePosition();
                        it.setTablePosition((prev == null || prev.isEmpty()) ? pos : prev + "," + pos);
                        it.setTableRotation(String.valueOf(r.rotated ? 0 : 1));
                        it.setTable(currentTable);
                        createdItemRepository.save(it);
                    } else {
                        remaining.add(r);
                    }
                }
                toPack = remaining;
            }
        }
        double totalWoodPrice = resultTables.stream()
            .mapToDouble(CreatedTables::getPrice)
            .sum();
            work.setWoodPrice(totalWoodPrice);
            workRepository.save(work);
        return resultTables;
    }

    // Túlterhelt metódus seed nélkül
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