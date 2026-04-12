package com.HCl.VOCLMS.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

import com.HCl.VOCLMS.entity.VendorDocument;
import com.HCl.VOCLMS.repository.VendorDocumentRepository;

@Service
public class VendorDocumentService {

    @Autowired
    private VendorDocumentRepository repository;

    // 
    public VendorDocument upload(VendorDocument doc) {
        doc.setVerificationStatus("PENDING");
        return repository.save(doc);
    }

    public List<VendorDocument> getAll() {
        return repository.findAll();
    }

    
    public VendorDocument verify(Long id) {
        VendorDocument doc = repository.findById(id).orElseThrow();

        doc.setVerificationStatus("VERIFIED");
        return repository.save(doc);
    }

    
    public VendorDocument reject(Long id) {
        VendorDocument doc = repository.findById(id).orElseThrow();

        doc.setVerificationStatus("REJECTED");
        return repository.save(doc);
    }
}