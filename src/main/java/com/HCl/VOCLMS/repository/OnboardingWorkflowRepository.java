package com.HCl.VOCLMS.repository;

import com.HCl.VOCLMS.entity.OnboardingWorkflow;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OnboardingWorkflowRepository extends JpaRepository<OnboardingWorkflow, Long> {

    OnboardingWorkflow findByVendorId(Long vendorId);
}