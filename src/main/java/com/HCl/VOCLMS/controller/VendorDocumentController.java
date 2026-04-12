package com.HCl.VOCLMS.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.List;

import com.HCl.VOCLMS.entity.VendorDocument;
import com.HCl.VOCLMS.service.VendorDocumentService;

@RestController
@RequestMapping("/api/vendor-documents")
@CrossOrigin(origins = "*")
public class VendorDocumentController {

    @Autowired
    private VendorDocumentService service;

    
    @PostMapping
    public VendorDocument upload(@RequestBody VendorDocument doc) {
        return service.upload(doc);
    }

    @GetMapping
    public List<VendorDocument> getAll() {
        return service.getAll();
    }

    
    @PutMapping("/{id}/verify")
    public VendorDocument verify(@PathVariable Long id) {
        return service.verify(id);
    }

    
    @PutMapping("/{id}/reject")
    public VendorDocument reject(@PathVariable Long id) {
        return service.reject(id);
    }
}