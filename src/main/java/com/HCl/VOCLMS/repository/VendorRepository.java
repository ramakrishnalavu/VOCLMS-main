package com.HCl.VOCLMS.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.HCl.VOCLMS.entity.Vendor;

public interface VendorRepository extends JpaRepository<Vendor, Long> {

    List<Vendor> findByStatus(String status);
}