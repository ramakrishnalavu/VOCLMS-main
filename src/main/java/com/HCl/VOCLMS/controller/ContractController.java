package com.HCl.VOCLMS.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.HCl.VOCLMS.entity.Contract;
import com.HCl.VOCLMS.service.ContractService;

@RestController
@RequestMapping("/api/contracts")
@CrossOrigin(origins = "*") // for frontend later
public class ContractController {

    @Autowired
    private ContractService contractService;

    @PostMapping("/{vendorId}")
    public Contract create(@PathVariable Long vendorId,
                           @RequestBody Contract contract) {
        return contractService.createContract(vendorId, contract);
    }

    @GetMapping
    public List<Contract> getAll() {
        return contractService.getAllContracts();
    }

    @PutMapping("/{id}/submit")
    public Contract submit(@PathVariable Long id) {
        return contractService.submitForApproval(id);
    }

    
    @PutMapping("/{id}/approve")
    public Contract approve(@PathVariable Long id, @org.springframework.web.bind.annotation.RequestParam(required = false) String username) {
        return contractService.approveContract(id, username);
    }

    @PutMapping("/{id}/reject")
    public Contract reject(@PathVariable Long id, @org.springframework.web.bind.annotation.RequestParam(required = false) String username) {
        return contractService.rejectContract(id, username);
    }

    @GetMapping("/payment-terms")
    public List<Contract> getPaymentTerms() {
        return contractService.getAllContracts();
    }

    @PutMapping("/payment-terms/{id}/{action}")
    public Contract updatePaymentTerms(@PathVariable Long id, @PathVariable String action, @RequestBody Map<String, String> body) {
        return contractService.updatePaymentTerms(id, action, body != null ? body.get("remarks") : null, body != null ? body.get("paymentTerm") : null);
    }
}