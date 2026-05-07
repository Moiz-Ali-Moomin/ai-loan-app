package loan.fraud

import future.keywords.in
import future.keywords.if
import future.keywords.contains

# ============================================================
# Fraud Detection Policy
# Evaluates signals that indicate potential fraud risk
# ============================================================

default is_fraudulent := false
default fraud_level := "LOW"

is_fraudulent if {
    fraud_score > 0.9
}

fraud_level := "CRITICAL" if { fraud_score > 0.9 }
fraud_level := "HIGH"     if { fraud_score > 0.7; fraud_score <= 0.9 }
fraud_level := "MEDIUM"   if { fraud_score > 0.5; fraud_score <= 0.7 }
fraud_level := "LOW"      if { fraud_score <= 0.5 }

fraud_signals contains "kyc_not_verified" if {
    not input.applicant.kycVerified
}

fraud_signals contains "income_inconsistency" if {
    input.applicant.annualIncome > 0
    input.loan.requestedAmount > input.applicant.annualIncome * 10
}

fraud_signals contains "multiple_recent_applications" if {
    input.applicant.recentApplicationCount != null
    input.applicant.recentApplicationCount > 3
}

fraud_signals contains "address_mismatch" if {
    input.applicant.addressMismatch == true
}

fraud_signals contains "suspicious_employment" if {
    input.applicant.employmentStatus == "UNEMPLOYED"
    input.applicant.annualIncome > 100000
}

fraud_score := score if {
    base_score := count(fraud_signals) * 0.2
    score := min([base_score, 1.0])
} else := 0.0

recommendation := "BLOCK"  if { is_fraudulent }
recommendation := "REVIEW" if { fraud_score > 0.5; not is_fraudulent }
recommendation := "PASS"   if { fraud_score <= 0.5 }
