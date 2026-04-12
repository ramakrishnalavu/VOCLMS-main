package com.HCl.VOCLMS.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.HCl.VOCLMS.entity.VendorPerformanceLog;

public interface VendorPerformanceLogRepository extends JpaRepository<VendorPerformanceLog, Long> {
    List<VendorPerformanceLog> findByVendorId(Long vendorId);
}
