package loan.approval

import future.keywords.in
import future.keywords.if
import future.keywords.contains

# ============================================================
# AI Loan Governance Platform — Loan Approval Policy
# Version: 1.0.0
# Last Updated: 2026-05-07
#
# This policy governs automated loan approval decisions.
# All rules are versioned, auditable, and traceable.
# ============================================================

# Thresholds (override via OPA config / bundle data)
default min_credit_score := 580
default max_dti_ratio := 0.45
default min_age := 18
default max_loan_term_months := 360
default manual_review_threshold_amount := 500000
default high_risk_amount_threshold := 1000000
default max_risk_score := 0.8
default escalate_risk_score := 0.65

# ── Primary Decision ──────────────────────────────────────────

default allow := false
default deny := false
default decision := "MANUAL_REVIEW"

allow if {
    count(violations) == 0
    count([f | f := flags[_]; f.requiresAction == "MANUAL_REVIEW"]) == 0
}

deny if {
    some v in violations
    v.severity == "CRITICAL"
}

decision := "DENY" if { deny }
decision := "ALLOW" if { allow; not deny }
decision := "ESCALATE" if {
    some f in flags
    f.requiresAction == "ESCALATE"
    not deny
}
decision := "MANUAL_REVIEW" if {
    not allow
    not deny
}

# ── Hard Violations (CRITICAL — auto-reject) ─────────────────

violations contains {
    "rule": "kyc_required",
    "message": "KYC verification is mandatory for loan processing",
    "severity": "CRITICAL",
    "value": input.applicant.kycVerified,
    "threshold": true
} if {
    not input.applicant.kycVerified
}

violations contains {
    "rule": "min_age_requirement",
    "message": sprintf("Applicant must be at least %d years old", [min_age]),
    "severity": "CRITICAL",
    "value": input.applicant.age,
    "threshold": min_age
} if {
    input.applicant.age < min_age
}

violations contains {
    "rule": "valid_loan_amount",
    "message": "Loan amount must be greater than zero",
    "severity": "CRITICAL",
    "value": input.loan.requestedAmount
} if {
    input.loan.requestedAmount <= 0
}

violations contains {
    "rule": "min_credit_score_requirement",
    "message": sprintf("Credit score %d is below minimum required score of %d", [input.applicant.creditScore, min_credit_score]),
    "severity": "HIGH",
    "value": input.applicant.creditScore,
    "threshold": min_credit_score
} if {
    input.applicant.creditScore < min_credit_score
}

violations contains {
    "rule": "max_dti_ratio_exceeded",
    "message": sprintf("Debt-to-income ratio %.2f exceeds maximum allowed %.2f", [dti_ratio, max_dti_ratio]),
    "severity": "HIGH",
    "value": dti_ratio,
    "threshold": max_dti_ratio
} if {
    dti_ratio > max_dti_ratio
}

violations contains {
    "rule": "unemployment_restriction",
    "message": "Applicants with UNEMPLOYED status cannot apply for loans over $10,000",
    "severity": "HIGH",
    "value": input.applicant.employmentStatus
} if {
    input.applicant.employmentStatus == "UNEMPLOYED"
    input.loan.requestedAmount > 10000
}

violations contains {
    "rule": "max_loan_term_exceeded",
    "message": sprintf("Requested term %d months exceeds maximum %d months", [input.loan.termMonths, max_loan_term_months]),
    "severity": "MEDIUM",
    "value": input.loan.termMonths,
    "threshold": max_loan_term_months
} if {
    input.loan.termMonths > max_loan_term_months
}

violations contains {
    "rule": "risk_score_too_high",
    "message": sprintf("AI risk score %.3f exceeds maximum allowed %.3f", [input.riskScore, max_risk_score]),
    "severity": "HIGH",
    "value": input.riskScore,
    "threshold": max_risk_score
} if {
    input.riskScore != null
    input.riskScore > max_risk_score
}

# ── Soft Flags (require human review or escalation) ───────────

flags contains {
    "rule": "high_value_loan_manual_review",
    "message": sprintf("Loan amount $%.0f requires manual approval", [input.loan.requestedAmount]),
    "requiresAction": "MANUAL_REVIEW"
} if {
    input.loan.requestedAmount > manual_review_threshold_amount
}

flags contains {
    "rule": "very_high_value_loan_escalate",
    "message": sprintf("Loan amount $%.0f requires senior approval", [input.loan.requestedAmount]),
    "requiresAction": "ESCALATE"
} if {
    input.loan.requestedAmount > high_risk_amount_threshold
}

flags contains {
    "rule": "elevated_risk_score_review",
    "message": sprintf("AI risk score %.3f requires manual review", [input.riskScore]),
    "requiresAction": "MANUAL_REVIEW"
} if {
    input.riskScore != null
    input.riskScore > escalate_risk_score
    input.riskScore <= max_risk_score
}

flags contains {
    "rule": "low_confidence_review",
    "message": "Low AI decision confidence requires human verification",
    "requiresAction": "MANUAL_REVIEW"
} if {
    input.aiConfidence != null
    input.aiConfidence < 0.6
}

flags contains {
    "rule": "fraud_suspicion_review",
    "message": sprintf("Elevated fraud score %.3f requires manual review", [input.fraudScore]),
    "requiresAction": "MANUAL_REVIEW"
} if {
    input.fraudScore != null
    input.fraudScore > 0.5
    input.fraudScore <= 0.9
}

flags contains {
    "rule": "self_employed_review",
    "message": "Self-employed applicants require additional income verification",
    "requiresAction": "MANUAL_REVIEW"
} if {
    input.applicant.employmentStatus == "SELF_EMPLOYED"
    input.loan.requestedAmount > 100000
}

flags contains {
    "rule": "business_loan_review",
    "message": "Business loans require additional documentation review",
    "requiresAction": "MANUAL_REVIEW"
} if {
    input.loan.loanType == "BUSINESS"
    input.loan.requestedAmount > 250000
}

flags contains {
    "rule": "mortgage_ltv_review",
    "message": "Mortgage LTV ratio requires property appraisal review",
    "requiresAction": "MANUAL_REVIEW"
} if {
    input.loan.loanType == "MORTGAGE"
}

# ── Computed Values ───────────────────────────────────────────

dti_ratio := ratio if {
    input.applicant.annualIncome > 0
    monthly_income := input.applicant.annualIncome / 12
    monthly_debt_payment := input.applicant.existingDebt / 12
    requested_monthly_payment := input.loan.requestedAmount / input.loan.termMonths
    ratio := (monthly_debt_payment + requested_monthly_payment) / monthly_income
} else := 0

# ── Policy Metadata ───────────────────────────────────────────

metadata := {
    "policy_name": "loan_approval",
    "version": "1.0.0",
    "last_updated": "2026-05-07",
    "owner": "risk-team",
    "compliance": ["Basel III", "GDPR", "CRA"],
}
