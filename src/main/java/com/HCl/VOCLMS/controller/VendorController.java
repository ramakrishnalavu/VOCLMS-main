package com.HCl.VOCLMS.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

import com.HCl.VOCLMS.entity.Vendor;
import com.HCl.VOCLMS.service.VendorService;

@RestController
@RequestMapping("/api/vendors")
@CrossOrigin(origins = "*") 
public class VendorController {

    @Autowired
    private VendorService vendorService;

    // Register vendor
    @PostMapping("/register")
    public Vendor register(@RequestBody Vendor vendor) {
        return vendorService.registerVendor(vendor);
    }

    // Get all vendors
    @GetMapping
    public List<Vendor> getAll() {
        return vendorService.getAllVendors();
    }

    // Get vendors by status
    @GetMapping("/status")
    public List<Vendor> getByStatus(@RequestParam String status) {
        return vendorService.getByStatus(status);
    }

    // Approve vendor
    // Approve vendor (Bypass - Legacy/Admin)
    @PutMapping("/{id}/approve")
    public Vendor approve(@PathVariable Long id) {
        return vendorService.approveVendor(id);
    }

    // Start Review Workflow
    @PutMapping("/{id}/start-review")
    public Vendor startReview(@PathVariable Long id) {
        return vendorService.startReview(id);
    }

    // Reject vendor
    @PutMapping("/{id}/reject")
    public Vendor reject(@PathVariable Long id) {
        return vendorService.rejectVendor(id);
    }

    // Get Workflow Data
    @GetMapping("/workflow")
    public List<Vendor> getWorkflow() {
        return vendorService.getAllVendors().stream()
                .filter(v -> !"REGISTERED".equals(v.getStatus()) && !"BLACKLISTED".equals(v.getStatus()) && !"INACTIVE".equals(v.getStatus()))
                .collect(java.util.stream.Collectors.toList());
    }

    // Update Workflow Stage
    @PutMapping("/workflow/{id}/{action}")
    public Vendor updateWorkflow(@PathVariable Long id, @PathVariable String action, @RequestBody Map<String, String> body) {
        return vendorService.updateWorkflow(id, action, body != null ? body.get("remarks") : null);
    }
}