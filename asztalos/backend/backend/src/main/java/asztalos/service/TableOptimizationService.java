// TableOptimizationService.java
package asztalos.service;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Supplier;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

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

        // 1) Resetelt állapot
        List<CreatedItem> items = createdItemRepository.findByWork(work);
        items.forEach(it -> {
            it.setTablePosition("");
            it.setTableRotation(null);
            it.setTable(null);
            createdItemRepository.save(it);
        });

        // 2) Csoportosítás színenként
        Map<Color,List<CreatedItem>> byColor = new LinkedHashMap<>();
        for (CreatedItem it : items) {
            Color c = it.getColor();
            if (c==null||invalidDim(c.getDimension())||invalidDim(it.getSize())) {
                log.warn("Skipping invalid item {}", it.getItemId());
            } else {
                byColor.computeIfAbsent(c, k->new ArrayList<>()).add(it);
            }
        }

        List<CreatedTables> result = new ArrayList<>();
        AtomicInteger globalSeed = new AtomicInteger(seed==null?(int)System.currentTimeMillis():seed.intValue());

        // 3) Színenként packing
        for (Map.Entry<Color,List<CreatedItem>> e : byColor.entrySet()) {
            Color color = e.getKey();
            double sheetW = parseDim(color.getDimension(),1);
            double sheetH = parseDim(color.getDimension(),0);
            log.info("Packing color={} on sheet {}×{}", color.getName(), sheetW, sheetH);
            // előre mentett táblák
            List<CreatedTables> saved = createdTablesRepository.findByWorkAndColor(work,color);
            AtomicInteger ti = new AtomicInteger(0);
            Supplier<CreatedTables> nextTable = () -> {
                int idx = ti.getAndIncrement();
                if (idx<saved.size()) {
                    CreatedTables t = saved.get(idx);
                    t.setPrice(Optional.ofNullable(color.getPrice()).orElse(0.0));
                    return createdTablesRepository.save(t);
                } else {
                    CreatedTables t = createNewTable(work,color,color.getDimension());
                    return createdTablesRepository.save(t);
                }
            };

            // 3.1) Rect-ek készítése és csökkenő rendezés terület szerint
            List<Rect> rects = new ArrayList<>();
            Map<Integer,CreatedItem> idMap = new HashMap<>();
            int rid=0;
            for (CreatedItem it : e.getValue()) {
                int qty = Optional.ofNullable(it.getQty()).orElse(1);
                double w = parseDim(it.getSize(),0)+2*padding;
                double h = parseDim(it.getSize(),1)+2*padding;
                boolean canRot = Boolean.TRUE.equals(color.getRotable())||Boolean.TRUE.equals(it.isRotable());
                for(int i=0;i<qty;i++){
                    Rect r = new Rect(rid++,w,h,canRot);
                    rects.add(r);
                    idMap.put(r.id,it);
                }
            }
            rects.sort(Comparator.comparingDouble(r->-(r.origW*r.origH)));

            // 3.2) First-fit decreasing
            List<TablePlacement> packs = new ArrayList<>();
            for (Rect r : rects) {
                boolean placed = false;
                // először meglévő táblák
                for (TablePlacement tp : packs) {
                    if (placeMaxRects(r, tp)) {
                        placed = true;
                        break;
                    }
                }
                // ha egyik sem tudta elhelyezni, új tábla
                if (!placed) {
                    CreatedTables ct = nextTable.get();
                    result.add(ct);
                    TablePlacement tp = new TablePlacement(ct, sheetW, sheetH);
                    placeMaxRects(r, tp);
                    packs.add(tp);
                }
            }
                        String splitDim = color.getSplitDimension();
            if (splitDim != null && !invalidDim(splitDim)) {
                double splitW = parseDim(splitDim, 1);
                double splitH = parseDim(splitDim, 0);

                TablePlacement lastTp = packs.get(packs.size() - 1);
                List<Rect> originalRects = lastTp.placed;

                // Készítsünk friss Rect másolatokat
                List<Rect> testRects = new ArrayList<>();
                for (Rect r : originalRects) {
                    testRects.add(new Rect(r.id, r.origW, r.origH, r.canRotate));
                }

                // Próbáljuk bepakolni őket a split méretű táblába
                TablePlacement smallTp = new TablePlacement(lastTp.table, splitW, splitH);
                boolean allFit = true;
                for (Rect r : testRects) {
                    if (!placeMaxRects(r, smallTp)) {
                        allFit = false;
                        break;
                    }
                }
                if (allFit) {
                    lastTp.placed  = smallTp.placed;
                    lastTp.table.setSize(splitDim);
                    createdTablesRepository.save(lastTp.table);
                }

            }

            // 3.3) Mentés DB-be
            for (TablePlacement tp: packs) {
                for (Rect r: tp.placed) {
                    CreatedItem it = idMap.get(r.id);
                    String pos = String.format("[%.0f,%.0f,%d,%d]",
                                    r.x, r.y, r.rotated?0:1, tp.table.getId());
                    it.setTablePosition(it.getTablePosition().isEmpty()?pos:it.getTablePosition()+","+pos);
                    it.setTableRotation(r.rotated?"0":"1");
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

        // 4) Ár összesítése
        double total = result.stream().mapToDouble(CreatedTables::getPrice).sum();
        work.setWoodPrice(total);
        workRepository.save(work);

        return result;
    }

    // --- segédfüggvények és osztályok ---

private static class FreeRect {
    double x, y, w, h;
    FreeRect(double x, double y, double w, double h) {
        this.x=x; this.y=y; this.w=w; this.h=h;
    }
}

private static class TablePlacement {
    CreatedTables table;
    List<FreeRect> freeRects = new ArrayList<>();
    List<Rect> placed     = new ArrayList<>();
    TablePlacement(CreatedTables t, double sheetW, double sheetH) {
        this.table = t;
        freeRects.add(new FreeRect(0, 0, sheetW, sheetH));
    }
}

// új helyfoglaló
private boolean placeMaxRects(Rect r, TablePlacement tp) {
    class Choice { FreeRect fr; boolean rot; double waste; }
    List<Choice> choices = new ArrayList<>();

    for (FreeRect fr : tp.freeRects) {
      for (boolean rot : new boolean[]{false, true}) {
        if (rot && !r.canRotate) continue;
        double rw = rot ? r.origH : r.origW;
        double rh = rot ? r.origW : r.origH;
        if (rw <= fr.w && rh <= fr.h) {
          double wst = fr.w*fr.h - rw*rh;
          choices.add(new Choice(){{
            this.fr    = fr;
            this.rot   = rot;
            this.waste = wst;
          }});
        }
      }
    }
    if (choices.isEmpty()) return false;
    choices.sort(Comparator.comparingDouble(c -> c.waste));
    Choice best = choices.get(0);

    r.x       = best.fr.x;
    r.y       = best.fr.y;
    r.rotated = best.rot;
    tp.placed.add(r);

    // split-eljárás
    List<FreeRect> newFree = new ArrayList<>();
    for (FreeRect fr : tp.freeRects) {
      if (!intersect(fr, r)) {
        newFree.add(fr);
      } else {
        // jobbra eső maradék
        if (r.x + r.getW() < fr.x + fr.w) {
          newFree.add(new FreeRect(
            r.x + r.getW(), fr.y,
            fr.x + fr.w - (r.x + r.getW()), fr.h));
        }
        // alatta eső maradék
        if (r.y + r.getH() < fr.y + fr.h) {
          newFree.add(new FreeRect(
            fr.x, r.y + r.getH(),
            fr.w, fr.y + fr.h - (r.y + r.getH())));
        }
      }
    }
    tp.freeRects = pruneFreeList(newFree);
    return true;
}




private boolean intersect(FreeRect fr, Rect r) {
    return !(r.x >= fr.x + fr.w || r.x + r.getW() <= fr.x || 
             r.y >= fr.y + fr.h || r.y + r.getH() <= fr.y);
}

// kiszűri az egymást tartalmazó vagy átfedő freeRecteket, nehogy robbanjon a lista
private List<FreeRect> pruneFreeList(List<FreeRect> list) {
    List<FreeRect> out = new ArrayList<>(list);
    for (int i = 0; i < out.size(); i++) {
        for (int j = i+1; j < out.size(); j++) {
            FreeRect a = out.get(i), b = out.get(j);
            if (contains(a,b)) { out.remove(j--); }
            else if (contains(b,a)) { out.remove(i--); break; }
        }
    }
    return out;
}
private boolean contains(FreeRect a, FreeRect b) {
    return a.x <= b.x && a.y <= b.y && a.x + a.w >= b.x + b.w && a.y + a.h >= b.y + b.h;
}


    private boolean invalidDim(String d){
        return d==null||!d.startsWith("[")||!d.contains(",");
    }
    private double parseDim(String s,int idx){
        String[] p=s.replaceAll("\\[|\\]","").split(",");
        return Double.parseDouble(p[idx].trim());
    }
    private CreatedTables createNewTable(Work w,Color c,String dim){
        CreatedTables t=new CreatedTables();
        t.setWork(w); t.setColor(c); t.setSize(dim);
        t.setPrice(Optional.ofNullable(c.getPrice()).orElse(0.0));
        return t;
    }
}
