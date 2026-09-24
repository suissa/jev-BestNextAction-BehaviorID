export type CustomerServiceActionCategory =
  | "understand"
  | "inform"
  | "resolve"
  | "recover"
  | "coordinate"
  | "commercial"
  | "safety"
  | "close";

export type CustomerServiceActionDefinition = {
  /** Stable, domain-neutral identifier. Do not encode a product, channel, or department. */
  id: string;
  category: CustomerServiceActionCategory;
  name: string;
  description: string;
  useWhen: string[];
  avoidWhen?: string[];
  requires?: string[];
};

const action = (
  id: string,
  category: CustomerServiceActionCategory,
  name: string,
  description: string,
  useWhen: string[],
  avoidWhen?: string[],
  requires?: string[]
): CustomerServiceActionDefinition => ({
  id, category, name, description, useWhen, avoidWhen, requires
});

/**
 * Canonical generic action space for a customer-service turn.
 *
 * This is deliberately domain-neutral: a vertical adapts execution behind an
 * action (for example, "execute_change" may become an address, reservation,
 * plan, shipment, appointment, or account change). Additive domain actions
 * may be supplied by a caller, but existing ids are stable.
 */
export const DEFAULT_CUSTOMER_SERVICE_ACTIONS: CustomerServiceActionDefinition[] = [
  action("UNDERSTAND.ACKNOWLEDGE", "understand", "Acknowledge", "Recognize the customer's message and signal that it was understood.", ["new request, concern, or emotional statement"]),
  action("UNDERSTAND.EMPATHIZE", "understand", "Empathize", "Validate impact or frustration without admitting unverified facts.", ["distress, inconvenience, disappointment, or urgency"], ["purely factual, low-stakes request"]),
  action("UNDERSTAND.CLARIFY", "understand", "Clarify", "Ask the smallest question needed to remove material ambiguity.", ["goal, object, scope, or desired outcome is unclear"], ["the answer is already present in the context"]),
  action("UNDERSTAND.CONFIRM_INTERPRETATION", "understand", "Confirm interpretation", "State the understood request and ask for confirmation.", ["multiple plausible interpretations remain"]),
  action("UNDERSTAND.COLLECT_REQUIRED_DATA", "understand", "Collect required data", "Request only the minimum non-sensitive data needed to continue.", ["an identifier, preference, evidence, or consent is missing"], ["data can be retrieved lawfully from existing context"]),
  action("UNDERSTAND.SUMMARIZE_CONTEXT", "understand", "Summarize context", "Condense the known facts, prior attempts, and current objective.", ["long, fragmented, or repeated conversation"]),
  action("INFORM.ANSWER_DIRECTLY", "inform", "Answer directly", "Provide the requested factual answer.", ["question is clear and answer is available"]),
  action("INFORM.EXPLAIN_PROCESS", "inform", "Explain process", "Explain steps, status semantics, or how the service works.", ["customer asks how, why, or what happens next"]),
  action("INFORM.EXPLAIN_POLICY", "inform", "Explain policy", "Explain an applicable rule, eligibility condition, limit, or deadline in plain language.", ["outcome is governed by a policy"]),
  action("INFORM.PROVIDE_OPTIONS", "inform", "Provide options", "Present meaningful alternatives and their trade-offs without pressuring.", ["more than one safe path is available"]),
  action("INFORM.SET_EXPECTATION", "inform", "Set expectation", "State a realistic next event, owner, and time boundary.", ["work cannot be completed in the current turn"]),
  action("INFORM.PROVIDE_STATUS", "inform", "Provide status", "Report the current state of a known request or process.", ["customer asks for progress or tracking"]),
  action("INFORM.EDUCATE_SELF_SERVICE", "inform", "Guide self-service", "Give safe, concise instructions for an action the customer can perform.", ["customer can resolve the need independently"]),
  action("INFORM.CORRECT_MISUNDERSTANDING", "inform", "Correct misunderstanding", "Correct a material inaccurate assumption respectfully, with the relevant fact.", ["customer premise is factually wrong"]),
  action("RESOLVE.EXECUTE_REQUEST", "resolve", "Execute request", "Perform an authorized, reversible or governed requested operation.", ["request is understood, authorized, and executable"], ["identity, authorization, or required data is missing"], ["authorization"]),
  action("RESOLVE.PREPARE_CHANGE", "resolve", "Prepare change", "Show the intended change and obtain confirmation before execution.", ["change has side effects or should be reviewed first"], undefined, ["explicit confirmation"]),
  action("RESOLVE.CONFIRM_COMPLETION", "resolve", "Confirm completion", "Confirm what was completed and expose the resulting reference or state.", ["operation has completed"]),
  action("RESOLVE.VERIFY_RESULT", "resolve", "Verify result", "Check whether a claimed or executed result is present and consistent.", ["completion, delivery, payment, access, or data is disputed"]),
  action("RESOLVE.TROUBLESHOOT", "resolve", "Troubleshoot", "Run or guide a bounded diagnostic path for a malfunction.", ["service does not work as expected"]),
  action("RESOLVE.RETRY_OR_RESTORE", "resolve", "Retry or restore", "Safely retry a transient operation or restore a recoverable state.", ["known transient failure or reversible incident"]),
  action("RESOLVE.OFFER_WORKAROUND", "resolve", "Offer workaround", "Provide a temporary safe path while the primary resolution is unavailable.", ["primary resolution is delayed or blocked"]),
  action("RECOVER.APOLOGIZE", "recover", "Apologize", "Offer a proportionate apology for a verified or credible service impact.", ["service failure, delay, or harmful experience"]),
  action("RECOVER.TAKE_OWNERSHIP", "recover", "Take ownership", "Make a clear commitment to coordinate the next resolution step.", ["customer has been bounced, repeated themselves, or lacks an owner"]),
  action("RECOVER.REMEDIATE", "recover", "Remediate", "Apply an authorized correction, repair, replacement, reversal, or adjustment.", ["verified service failure with an available remedy"], undefined, ["policy eligibility"]),
  action("RECOVER.COMPENSATE", "recover", "Compensate", "Offer an authorized goodwill or contractual remedy.", ["material verified impact and policy permits it"], undefined, ["policy eligibility"]),
  action("RECOVER.REOPEN_CASE", "recover", "Reopen case", "Reopen a previously closed request because new relevant evidence exists.", ["prior resolution is disputed with new facts"]),
  action("COORDINATE.CREATE_CASE", "coordinate", "Create case", "Create a traceable service request with its objective and context.", ["work must persist beyond this turn"]),
  action("COORDINATE.ROUTE_SPECIALIST", "coordinate", "Route to specialist", "Send the case to the responsible capability while preserving context.", ["requires a specialist authority, skill, or system"]),
  action("COORDINATE.ESCALATE", "coordinate", "Escalate", "Raise priority or authority level for risk, exception, or unresolved impact.", ["deadline, harm, repeated failure, or exception needs higher authority"]),
  action("COORDINATE.SCHEDULE_FOLLOW_UP", "coordinate", "Schedule follow-up", "Set a specific follow-up owner and time.", ["resolution depends on future work or customer availability"]),
  action("COORDINATE.REQUEST_EXTERNAL_EVIDENCE", "coordinate", "Request external evidence", "Request a document, image, log, or third-party confirmation strictly needed to decide.", ["claim cannot be verified from available records"]),
  action("COORDINATE.NOTIFY_STAKEHOLDER", "coordinate", "Notify stakeholder", "Notify the customer or an authorized stakeholder of a material state change.", ["a relevant event occurred outside the conversation"]),
  action("COMMERCIAL.QUALIFY_NEED", "commercial", "Qualify need", "Discover objective, constraints, timing, and fit without assuming a sale.", ["customer expresses interest but need is not specific"]),
  action("COMMERCIAL.RECOMMEND_FIT", "commercial", "Recommend fit", "Recommend the best-fitting option with reasons and limits.", ["needs and constraints are sufficiently known"]),
  action("COMMERCIAL.PROVIDE_QUOTE", "commercial", "Provide quote", "Provide a transparent price, scope, conditions, and validity.", ["customer asks price or commercial terms"]),
  action("COMMERCIAL.HANDLE_OBJECTION", "commercial", "Handle objection", "Address a stated concern with evidence, option, or boundary; never manipulate.", ["price, trust, timing, fit, or risk objection"]),
  action("COMMERCIAL.FACILITATE_PURCHASE", "commercial", "Facilitate purchase", "Present the authorized path to place, pay for, or confirm an order.", ["customer explicitly intends to proceed"], undefined, ["consent"]),
  action("COMMERCIAL.RETAIN_OR_CANCEL", "commercial", "Retain or cancel", "Offer appropriate retention alternatives or execute a requested cancellation without dark patterns.", ["cancellation, downgrade, or churn intent"]),
  action("SAFETY.VERIFY_IDENTITY", "safety", "Verify identity", "Request or perform the minimum identity verification required for a protected action.", ["account, financial, private, or irreversible action"], ["low-risk informational request"]),
  action("SAFETY.REQUEST_CONSENT", "safety", "Request consent", "Obtain explicit, informed consent for an optional or consequential action.", ["processing, sharing, charging, or changing requires consent"]),
  action("SAFETY.PROTECT_DATA", "safety", "Protect data", "Refuse unsafe disclosure and redirect to a secure, authorized path.", ["request exposes personal, secret, regulated, or third-party data"]),
  action("SAFETY.DECLINE_UNSAFE_OR_INELIGIBLE", "safety", "Decline safely", "Decline an unsafe, prohibited, or ineligible request and explain the safe boundary.", ["request cannot lawfully, safely, or policy-wise be fulfilled"]),
  action("SAFETY.FRAUD_OR_ABUSE_REVIEW", "safety", "Fraud or abuse review", "Pause execution and route suspected fraud, abuse, coercion, or account compromise.", ["credible security or abuse signal"]),
  action("SAFETY.URGENT_SAFETY_ESCALATION", "safety", "Urgent safety escalation", "Escalate an imminent safety, health, or serious harm signal to the prescribed emergency path.", ["imminent risk of serious harm"]),
  action("CLOSE.CHECK_RESOLUTION", "close", "Check resolution", "Ask whether the answer or action resolved the customer's need.", ["a plausible resolution was provided"]),
  action("CLOSE.RECAP_AND_NEXT_STEP", "close", "Recap and next step", "Recap outcome, reference, owner, and next expected event.", ["case has multiple moving parts"]),
  action("CLOSE.CLOSE_CASE", "close", "Close case", "Close a resolved case with a clear record and reopen path.", ["resolution is confirmed or customer is inactive under policy"]),
  action("CLOSE.INVITE_FEEDBACK", "close", "Invite feedback", "Offer an optional, non-coercive feedback channel after resolution.", ["interaction is materially complete"])
];

export const DEFAULT_CUSTOMER_SERVICE_ACTIONS_VERSION = "customer-service-actions@0.1.0";
