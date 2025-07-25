package asztalos.service;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Supplier;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import asztalos.model.*;
import asztalos.repository.*;
import asztalos.service.optimalization.Rect;

@Service
public class TableOptimizationService {
    private static final Logger log = LoggerFactory.getLogger(TableOptimizationService.class);

    @Autowired private CreatedItemRepository createdItemRepository;
    @Autowired private CreatedTablesRepository createdTablesRepository;
    @Autowired private WorkRepository workRepository;

    @Transactional
    public List<CreatedTables> generateTables(Work workParam) {
        return generateTables(workParam, System.currentTimeMillis());
    }

    @Transactional
    public List<CreatedTables> generateTables(Work workParam, Long seed) {
        Work work = workRepository.getWorkById(workParam.getWorkId());
        double padding = 3.0;

        // 1) Reset state
        List<CreatedItem> items = createdItemRepository.findByWork(work);
        items.forEach(it -> {
            it.setTablePosition("");
            it.setTableRotation(null);
            it.setTable(null);
            createdItemRepository.save(it);
        });

        // 2) Group by color
        Map<Color,List<CreatedItem>> byColor = new LinkedHashMap<>();
        for (CreatedItem it : items) {
            Color c = it.getColor();
            if (c == null || invalidDim(c.getDimension()) || invalidDim(it.getSize())) {
                log.warn("Skipping invalid item {}", it.getItemId());
            } else {
                byColor.computeIfAbsent(c, k -> new ArrayList<>()).add(it);
            }
        }

        List<CreatedTables> result = new ArrayList<>();
        AtomicInteger globalSeed = new AtomicInteger(seed == null ? (int) System.currentTimeMillis() : seed.intValue());

        // 3) Packing per color
        for (Map.Entry<Color,List<CreatedItem>> e : byColor.entrySet()) {
            Color color = e.getKey();
            double sheetW = parseDim(color.getDimension(),1);
            double sheetH = parseDim(color.getDimension(),0);
            log.info("Packing color={} on sheet {}×{}", color.getName(), sheetW, sheetH);

            List<CreatedTables> saved = createdTablesRepository.findByWorkAndColor(work, color);
            AtomicInteger ti = new AtomicInteger(0);
            Supplier<CreatedTables> nextTable = () -> {
                int idx = ti.getAndIncrement();
                if (idx < saved.size()) {
                    CreatedTables t = saved.get(idx);
                    t.setPrice(Optional.ofNullable(color.getPrice()).orElse(0.0));
                    return createdTablesRepository.save(t);
                } else {
                    CreatedTables t = createNewTable(work, color, color.getDimension());
                    return createdTablesRepository.save(t);
                }
            };

            // 3.1) Create and sort rects
            List<Rect> rects = new ArrayList<>();
            Map<Integer,CreatedItem> idMap = new HashMap<>();
            int rid = 0;
            for (CreatedItem it : e.getValue()) {
                int qty = Optional.ofNullable(it.getQty()).orElse(1);
                double w = parseDim(it.getSize(),0) + 2 * padding;
                double h = parseDim(it.getSize(),1) + 2 * padding;
                boolean canRot = Boolean.TRUE.equals(color.getRotable()) || Boolean.TRUE.equals(it.isRotable());
                for (int i = 0; i < qty; i++) {
                    Rect r = new Rect(rid++, w, h, canRot);
                    rects.add(r);
                    idMap.put(r.id, it);
                }
            }
            rects.sort(Comparator.comparingDouble(r -> -(r.origW * r.origH)));

            // 3.2) Best-Fit Decreasing
            List<TablePlacement> packs = new ArrayList<>();
            for (Rect r : rects) {
                TablePlacement bestTp = null;
                Candidate bestCand = null;

                // search existing tables
                for (TablePlacement tp : packs) {
                    List<Candidate> cands = collectCandidates(r, tp, sheetW, sheetH);
                    if (!cands.isEmpty()) {
                        Candidate localBest = Collections.min(cands, Comparator.comparingDouble(c -> c.waste));
                        if (bestCand == null || localBest.waste < bestCand.waste) {
                            bestCand = localBest;
                            bestTp = tp;
                        }
                    }
                }

                if (bestTp != null) {
                    applyCandidate(r, bestTp, bestCand);
                } else {
                    CreatedTables ct = nextTable.get();
                    result.add(ct);
                    TablePlacement tp = new TablePlacement(ct, sheetW);
                    Candidate cand = Collections.min(
                        collectCandidates(r, tp, sheetW, sheetH),
                        Comparator.comparingDouble(c -> c.waste)
                    );
                    applyCandidate(r, tp, cand);
                    packs.add(tp);
                }
            }

            // (split logic, saving, price aggregation remain unchanged...)
            String splitDim = color.getSplitDimension();
            if (splitDim != null && !invalidDim(splitDim)) {
                double splitW = parseDim(splitDim,1);
                double splitH = parseDim(splitDim,0);

                TablePlacement lastTp = packs.get(packs.size() - 1);
                List<Rect> testRects = new ArrayList<>();
                for (Rect r : lastTp.placed) {
                    testRects.add(new Rect(r.id, r.origW, r.origH, r.canRotate));
                }

                TablePlacement smallTp = new TablePlacement(lastTp.table, splitW);
                boolean allFit = true;
                for (Rect r : testRects) {
                    if (!place(r, smallTp, splitW, splitH)) {
                        allFit = false;
                        break;
                    }
                }
                if (allFit) {
                    lastTp.skyline = smallTp.skyline;
                    lastTp.placed = smallTp.placed;
                    lastTp.table.setSize(splitDim);
                    createdTablesRepository.save(lastTp.table);
                }
            }

            for (TablePlacement tp : packs) {
                for (Rect r : tp.placed) {
                    CreatedItem it = idMap.get(r.id);
                    String pos = String.format("[%.0f,%.0f,%d,%d]",
                                    r.x, r.y, r.rotated ? 0 : 1, tp.table.getId());
                    it.setTablePosition(it.getTablePosition().isEmpty() ? pos : it.getTablePosition() + "," + pos);
                    it.setTableRotation(r.rotated ? "0" : "1");
                    it.setTable(tp.table);
                    createdItemRepository.save(it);
                }
            }

            List<Map<String,Object>> dump = new ArrayList<>();
            for (TablePlacement tp : packs) {
                Map<String,Object> tbl = new HashMap<>();
                tbl.put("tableId", tp.table.getId());
                List<Map<String,Object>> rects1 = new ArrayList<>();
                for (Rect r : tp.placed) {
                    rects1.add(Map.of(
                      "id", r.id,
                      "x", r.x,
                      "y", r.y,
                      "w", r.getW(),
                      "h", r.getH()
                    ));
                }
                tbl.put("rects1", rects1);
                dump.add(tbl);
            }
            log.info("PLACEMENT DUMP for color {}: {}", color.getName(), dump);
        }

        // 4) Sum prices
        double total = result.stream().mapToDouble(CreatedTables::getPrice).sum();
        work.setWoodPrice(total);
        workRepository.save(work);

        return result;
    }

