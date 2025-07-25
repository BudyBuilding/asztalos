// TableOptimizationService.java
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
                boolean placed=false;
                for (TablePlacement tp : packs) {
                    if (place(r,tp,sheetW,sheetH)) { placed=true; break; }
                }
                if (!placed) {
                    CreatedTables ct = nextTable.get();
                    result.add(ct);
                    TablePlacement tp = new TablePlacement(ct,sheetW);
                    place(r,tp,sheetW,sheetH);
                    packs.add(tp);
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
        }

        // 4) Ár összesítése
        double total = result.stream().mapToDouble(CreatedTables::getPrice).sum();
        work.setWoodPrice(total);
        workRepository.save(work);

        return result;
    }

    // --- segédfüggvények és osztályok ---

    private static class TablePlacement {
        CreatedTables table;
        double[] skyline;
        List<Rect> placed = new ArrayList<>();
        TablePlacement(CreatedTables t, double sheetW) {
            this.table = t;
            this.skyline = new double[(int)Math.ceil(sheetW)];
        }
    }

    private boolean place(Rect r, TablePlacement tp, double sheetW, double sheetH) {
        double bestY=Double.MAX_VALUE; int bestX=-1; boolean bestRot=false;
        int bestW=0, bestH=0, maxX=(int)Math.floor(sheetW);

        for (boolean rot: new boolean[]{false,true}) {
            if (rot && !r.canRotate) continue;
            int w=(int)Math.ceil(rot?r.origH:r.origW);
            int h=(int)Math.ceil(rot?r.origW:r.origH);
            for(int x=0;x<=maxX-w;x++){
                double y=0;
                for(int i=0;i<w;i++) y=Math.max(y,tp.skyline[x+i]);
                if(y+h<=sheetH && y<bestY && !overlaps(x,y,w,h,tp.placed)){
                    bestY=y; bestX=x; bestRot=rot; bestW=w; bestH=h;
                }
            }
        }
        if(bestX<0) return false;
        r.x=bestX; r.y=bestY; r.rotated=bestRot;
        for(int i=0;i<bestW;i++) tp.skyline[bestX+i]=bestY+bestH;
        tp.placed.add(r);

                log.debug("Placed Rect id={} at ({},{}), rotated={}, size={}x{} on Table {}",
                  r.id, r.x, r.y, r.rotated, bestW, bestH, tp.table.getId());

        return true;
    }

    private boolean overlaps(double x,double y,int w,int h,List<Rect> placed){
        for(Rect p:placed){
            if(x< p.x+p.getW() && x+w>p.x && y< p.y+p.getH() && y+h>p.y) return true;
        }
        return false;
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
