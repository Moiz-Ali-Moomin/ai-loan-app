// ============================================================
// Sample fintech compliance dataset for vector store seeding.
// Each entry represents a policy document that will be chunked,
// embedded, and stored in document_embeddings.
//
// Sources are illustrative of actual regulatory frameworks:
//   - RBI Master Direction — KYC 2016 (as amended)
//   - FATF Recommendations 40 — AML/CFT
//   - Internal SOP and risk policy templates
//   - EU AML Directive excerpts
// ============================================================

import type { DocumentIngestionRequest } from '@loan-platform/shared-types';

export const COMPLIANCE_DOCUMENTS: Omit<DocumentIngestionRequest, 'tenantId'>[] = [

  // ── 1. RBI KYC MASTER DIRECTION ─────────────────────────
  {
    documentType: 'kyc_guideline',
    source: 'RBI-MD-KYC-2016-amended-2023',
    title: 'RBI Master Direction — Know Your Customer (KYC) Direction 2016 (Consolidated)',
    metadata: {
      jurisdiction: 'IN',
      regulatoryBody: 'RBI',
      policyVersion: '2023-amendment',
      effectiveDate: '2023-11-09',
      confidentiality: 'internal',
      tags: ['kyc', 'cdd', 'customer-due-diligence', 'identity-verification'],
    },
    content: `
RESERVE BANK OF INDIA — MASTER DIRECTION — KNOW YOUR CUSTOMER (KYC) DIRECTION 2016

CHAPTER I — PRELIMINARY

1. Short Title and Commencement
These Directions shall be called the Reserve Bank of India (Know Your Customer (KYC)) Directions, 2016. They shall come into force with immediate effect.

2. Applicability
These Directions are applicable to all Regulated Entities (REs) including commercial banks, small finance banks, payment banks, cooperative banks, NBFCs, and all other entities regulated by the Reserve Bank of India.

3. Definitions
"Customer" means a person or entity that maintains an account or has a business relationship with a Regulated Entity, or any person or entity on whose behalf a transaction is conducted, or any person or entity connected with a financial transaction which can pose significant reputational or other risks to the RE.

"Customer Due Diligence (CDD)" refers to the process of identifying and verifying the identity of a customer, understanding the nature of their financial activities, and assessing the risk associated with the business relationship.

"Politically Exposed Person (PEP)" means individuals who are or have been entrusted with prominent public functions domestically or by a foreign country, including Heads of States or Governments, senior politicians, senior government or judicial officials, senior military officials, senior executives of state-owned corporations, and important political party officials.

"Beneficial Owner" means the natural person(s) who ultimately own or control a customer and/or the person on whose behalf a transaction is being conducted, including those who exercise ultimate effective control over a legal person or arrangement.

CHAPTER II — CUSTOMER ACCEPTANCE POLICY

4. Customer Acceptance Policy
Every RE shall formulate a Customer Acceptance Policy (CAP) clearly laying down criteria for the acceptance of customers and the documentation required to be obtained.

The CAP shall:
(i) Not allow the opening of accounts or maintenance of accounts for anonymous or fictitious names or persons.
(ii) Require the customer to provide documentary evidence of identity and address before commencement of a business relationship.
(iii) Not be unnecessarily restrictive so as to deny access to financial services to sections of the population who may not be in a position to produce full documentation.
(iv) Specify the circumstances in which enhanced due diligence is required.

5. Risk Categorisation
All customers shall be categorised into three risk categories:
- LOW RISK: Individuals with small account turnover, limited transactions
- MEDIUM RISK: Customers requiring standard CDD with regular monitoring
- HIGH RISK: PEPs, customers from high-risk geographies, high transaction volumes, unusual patterns

High risk customers shall be subjected to Enhanced Due Diligence (EDD).

CHAPTER III — CUSTOMER IDENTIFICATION PROCEDURES

6. Identification Documents — Individuals
For individual customers, the following Officially Valid Documents (OVDs) are acceptable:
(a) Passport
(b) Driving Licence
(c) Voter Identity Card issued by the Election Commission of India
(d) Proof of possession of Aadhaar number (where Aadhaar-based e-KYC is used)
(e) Job Card issued by NREGA duly signed by an officer of the State Government
(f) Letter issued by the National Population Register
(g) PAN Card — for financial transactions above INR 50,000

7. Identification Documents — Legal Entities
For legal entities (companies, partnerships, trusts), the following are required:
(a) Certificate of incorporation or registration
(b) Memorandum of Association and Articles of Association
(c) Permanent Account Number (PAN) of the entity
(d) List of beneficial owners with >25% ownership
(e) Resolution of the board of directors

8. Video-Based Customer Identification Process (V-CIP)
REs may use V-CIP as an alternative to physical verification. V-CIP must:
(a) Use a live video interaction with the customer
(b) Verify OVD using facial recognition
(c) Obtain consent from the customer
(d) Record and store the interaction for regulatory audit trail

9. Aadhaar-Based e-KYC
REs are permitted to conduct Aadhaar-based e-KYC where:
(a) The customer voluntarily provides Aadhaar number
(b) Biometric or OTP-based authentication is used
(c) The UIDAI authentication is successful
Aadhaar-based e-KYC is not mandatory and customers may opt for OVD-based verification.

CHAPTER IV — ENHANCED DUE DILIGENCE

10. Enhanced Due Diligence (EDD) Requirements
EDD shall be applied to:
(a) Politically Exposed Persons and their family members/close associates
(b) Non-face-to-face (NFTF) customers
(c) Countries identified as high-risk by FATF
(d) Customers with unusual account activity inconsistent with their known profile
(e) Customers in high-risk business segments

11. Ongoing Due Diligence
REs shall conduct ongoing due diligence of the business relationship including:
(a) Scrutiny of transactions during the course of the relationship to ensure consistency with the RE's knowledge of the customer, business and risk profile
(b) Periodic updation of customer identification data

Review frequency:
- High risk customers: at least every 2 years
- Medium risk customers: at least every 8 years
- Low risk customers: at least every 10 years

CHAPTER V — RECORD-KEEPING

12. Retention of Records
All CDD data, account files, and business correspondence shall be retained for:
(a) Minimum 5 years after the termination of a business relationship, OR
(b) Minimum 5 years after the date of the transaction
Records must be stored in a manner that enables reconstruction of individual transactions and provides evidence for prosecution.
    `.trim(),
  },

  // ── 2. AML POLICY ─────────────────────────────────────────
  {
    documentType: 'aml_policy',
    source: 'FATF-R40-AML-CFT-2012-2023',
    title: 'FATF Recommendations — Anti-Money Laundering and Counter Financing of Terrorism Framework',
    metadata: {
      jurisdiction: 'GLOBAL',
      regulatoryBody: 'FATF',
      policyVersion: '2023-revision',
      effectiveDate: '2023-10-01',
      confidentiality: 'internal',
      tags: ['aml', 'cft', 'suspicious-activity', 'sar', 'transaction-monitoring'],
    },
    content: `
FATF RECOMMENDATIONS — ANTI-MONEY LAUNDERING AND COUNTER-TERRORIST FINANCING

RECOMMENDATION 1: RISK-BASED APPROACH

Countries and financial institutions should identify, assess, and understand the money laundering and terrorist financing risks to which they are exposed, and take appropriate action to mitigate those risks. Countries should apply a risk-based approach (RBA) to ensure that measures to prevent or mitigate money laundering and terrorist financing are commensurate with the risks identified.

Financial institutions should apply enhanced measures for higher-risk business relationships and transactions, and simplified measures where risks are demonstrably lower.

RECOMMENDATION 10: CUSTOMER DUE DILIGENCE

Financial institutions should be prohibited from keeping anonymous accounts or accounts in obviously fictitious names.

Financial institutions should be required to undertake customer due diligence measures when:
(a) Establishing business relations
(b) Carrying out occasional transactions above USD/EUR 15,000 or equivalent
(c) There is a suspicion of money laundering or terrorist financing
(d) There is doubt about the veracity or adequacy of previously obtained identification data

CDD measures include:
(i) Identifying the customer and verifying their identity using reliable, independent source documents, data or information
(ii) Identifying the beneficial owner and taking reasonable measures to verify the identity of the beneficial owner
(iii) Understanding and obtaining information on the purpose and intended nature of the business relationship
(iv) Conducting ongoing due diligence on the business relationship

RECOMMENDATION 20: REPORTING OF SUSPICIOUS TRANSACTIONS

If a financial institution suspects or has reasonable grounds to suspect that funds are the proceeds of a criminal activity, or are related to terrorist financing, it should be required by law to report promptly to the Financial Intelligence Unit (FIU).

Key indicators of suspicious transactions:
- Transactions that are inconsistent with a customer's known legitimate business activities
- Unusually large cash deposits or withdrawals
- Multiple transactions just below reporting thresholds (structuring)
- Rapid movement of funds through multiple accounts
- Transactions involving high-risk geographies without clear business rationale
- Reluctance to provide identification or information about the business purpose
- Complex or unusual ownership structures without clear economic rationale

RECOMMENDATION 29: FINANCIAL INTELLIGENCE UNITS

Countries should establish a Financial Intelligence Unit (FIU) to serve as the national centre for receiving, analysing, and disseminating disclosures of financial information.

LOAN-SPECIFIC AML CONSIDERATIONS

For lending institutions, additional AML red flags include:
1. Loan proceeds used for purposes inconsistent with the stated purpose at application
2. Early loan repayment with funds from unexpected or unverified sources
3. Collateral that is significantly overvalued or of questionable provenance
4. Multiple applications from the same entity for similar amounts to different institutions
5. Borrower unwilling to provide financial statements or income documentation
6. Guarantors or co-signers with no apparent economic connection to the borrower
7. Loan applications from legal entities with complex corporate structures designed to obscure beneficial ownership

CORRESPONDENT BANKING AND HIGH-RISK GEOGRAPHIES

Financial institutions should apply enhanced due diligence to business relationships and transactions with persons from countries that have significant strategic deficiencies in their AML/CFT regimes (FATF Grey List / Black List).

Current FATF blacklisted jurisdictions (as of 2023): North Korea, Iran, Myanmar
FATF grey-listed jurisdictions require enhanced monitoring.

RECORD-KEEPING FOR AML COMPLIANCE

All AML-related records including:
- CDD documentation
- Suspicious transaction reports (STRs)
- Transaction monitoring alerts and outcomes
- Training records
Must be maintained for a minimum of 5 years and made available to competent authorities on request.
    `.trim(),
  },

  // ── 3. ONBOARDING SOP ─────────────────────────────────────
  {
    documentType: 'onboarding_sop',
    source: 'INTERNAL-SOP-LOAN-ONBOARDING-v3.2',
    title: 'Standard Operating Procedure — Retail and MSME Loan Onboarding',
    metadata: {
      jurisdiction: 'IN',
      regulatoryBody: 'INTERNAL',
      policyVersion: 'v3.2',
      effectiveDate: '2024-01-01',
      confidentiality: 'confidential',
      tags: ['onboarding', 'sop', 'loan-processing', 'credit-assessment', 'underwriting'],
    },
    content: `
STANDARD OPERATING PROCEDURE — RETAIL AND MSME LOAN ONBOARDING

VERSION: 3.2 | EFFECTIVE DATE: 2024-01-01 | CLASSIFICATION: INTERNAL CONFIDENTIAL

1. PURPOSE AND SCOPE

This SOP defines the end-to-end process for onboarding retail and MSME loan applicants onto the lending platform. It covers:
- Initial application receipt and completeness check
- Identity and address verification
- Credit assessment and bureau pull
- Income verification and DTI calculation
- Fraud and AML screening
- AI-assisted risk scoring
- Credit committee review (where required)
- Offer generation and disbursement

This SOP applies to all loan types: Personal Loans, Business Loans, Home Loans, and Vehicle Loans processed through the digital lending platform.

2. PRE-REQUISITES FOR APPLICATION PROCESSING

Before a loan application can enter the assessment queue, the following must be confirmed:
(a) Applicant identity verified via OVD or Aadhaar e-KYC
(b) PAN verification completed against NSDL/UTIITSL database
(c) Address proof submitted and cross-verified
(d) Signed application form received (digital or physical)
(e) Processing fee collected (where applicable)

Applications failing pre-requisite checks are held in PENDING_VERIFICATION status and the applicant is notified.

3. CREDIT BUREAU PULL

Upon receipt of a complete application:
3.1 Pull a full credit report from at least one bureau (CIBIL, Equifax, Experian, or CRIF HighMark)
3.2 For loans above INR 5 lakhs, pull from two bureaus
3.3 Record the credit score, number of active accounts, total outstanding debt, and delinquency history
3.4 A CIBIL score below 650 triggers automatic MANUAL_REVIEW routing
3.5 A CIBIL score below 550 triggers automatic REJECT recommendation

4. INCOME VERIFICATION STANDARDS

Salaried applicants:
- Last 3 months salary slips
- Last 6 months bank statements
- Form 16 or ITR for latest 2 financial years
- Employment letter for employment < 1 year

Self-employed / MSME:
- Last 2 years ITR with computation of income
- GST returns for last 12 months (where applicable)
- CA-certified balance sheet and P&L for last 2 years
- Business bank account statements for last 12 months

Income to be used for DTI calculation = Net Monthly Income after tax
DTI (Debt-to-Income Ratio) = (Total existing EMIs + Proposed EMI) / Net Monthly Income

Maximum permissible DTI ratios:
- Salaried: 50%
- Self-employed: 45%
- MSME: 60% (with additional collateral requirement)

5. FRAUD SCREENING PROTOCOL

All applications must pass through the automated fraud screening engine before credit assessment. The following checks are mandatory:

5.1 Identity Fraud Check
- PAN linked to multiple applicants in the system
- Address shared with >3 other loan applicants in the past 24 months
- Phone number flagged in fraud database

5.2 Document Fraud Check
- Document forgery indicators (metadata inconsistency, editing artifacts)
- Bank statement cash flow inconsistency with declared income

5.3 Velocity Check
- Same applicant applying to multiple institutions within 30 days (visible in bureau hard pulls)
- Rapid credit card balance build-up before application

Applications with FRAUD_SCORE > 0.7 must be routed to the Fraud Investigation Team and shall not proceed to disbursement without their clearance.

6. AI RISK ASSESSMENT

6.1 After successful document verification and fraud screening, the application is submitted to the AI Risk Assessment module.

6.2 The AI module generates:
- Risk Score (0.0–1.0)
- Risk Level (LOW / MEDIUM / HIGH / CRITICAL)
- Recommendation (APPROVE / MANUAL_REVIEW / REJECT)
- Risk Factors with impact (positive/negative/neutral)
- Suggested loan terms (for approved applications)

6.3 AI recommendations serve as advisory inputs to the credit decision. The final decision authority is:
- AI: APPROVE + Risk Score ≤ 0.35 → Auto-approve (subject to max loan amount limit)
- AI: MANUAL_REVIEW OR Risk Score 0.35–0.75 → Credit Manager review
- AI: REJECT + Risk Score > 0.75 → Auto-reject with adverse action notice

6.4 AI Explainability Requirement
All AI-generated decisions must be accompanied by ≥3 documented risk factors for FCRA/RBI adverse action notice requirements.

7. CREDIT COMMITTEE REVIEW

Mandatory Credit Committee Review for:
- Loan amounts above INR 25 lakhs (individual)
- Loan amounts above INR 1 crore (MSME)
- Applications with AI Risk Score between 0.55–0.75 (borderline cases)
- Any application where fraud score > 0.5

Committee must document their decision rationale and sign off within 24 business hours.

8. ADVERSE ACTION NOTICE

When a loan application is rejected or approved with significantly different terms than requested, an Adverse Action Notice (AAN) must be issued within 30 days:
- Specific reasons for adverse action (minimum 3 factors)
- Right to request a copy of the credit report
- Contact information of the credit bureau used
- Notification that the bureau did not make the decision

9. DISBURSEMENT PROCESS

For approved loans:
9.1 Loan agreement signed by applicant (digital signature acceptable)
9.2 NACH / ECS mandate obtained for EMI repayment
9.3 Disbursement to verified bank account only
9.4 Post-disbursement monitoring: account statement reconciliation at T+1 month

10. AUDIT TRAIL REQUIREMENTS

Every step in the onboarding process must generate an immutable audit log entry including:
- Timestamp
- Actor (human or system)
- Action taken
- Input data snapshot
- Output / decision
- Approval chain (for manual decisions)

Audit records are retained for 7 years from the date of the transaction per RBI guidelines.
    `.trim(),
  },

  // ── 4. RISK POLICY ────────────────────────────────────────
  {
    documentType: 'risk_policy',
    source: 'INTERNAL-CREDIT-RISK-POLICY-2024',
    title: 'Credit Risk Management Policy — Lending Platform',
    metadata: {
      jurisdiction: 'IN',
      regulatoryBody: 'INTERNAL',
      policyVersion: '2024-Q1',
      effectiveDate: '2024-01-15',
      confidentiality: 'confidential',
      tags: ['credit-risk', 'underwriting', 'risk-thresholds', 'portfolio-management'],
    },
    content: `
CREDIT RISK MANAGEMENT POLICY — LENDING PLATFORM
VERSION: 2024-Q1 | CLASSIFICATION: CONFIDENTIAL — RESTRICTED

1. POLICY OBJECTIVE

This policy establishes the credit risk appetite, risk assessment framework, and control boundaries for all lending activities on the platform. It is designed to ensure that lending decisions are consistent, transparent, explainable, and compliant with applicable regulations including RBI Prudential Norms, BCBS standards, and internal risk governance requirements.

2. RISK APPETITE STATEMENT

The platform targets a portfolio Non-Performing Asset (NPA) ratio not exceeding:
- 3.0% (Gross NPA) for retail personal loans
- 2.5% (Gross NPA) for secured MSME loans
- 4.0% (Gross NPA) for unsecured MSME loans

Applications exceeding the following risk thresholds shall be automatically declined without human override:
- CIBIL score < 550
- DTI ratio > 65% (salaried) or > 70% (self-employed)
- Fraud score > 0.85
- AI Risk Score > 0.85

3. CREDIT SCORING FRAMEWORK

3.1 Bureau Score Weightage
Credit bureau score contributes 35% to the overall credit decision weight.

Score bands and action:
750–900: Excellent — eligible for best pricing tier
700–749: Good — standard pricing
650–699: Fair — increased scrutiny, higher pricing
550–649: Poor — manual review required
< 550: Decline

3.2 Income and Repayment Capacity
Net monthly income stability (last 12 months variance ≤ 20%): 25% weight
DTI ratio: 20% weight

3.3 Debt History and Repayment Behaviour
- Number of 30+ DPD incidents in last 24 months: 10% weight
- Total outstanding secured debt: 5% weight
- Enquiry count in last 6 months (hard pulls): 5% weight

3.4 Business / Employment Stability
For MSME: Revenue trend (last 3 years), profitability, GST compliance history

4. COLLATERAL REQUIREMENTS

Secured loans require collateral with Loan-to-Value (LTV) ratios not exceeding:
- Residential property: 80% LTV
- Commercial property: 65% LTV
- Gold: 75% LTV
- Shares/securities: 50% LTV
- Business assets/machinery: 60% LTV

All collateral must be independently valued by an empanelled valuer. Collateral with unclear legal title shall disqualify the application.

5. LOAN AMOUNT LIMITS BY SEGMENT

Retail Personal Loans:
- Maximum: INR 30 lakhs
- Minimum: INR 50,000
- Maximum tenure: 60 months

MSME Working Capital:
- Maximum: INR 5 crores (secured), INR 50 lakhs (unsecured)
- Tenure: 12–84 months

Home Loans:
- Maximum: INR 5 crores
- LTV: up to 80% for loans up to INR 30 lakhs, 75% above

6. GEOGRAPHIC RISK CONCENTRATION LIMITS

Portfolio concentration by geography shall not exceed:
- Single state: 30% of total portfolio
- Single district: 10% of total portfolio
- Single pincode cluster: 3% of total portfolio

Applications from districts with NPA rates > 2x national average require enhanced due diligence.

7. PRICING POLICY

Interest rates are risk-adjusted and must reflect:
- Cost of funds
- Credit risk premium
- Operating cost
- Target ROE

Minimum spread over cost of funds: 2.5% (retail), 3.5% (unsecured MSME)
Maximum rate: RBI repo rate + 12% (regulatory ceiling)

8. PORTFOLIO MONITORING

8.1 Early Warning System (EWS)
Automated triggers for enhanced monitoring:
- 2 consecutive months with delayed payments
- Significant decline in credit bureau score post-disbursement
- GST returns stopped for MSME borrowers
- Legal proceedings against borrower

8.2 Review Frequency
- Standard portfolio: quarterly review
- Watch-list accounts: monthly review
- Accounts in 30+ DPD: bi-weekly monitoring

9. PROHIBITED LOAN PURPOSES

The platform shall not disburse loans for:
(a) Gambling or lottery operations
(b) Speculative commodity trading
(c) Arms, ammunition, or weapons manufacturing
(d) Any activity listed under negative sectors per RBI guidelines
(e) Refinancing of loans that have been classified as NPA at another institution
(f) Bridge loans against anticipated IPO proceeds

10. REGULATORY CAPITAL REQUIREMENTS

Per RBI prudential norms (Ind AS framework):
- Standard assets: 0.25% provisioning (retail), 0.40% (MSME)
- Sub-standard (NPA < 12 months): 15% provisioning
- Doubtful (NPA > 12 months): 25–100% provisioning
- Loss assets: 100% provisioning
    `.trim(),
  },

  // ── 5. COMPLIANCE MANUAL ──────────────────────────────────
  {
    documentType: 'compliance_manual',
    source: 'INTERNAL-COMPLIANCE-MANUAL-LENDING-2024',
    title: 'Regulatory Compliance Manual — Digital Lending Platform',
    metadata: {
      jurisdiction: 'IN',
      regulatoryBody: 'INTERNAL',
      policyVersion: '2024',
      effectiveDate: '2024-03-01',
      confidentiality: 'confidential',
      tags: ['compliance', 'regulatory', 'fair-lending', 'data-protection', 'consumer-protection'],
    },
    content: `
REGULATORY COMPLIANCE MANUAL — DIGITAL LENDING PLATFORM
EDITION: 2024 | CLASSIFICATION: CONFIDENTIAL

SECTION 1 — FAIR LENDING PRINCIPLES

1.1 Equal Credit Opportunity
Lending decisions must be based solely on financial creditworthiness criteria. The following characteristics may NEVER be used as factors in credit decisions:
- Race, colour, ethnicity, or national origin
- Religion or caste
- Sex or gender
- Marital status
- Age (beyond minimum legal age)
- Disability status
- Receipt of income from public assistance programmes

Any AI model used in lending must be audited for disparate impact across protected categories at least annually. A disparate impact ratio below 0.8 (four-fifths rule) triggers a mandatory model review.

1.2 Pricing Equity
Pricing variations must be based exclusively on risk and cannot be based on protected characteristics. Risk-based pricing must be consistently applied; similarly situated borrowers must receive similar pricing.

1.3 Adverse Action Notices
Per RBI guidelines and the CRFB framework, any adverse action (rejection or materially different terms) requires:
- Issuance within 30 days of decision
- Specific reasons (not generic statements like "insufficient creditworthiness")
- At least 3 specific, factual, and objective reasons
- Information about the right to dispute

SECTION 2 — DATA PROTECTION AND PRIVACY

2.1 Personal Data Governance (per IT Act 2000 and PDPB 2023)
All applicant personal data, including financial data, is classified as sensitive personal information and must be:
- Collected with explicit, informed consent
- Used only for the purposes stated at collection
- Stored in India (data localisation for financial data)
- Retained only as long as necessary (7 years post-relationship end)
- Accessible to the data subject on request

2.2 Data Minimisation
Only data that is necessary and proportionate to the credit assessment shall be collected. Marketing profiling or secondary use of loan applicant data is prohibited without separate, explicit consent.

2.3 Breach Notification
Any data breach involving personal or financial data must be:
- Contained within 72 hours
- Reported to CERT-In within 6 hours of discovery
- Communicated to affected individuals within 30 days

SECTION 3 — DIGITAL LENDING GUIDELINES (RBI 2022)

Per RBI Digital Lending Guidelines (September 2022):
3.1 All loan disbursements must go directly to the borrower's verified bank account. Disbursement through third-party pass-through accounts is prohibited.

3.2 The Key Fact Statement (KFS) must be provided to the borrower before loan execution. KFS must include:
- All-in cost (APR) including fees
- EMI schedule
- Cooling-off period (minimum 3 days for loans up to INR 5 lakhs)
- Grievance redressal contact

3.3 Third-party lending service providers (LSPs) and business correspondents (BCs) must be clearly identified. The RE (regulated entity) remains fully responsible for compliance regardless of the LSP's role.

3.4 Automated credit decisioning systems must:
- Be explainable to the borrower on request
- Not use prohibited characteristics
- Maintain decision logs for 7 years
- Be subject to model risk management review

SECTION 4 — INTEREST RATE AND FEE TRANSPARENCY

4.1 All interest rates must be expressed as Annual Percentage Rate (APR) to enable like-for-like comparisons.
4.2 Processing fees: Maximum 2% of loan amount, collected upfront; must be disclosed in KFS.
4.3 Prepayment charges: Not applicable for floating rate loans (per RBI guidelines). Fixed rate loans: maximum 2% of outstanding principal.
4.4 Late payment charges: Must be specified in loan agreement. Cannot be compounding on unpaid charges.
4.5 No hidden charges: All fees must be disclosed in KFS before loan execution.

SECTION 5 — GRIEVANCE REDRESSAL

5.1 All borrowers must have access to a grievance redressal mechanism with:
- Response within 5 business days for Tier 1 complaints
- Escalation to Nodal Officer within 30 days for unresolved issues
- Further escalation to RBI Ombudsman (Banking) if not resolved within 30 days

5.2 Grievance data must be reported in the RBI's CIMS portal quarterly.

SECTION 6 — TECHNOLOGY RISK AND CYBER SECURITY

Per RBI Cyber Security Framework for NBFCs (2023):
6.1 Lending platforms must maintain a documented IT Risk Management Framework.
6.2 Customer authentication for loan applications must use multi-factor authentication.
6.3 Penetration testing of internet-facing systems: at least annually.
6.4 Board-level Cyber Security Committee for entities with loan book > INR 500 crores.
6.5 Business Continuity Plan (BCP) with maximum Recovery Time Objective (RTO) of 4 hours for critical systems.

SECTION 7 — OUTSOURCING AND VENDOR RISK

7.1 Core credit assessment and underwriting cannot be fully outsourced. The RE must retain risk ownership.
7.2 AI/ML vendors providing credit scoring must sign data processing agreements and be subject to audit rights.
7.3 Cloud infrastructure must comply with RBI data localisation requirements.
7.4 Critical vendor concentration risk: no single vendor dependency for >40% of critical functions.
    `.trim(),
  },

  // ── 6. AML TRANSACTION MONITORING RULES ──────────────────
  {
    documentType: 'aml_policy',
    source: 'INTERNAL-AML-TRANSACTION-MONITORING-2024',
    title: 'AML Transaction Monitoring Rules and Red Flag Indicators — Lending Platform',
    metadata: {
      jurisdiction: 'IN',
      regulatoryBody: 'FIU-IND',
      policyVersion: '2024-Q2',
      effectiveDate: '2024-04-01',
      confidentiality: 'confidential',
      tags: ['aml', 'transaction-monitoring', 'red-flags', 'sar', 'fiu'],
    },
    content: `
AML TRANSACTION MONITORING RULES AND RED FLAG INDICATORS — LENDING PLATFORM
VERSION: 2024-Q2 | CLASSIFICATION: CONFIDENTIAL — RESTRICTED

PART A — REGULATORY BASIS

This policy is implemented pursuant to:
- Prevention of Money Laundering Act (PMLA) 2002 and amendments
- PMLA (Maintenance of Records) Rules 2005
- FIU-IND reporting obligations
- RBI Master Direction on KYC (AML provisions)
- FATF Guidance on AML/CFT for Lending Institutions

PART B — TRANSACTION MONITORING FRAMEWORK

B.1 Automated Transaction Monitoring (ATM)
All loan-related transactions are monitored by the automated transaction monitoring system. The system generates alerts based on rule-based triggers and behavioural analytics.

B.2 Threshold-Based Mandatory Reporting
Cash transactions above INR 10 lakhs in a single day are mandatory Cash Transaction Reports (CTRs) to be filed with FIU-IND. Suspicious Transaction Reports (STRs) must be filed regardless of amount.

B.3 STR Filing Timeline
STRs must be filed with FIU-IND within 7 days of determining that a transaction is suspicious. No tipping off the customer.

PART C — RED FLAG INDICATORS FOR LENDING

C.1 Pre-Disbursement Red Flags

IDENTITY AND DOCUMENTATION:
- Inconsistencies between application data and OVD
- Multiple applications with same PAN but different personal details
- Recent change of address immediately before application
- Documents with inconsistent fonts, printing quality, or metadata
- Income documents not matching declared employer
- Bank statements with round-number transactions only (no organic spending patterns)

FINANCIAL PROFILE:
- Income inconsistent with stated profession/employer
- Large unexplained cash deposits in bank statements shortly before application
- Multiple applications to different lenders within 60-day window (bureau footprint)
- Declared income significantly above industry/geographic norms for stated profession
- Existing debt being serviced from a single source that recently started deposits

PURPOSE AND COLLATERAL:
- Vague or inconsistent loan purpose statements
- Collateral acquired recently with unexplained funding source
- Collateral significantly overvalued compared to market
- Third-party collateral with no clear economic connection to borrower

C.2 Post-Disbursement Red Flags

REPAYMENT ANOMALIES:
- Repayment from source different from declared income source
- Early full repayment within 6 months of disbursement (loan layering indicator)
- Repayment from multiple small deposits aggregating to EMI (structuring)
- Sudden cessation of payments followed by repayment from new unidentified source

ACCOUNT BEHAVIOUR:
- Loan proceeds immediately transferred to third-party accounts
- Loan proceeds transferred to high-risk geographies
- Proceeds used for purposes inconsistent with stated loan purpose

C.3 AML Risk Scoring for Borrowers

AML risk score components:
1. Geographic risk (15%): based on district/state NPA and crime statistics
2. Industry risk (20%): sector-specific money laundering risk rating
3. Transaction pattern risk (25%): velocity, amounts, counterparties
4. Adverse media (15%): regulatory actions, legal proceedings
5. PEP/Sanctions status (25%): immediate REJECT if on sanctions list

AML risk score thresholds:
- 0.0–0.3: Standard monitoring
- 0.31–0.6: Enhanced monitoring, quarterly review
- 0.61–0.8: Senior management sign-off required
- 0.81–1.0: STR filing and application rejection

PART D — SANCTIONS SCREENING

All applicants must be screened against:
- UN Security Council Consolidated List
- OFAC SDN List
- EU Consolidated Sanctions List
- Government of India Notified Entities List
- Interpol Red Notices (for loan amounts > INR 5 lakhs)

Screening must occur:
- At application stage
- At disbursement
- Ongoing: monthly refresh for existing borrowers
- Triggered: whenever a sanctions list is updated

Any match (exact or fuzzy score > 85%) must be escalated to the Compliance Officer within 2 hours.

PART E — POLITICALLY EXPOSED PERSONS (PEP)

Enhanced due diligence is mandatory for:
- Current and former domestic PEPs (government officials, senior judiciary, military)
- Foreign PEPs
- Family members and close associates of PEPs (first degree)

PEP EDD requirements:
- Source of wealth documentation
- Source of funds for this transaction
- Senior management (MLRO level) approval before onboarding
- Annual review of the relationship

PART F — RECORD-KEEPING FOR AML

7-year retention requirement for:
- All CDD documents
- Transaction monitoring alerts and outcomes (even if not escalated)
- STR reports (content not to be disclosed to customer)
- Training completion records
- Internal AML audit reports

Records must be available to FIU-IND, RBI inspectors, and ED within 3 working days of request.
    `.trim(),
  },
];
