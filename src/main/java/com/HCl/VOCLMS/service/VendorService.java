package com.HCl.VOCLMS.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.HCl.VOCLMS.entity.Vendor;
import com.HCl.VOCLMS.repository.VendorRepository;

@Service
public class VendorService {

    @Autowired
    private VendorRepository vendorRepository;

    // Register Vendor
    public Vendor registerVendor(Vendor vendor) {
        vendor.setStatus("REGISTERED");
        return vendorRepository.save(vendor);
    }

    // Get all vendors
    public List<Vendor> getAllVendors() {
        return vendorRepository.findAll();
    }

    // Get vendors by status
    public List<Vendor> getByStatus(String status) {
        return vendorRepository.findByStatus(status);
    }

    // Approve Vendor
    public Vendor approveVendor(Long id) {
        Vendor vendor = vendorRepository.findById(id).orElseThrow();
        vendor.setStatus("APPROVED");
        return vendorRepository.save(vendor);
    }

    // Start Review
    public Vendor startReview(Long id) {
        Vendor vendor = vendorRepository.findById(id).orElseThrow();
        vendor.setStatus("UNDER_REVIEW");
        return vendorRepository.save(vendor);
    }

    // Reject Vendor
    public Vendor rejectVendor(Long id) {
        Vendor vendor = vendorRepository.findById(id).orElseThrow();
        vendor.setStatus("REJECTED");
        return vendorRepository.save(vendor);
    }

    // Update Workflow
    public Vendor updateWorkflow(Long id, String action, String remarks) {
        Vendor vendor = vendorRepository.findById(id).orElseThrow();
        vendor.setRemarks(remarks);
        vendor.setUpdatedAt(java.time.LocalDateTime.now());
        
        if ("approve".equals(action)) {
            if ("PROCUREMENT_REVIEW".equals(vendor.getCurrentStage())) {
                vendor.setCurrentStage("LEGAL_VERIFICATION");
                vendor.setAssignedTo("LEGAL_TEAM");
                vendor.setStageStatus("PENDING");
            } else if ("LEGAL_VERIFICATION".equals(vendor.getCurrentStage())) {
                vendor.setCurrentStage("FINANCE_APPROVAL");
                vendor.setAssignedTo("FINANCE_TEAM");
                vendor.setStageStatus("PENDING");
            } else if ("FINANCE_APPROVAL".equals(vendor.getCurrentStage())) {
                vendor.setCurrentStage("COMPLETED");
                vendor.setAssignedTo("SYSTEM");
                vendor.setStageStatus("APPROVED");
                vendor.setStatus("APPROVED");
            }
        } else if ("reject".equals(action)) {
            vendor.setStageStatus("REJECTED");
            vendor.setStatus("REJECTED");
        }
        
        return vendorRepository.save(vendor);
    }
}