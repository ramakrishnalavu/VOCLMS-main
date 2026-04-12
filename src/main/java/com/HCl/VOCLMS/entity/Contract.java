package com.HCl.VOCLMS.entity;
import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "contracts")
public class Contract {
   @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String contractNumber;
    private String contractType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String renewalType;
    private Double value;
    private String status;

    @ManyToOne
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;

    private String approvedBy;

    // Payment Terms & Finance fields
    private String financeStatus = "PENDING";
    private String paymentTerm = "Net 30";
    private Double gstPercentage = 18.0;
    private String penaltyClause = "Standard";
    private String financeRemarks;
    private java.time.LocalDate approvedAt;
}
