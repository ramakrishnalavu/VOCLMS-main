package com.HCl.VOCLMS.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.HCl.VOCLMS.entity.Contract;
import com.HCl.VOCLMS.entity.Vendor;
import com.HCl.VOCLMS.repository.ContractRepository;
import com.HCl.VOCLMS.repository.VendorRepository;

@Service
public class ContractService {

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private VendorRepository vendorRepository;

    public java.util.List<Contract> getAllContracts() {
        return contractRepository.findAll();
    }

    public Contract createContract(Long vendorId, Contract contract) {

        Vendor vendor = vendorRepository.findById(vendorId).orElseThrow();

        // Business Rule: Vendor must be approved
        if (!vendor.getStatus().equals("APPROVED")) {
            throw new RuntimeException("Vendor not approved");
        }

        // Validation Rules
        if (contract.getValue() == null || contract.getValue() <= 0) {
            throw new RuntimeException("Contract value must be greater than 0");
        }
        if (contract.getStartDate() != null && contract.getEndDate() != null && !contract.getEndDate().isAfter(contract.getStartDate())) {
            throw new RuntimeException("Contract end date must be after start date");
        }

        contract.setVendor(vendor);
        contract.setStatus("DRAFT");
        contract.setFinanceStatus("PENDING");

        return contractRepository.save(contract);
    }

    public Contract submitForApproval(Long contractId) {
        Contract contract = contractRepository.findById(contractId).orElseThrow();

        if (!contract.getStatus().equals("DRAFT")) {
            throw new RuntimeException("Only DRAFT contracts can be submitted");
        }

        contract.setStatus("PENDING_APPROVAL");
        return contractRepository.save(contract);
    }

    public Contract approveContract(Long contractId, String username) {
        Contract contract = contractRepository.findById(contractId).orElseThrow();

        if (!contract.getStatus().equals("PENDING_APPROVAL")) {
            throw new RuntimeException("Contract not in approval stage");
        }

        contract.setStatus("ACTIVE"); // Jump straight to active upon approval
        if (username != null) contract.setApprovedBy(username);
        return contractRepository.save(contract);
    }

    public Contract rejectContract(Long contractId, String username) {
        Contract contract = contractRepository.findById(contractId).orElseThrow();

        if (!contract.getStatus().equals("PENDING_APPROVAL")) {
            throw new RuntimeException("Contract not in approval stage");
        }

        contract.setStatus("REJECTED");
        if (username != null) contract.setApprovedBy(username);
        return contractRepository.save(contract);
    }

    public Contract updatePaymentTerms(Long contractId, String action, String remarks, String paymentTerm) {
        Contract contract = contractRepository.findById(contractId).orElseThrow();
        contract.setFinanceRemarks(remarks);
        contract.setPaymentTerm(paymentTerm != null ? paymentTerm : contract.getPaymentTerm());
        
        if ("approve".equals(action)) {
            contract.setFinanceStatus("APPROVED");
            contract.setApprovedAt(java.time.LocalDate.now());
        } else {
            contract.setFinanceStatus("REJECTED");
        }
        return contractRepository.save(contract);
    }

    public Contract activateContract(Long id) {
        Contract contract = contractRepository.findById(id).orElseThrow();

        if (!contract.getStatus().equals("APPROVED")) {
            throw new RuntimeException("Contract must be approved before activation");
        }

        contract.setStatus("ACTIVE");
        return contractRepository.save(contract);
    }
}