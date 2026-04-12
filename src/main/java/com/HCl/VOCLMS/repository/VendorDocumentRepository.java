package com.HCl.VOCLMS.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.HCl.VOCLMS.entity.VendorDocument;

public interface VendorDocumentRepository extends JpaRepository<VendorDocument, Long> {

    List<VendorDocument> findByVendorId(Long vendorId);
}