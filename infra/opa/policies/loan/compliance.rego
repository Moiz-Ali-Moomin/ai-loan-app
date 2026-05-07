package loan.compliance

import future.keywords.in
import future.keywords.if
import future.keywords.contains

# ============================================================
# Regulatory Compliance Policy
# Ensures loan decisions comply with relevant regulations
# ============================================================

default compliant := true

compliance_violations contains {
    "regulation": "ECOA",
    "rule": "fair_lending",
    "message": "Loan decision cannot be based on protected characteristics",
    "severity": "CRITICAL"
} if {
    # Ensure no protected-class attributes drive the decision
    # In a real system, check the model's feature importance
    input.decisionFactors != null
    "race" in input.decisionFactors
}

compliance_violations contains {
    "regulation": "TILA",
    "rule": "disclosure_required",
    "message": "Truth in Lending disclosures required for loans over $25,000",
    "severity": "HIGH"
} if {
    input.loan.requestedAmount > 25000
    not input.tilaDisclosureProvided
}

compliance_violations contains {
    "regulation": "BSA_AML",
    "rule": "large_cash_transaction",
    "message": "Large cash transactions require SAR filing under BSA/AML",
    "severity": "HIGH"
} if {
    input.loan.requestedAmount >= 10000
    input.loan.fundingMethod == "CASH"
}

compliance_violations contains {
    "regulation": "FCRA",
    "rule": "adverse_action_notice",
    "message": "Adverse action notice required when credit report is used for rejection",
    "severity": "HIGH"
} if {
    input.decision == "REJECT"
    input.creditReportUsed == true
    not input.adverseActionNoticeScheduled
}

compliant if {
    count([v | v := compliance_violations[_]; v.severity == "CRITICAL"]) == 0
}

required_actions contains "GENERATE_ADVERSE_ACTION_NOTICE" if {
    some v in compliance_violations
    v.regulation == "FCRA"
}

required_actions contains "FILE_SAR" if {
    some v in compliance_violations
    v.regulation == "BSA_AML"
}

required_actions contains "SEND_TILA_DISCLOSURE" if {
    some v in compliance_violations
    v.regulation == "TILA"
}