    // --- helper methods and classes ---

    private static class TablePlacement {
        CreatedTables table;
        double[] skyline;
        List<Rect> placed = new ArrayList<>();
        TablePlacement(CreatedTables t, double sheetW) {
            this.table = t;
            this.skyline = new double[(int)Math.ceil(sheetW)];
            Arrays.fill(this.skyline, 0);
            log.debug("New TablePlacement id={} skyline-width={}", t.getId(), skyline.length);
        }
    }

    private static class Candidate {
        int x, w, h;
        double y, waste;
        boolean rot;
        Candidate(int x, double y, int w, int h, boolean rot, double waste) {
            this.x = x; this.y = y; this.w = w; this.h = h;
            this.rot = rot; this.waste = waste;
        }
    }

    private List<Candidate> collectCandidates(Rect r, TablePlacement tp, double sheetW, double sheetH) {
        List<Candidate> candidates = new ArrayList<>();
        int maxX = (int)Math.floor(sheetW);
        for (boolean rot : new boolean[]{false,true}) {
            if (rot && !r.canRotate) continue;
            int w = (int)Math.ceil(rot ? r.origH : r.origW);
            int h = (int)Math.ceil(rot ? r.origW : r.origH);
            for (int x = 0; x <= maxX - w; x++) {
                double y = 0;
                for (int i = 0; i < w; i++) y = Math.max(y, tp.skyline[x + i]);
                if (y + h <= sheetH && !overlaps(x, y, w, h, tp.placed)) {
                    double waste = w * h - r.origW * r.origH;
                    candidates.add(new Candidate(x, y, w, h, rot, waste));
                }
            }
        }
        return candidates;
    }

    private void applyCandidate(Rect r, TablePlacement tp, Candidate c) {
        r.x = c.x;
        r.y = c.y;
        r.rotated = c.rot;
        for (int i = 0; i < c.w; i++) {
            tp.skyline[c.x + i] = c.y + c.h;
        }
        tp.placed.add(r);
        log.debug("Placed Rect id={} at ({},{}), rotated={}, size={}x{} waste={}",
            r.id, r.x, r.y, r.rotated, c.w, c.h, c.waste);
    }

    private boolean place(Rect r, TablePlacement tp, double sheetW, double sheetH) {
        // original FFD fallback, unchanged
        int maxX = (int)Math.floor(sheetW);
        List<Candidate> candidates = new ArrayList<>();
        for (boolean rot : new boolean[]{false,true}) {
            if (rot && !r.canRotate) continue;
            int w = (int)Math.ceil(rot ? r.origH : r.origW);
            int h = (int)Math.ceil(rot ? r.origW : r.origH);
            for (int x = 0; x <= maxX - w; x++) {
                double y = 0;
                for (int i = 0; i < w; i++) {
                    y = Math.max(y, tp.skyline[x + i]);
                }
                if (y + h <= sheetH && !overlaps(x, y, w, h, tp.placed)) {
                    double waste = w * h - r.origW * r.origH;
                    candidates.add(new Candidate(x, y, w, h, rot, waste));
                }
            }
        }
        if (candidates.isEmpty()) return false;
        Candidate best = Collections.min(candidates, Comparator.comparingDouble(c -> c.waste));
        applyCandidate(r, tp, best);
        return true;
    }

    private boolean overlaps(int x, double y, int w, int h, List<Rect> placed) {
        for (Rect p : placed) {
            if (x < p.x + p.getW() &&
                x + w > p.x &&
                y < p.y + p.getH() &&
                y + h > p.y) {
                return true;
            }
        }
        return false;
    }

    private boolean invalidDim(String d) {
        return d == null || !d.startsWith("[") || !d.contains(",");
    }
    private double parseDim(String s, int idx) {
        String[] p = s.replaceAll("\\[|\\]", "").split(",");
        return Double.parseDouble(p[idx].trim());
    }
    private CreatedTables createNewTable(Work w, Color c, String dim) {
        CreatedTables t = new CreatedTables();
        t.setWork(w);
        t.setColor(c);
        t.setSize(dim);
        t.setPrice(Optional.ofNullable(c.getPrice()).orElse(0.0));
        return t;
    }
}
