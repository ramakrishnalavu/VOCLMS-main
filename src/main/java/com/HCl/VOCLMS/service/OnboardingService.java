package com.HCl.VOCLMS.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.HCl.VOCLMS.entity.OnboardingWorkflow;
import com.HCl.VOCLMS.entity.Vendor;
import com.HCl.VOCLMS.repository.OnboardingWorkflowRepository;
import com.HCl.VOCLMS.repository.VendorRepository;

@Service
public class OnboardingService {

    @Autowired
    private OnboardingWorkflowRepository workflowRepo;

    @Autowired
    private VendorRepository vendorRepo;

    public OnboardingWorkflow startWorkflow(Long vendorId) {
        Vendor vendor = vendorRepo.findById(vendorId).orElseThrow();

        OnboardingWorkflow workflow = new OnboardingWorkflow();
        workflow.setVendor(vendor);
        workflow.setCurrentStage("PROCUREMENT");
        workflow.setStageStatus("PENDING");

        return workflowRepo.save(workflow);
    }

    public OnboardingWorkflow approveStage(Long vendorId, String stage) {

        OnboardingWorkflow workflow = workflowRepo.findByVendorId(vendorId);

        if (stage.equals("PROCUREMENT")) {
            workflow.setCurrentStage("LEGAL");
        } else if (stage.equals("LEGAL")) {
            workflow.setCurrentStage("FINANCE");
        } else if (stage.equals("FINANCE")) {
            workflow.setCurrentStage("COMPLETED");

            // FINAL APPROVAL
            Vendor vendor = workflow.getVendor();
            vendor.setStatus("APPROVED");
            vendorRepo.save(vendor);
        }

        return workflowRepo.save(workflow);
    }
}