package com.HCl.VOCLMS.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.HCl.VOCLMS.entity.VendorPerformanceLog;
import com.HCl.VOCLMS.service.VendorPerformanceService;

@RestController
@RequestMapping("/api/vendors/performance")
@CrossOrigin(origins = "*")
public class VendorPerformanceController {

    @Autowired
    private VendorPerformanceService perfService;

    @GetMapping
    public List<Map<String, Object>> getAll() {
        return perfService.getAll().stream().map(log -> {
            Map<String, Object> m = new java.util.LinkedHashMap<>();
            m.put("id", log.getId());
            m.put("vendorId", log.getVendor() != null ? log.getVendor().getId() : null);
            m.put("companyName", log.getVendor() != null ? log.getVendor().getCompanyName() : null);
            m.put("metric", log.getMetric());
            m.put("score", log.getScore());
            m.put("evaluatedBy", log.getEvaluatedBy() != null ? log.getEvaluatedBy().getName() : null);
            m.put("evaluationDate", log.getEvaluationDate());
            m.put("remarks", log.getRemarks());
            return m;
        }).collect(Collectors.toList());
    }

    @PostMapping
    public VendorPerformanceLog create(@RequestBody Map<String, Object> body) {
        Long vendorId = Long.parseLong(body.get("vendorId").toString());
        String metric = (String) body.get("metric");
        Integer score = Integer.parseInt(body.get("score").toString());
        String remarks = (String) body.get("remarks");
        return perfService.create(vendorId, metric, score, remarks);
    }
}
