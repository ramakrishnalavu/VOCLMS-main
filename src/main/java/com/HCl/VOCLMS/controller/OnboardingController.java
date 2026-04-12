package com.HCl.VOCLMS.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.HCl.VOCLMS.entity.OnboardingWorkflow;
import com.HCl.VOCLMS.service.OnboardingService;

@RestController
@RequestMapping("/api/onboarding")
@CrossOrigin(origins = "*")
public class OnboardingController {

    @Autowired
    private OnboardingService onboardingService;

    // Start workflow
    @PostMapping("/start/{vendorId}")
    public OnboardingWorkflow start(@PathVariable Long vendorId) {
        return onboardingService.startWorkflow(vendorId);
    }

    // Approve stage
    @PutMapping("/{vendorId}/approve")
    public OnboardingWorkflow approve(
            @PathVariable Long vendorId,
            @RequestParam String stage) {

        return onboardingService.approveStage(vendorId, stage);
    }
}