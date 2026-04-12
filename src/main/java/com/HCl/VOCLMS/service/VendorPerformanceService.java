package com.HCl.VOCLMS.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.HCl.VOCLMS.entity.Vendor;
import com.HCl.VOCLMS.entity.VendorPerformanceLog;
import com.HCl.VOCLMS.repository.VendorPerformanceLogRepository;
import com.HCl.VOCLMS.repository.VendorRepository;

@Service
public class VendorPerformanceService {

    @Autowired
    private VendorPerformanceLogRepository perfRepo;

    @Autowired
    private VendorRepository vendorRepo;

    public List<VendorPerformanceLog> getAll() {
        return perfRepo.findAll();
    }

    public List<VendorPerformanceLog> getByVendor(Long vendorId) {
        return perfRepo.findByVendorId(vendorId);
    }

    public VendorPerformanceLog create(Long vendorId, String metric, Integer score, String remarks) {
        Vendor vendor = vendorRepo.findById(vendorId).orElseThrow(() -> new RuntimeException("Vendor not found"));

        VendorPerformanceLog log = new VendorPerformanceLog();
        log.setVendor(vendor);
        log.setMetric(metric);
        log.setScore(score);
        log.setRemarks(remarks);
        log.setEvaluationDate(LocalDate.now());

        return perfRepo.save(log);
    }
}
