package com.HCl.VOCLMS.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PostLoad;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "vendors")
public class Vendor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String companyName;
    private String registrationNumber;
    private String panNumber;
    private String vendorType;
    private String category;
    private String address;
    private String phone;
    private String email;
    private String status;

    private String currentStage = "PROCUREMENT_REVIEW";
    private String stageStatus = "PENDING";
    private String assignedTo = "PROCUREMENT_OFFICER";
    private String remarks;
    private java.time.LocalDateTime updatedAt = java.time.LocalDateTime.now();

    @PostLoad
    private void onLoad() {
        if (currentStage == null) currentStage = "PROCUREMENT_REVIEW";
        if (stageStatus == null) stageStatus = "PENDING";
        if (assignedTo == null) assignedTo = "PROCUREMENT_OFFICER";
    }
}
