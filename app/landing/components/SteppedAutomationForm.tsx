"use client";

import { FormEvent, useState } from "react";
import { toast } from "@/components/Toaster";

type FieldType = "text" | "email" | "tel" | "textarea" | "select" | "radio" | "date";
type SubmitState = "idle" | "submitting" | "success" | "error";

interface Question {
  id: string;
  label: string;
  description?: string;
  helperText: string;
  fieldType: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  validation?: (value: any) => string | null;
}

const QUESTIONS: Question[] = [
  // Business Info
  {
    id: "businessFormationStatus",
    label: "Do You Have a Registered Business Entity?",
    description: "Are you operating as an LLC, Corporation, or other registered entity?",
    helperText: "We recommend having a registered business entity for legal protection and professional credibility.",
    fieldType: "radio",
    required: true,
    options: [
      { label: "Yes, I have an LLC or other entity", value: "HasEntity" },
      { label: "No, I do not have an LLC yet", value: "NoEntity" },
      { label: "I am a sole proprietor", value: "SoleProprietor" },
    ],
  },
  {
    id: "legalBusinessName",
    label: "Legal Business Name",
    description: "Your official registered business name",
    helperText: "This is used for legal agreements and documentation. It should match your business registration records.",
    fieldType: "text",
    required: true,
    placeholder: "e.g., ABC Plumbing LLC",
  },
  {
    id: "publicBrandName",
    label: "Public Brand Name",
    description: "How your business is known to customers",
    helperText: "The name customers know you by. This may differ from your legal name and will be used in automated messages.",
    fieldType: "text",
    required: true,
    placeholder: "e.g., ABC Plumbing",
  },
  {
    id: "primaryContactNameRole",
    label: "Primary Contact Name & Role",
    description: "Who we will work with on this automation",
    helperText: "The person responsible for this automation setup. Include their role (e.g., Owner, Manager).",
    fieldType: "text",
    required: true,
    placeholder: "e.g., John Smith, Owner",
  },
  // Contact Details
  {
    id: "primaryContactEmail",
    label: "Primary Contact Email",
    description: "How to reach your contact",
    helperText: "We will send automation updates and lead notifications to this email address.",
    fieldType: "email",
    required: true,
    placeholder: "contact@example.com",
  },
  {
    id: "primaryContactPhone",
    label: "Primary Contact Phone",
    description: "Direct phone number (optional)",
    helperText: "Used for urgent implementation updates or questions. Leave blank if you prefer email only.",
    fieldType: "tel",
    placeholder: "(555) 123-4567",
  },
  // Social Accounts
  {
    id: "facebookPageUrl",
    label: "Facebook Page URL",
    description: "Your main Facebook business page",
    helperText: "The complete URL to your Facebook page. This helps us connect the automation to the right account.",
    fieldType: "text",
    required: true,
    placeholder: "https://facebook.com/yourpage",
  },
  {
    id: "instagramUsername",
    label: "Instagram Username",
    description: "Your Instagram business account handle",
    helperText: "Your Instagram handle (without @). We need this to set up comment and DM automation.",
    fieldType: "text",
    required: true,
    placeholder: "yourbusinessname",
  },
  {
    id: "instagramBusinessOrCreator",
    label: "Instagram Account Type",
    description: "Is your Instagram a business or creator account?",
    helperText: "Business accounts provide better automation features. Creator accounts have limited DM automation.",
    fieldType: "radio",
    required: true,
    options: [
      { label: "Business Account", value: "Business" },
      { label: "Creator Account", value: "Creator" },
      { label: "Not Sure", value: "NotSure" },
    ],
  },
  {
    id: "facebookInstagramConnected",
    label: "Facebook & Instagram Connected?",
    description: "Are your accounts linked together?",
    helperText: "Connected accounts allow unified automation across both platforms. If not linked, we will set up automation separately.",
    fieldType: "radio",
    required: true,
    options: [
      { label: "Yes", value: "Yes" },
      { label: "No", value: "No" },
      { label: "Not Sure", value: "NotSure" },
    ],
  },
  {
    id: "usesDmForSalesSupport",
    label: "Do You Use DMs for Sales or Support?",
    description: "Do customers reach you through DMs?",
    helperText: "If you receive sales or support inquiries via DM, we can automate initial responses to qualify leads and gather info.",
    fieldType: "radio",
    required: true,
    options: [
      { label: "Yes", value: "Yes" },
      { label: "No", value: "No" },
    ],
  },
  // Automation Scope
  {
    id: "platformsToAutomate",
    label: "Which Platforms to Automate?",
    description: "Where do you want automation running?",
    helperText: "Choose which social platforms will have automated responses. We recommend starting with the one with most engagement.",
    fieldType: "select",
    required: true,
    options: [
      { label: "Instagram Only", value: "Instagram" },
      { label: "Facebook Only", value: "Facebook" },
      { label: "Both Instagram & Facebook", value: "Both" },
    ],
  },
  {
    id: "triggerScope",
    label: "What Triggers the Automation?",
    description: "When should responses be triggered?",
    helperText: "All Posts: Every comment triggers a response. Specific Posts: Only certain posts. Keywords: Only comments with specific words.",
    fieldType: "select",
    required: true,
    options: [
      { label: "All posts", value: "AllPosts" },
      { label: "Specific posts only", value: "SpecificPosts" },
      { label: "Keyword-based", value: "KeywordBased" },
    ],
  },
  {
    id: "specificPostLinks",
    label: "Specific Post Links (if applicable)",
    description: "Links to the posts for automation",
    helperText: "If you chose \"Specific posts\", provide the direct links to those posts. One per line.",
    fieldType: "textarea",
    placeholder: "https://facebook.com/yourpage/posts/123...",
  },
  {
    id: "triggerKeywords",
    label: "Trigger Keywords (if applicable)",
    description: "Keywords that trigger the automation",
    helperText: "If you chose \"Keyword-based\", list the keywords that should trigger responses. One per line. (e.g., \"quote\", \"price\", \"availability\")",
    fieldType: "textarea",
    placeholder: "quote\nprice\navailability",
  },
  // Comment Response
  {
    id: "preferredTone",
    label: "Preferred Tone for Responses",
    description: "How should automated responses sound?",
    helperText: "Friendly: Warm and personable. Professional: Formal and business-like. Sales-focused: Emphasizes offers. Casual: Relaxed and informal.",
    fieldType: "select",
    required: true,
    options: [
      { label: "Friendly", value: "Friendly" },
      { label: "Professional", value: "Professional" },
      { label: "Sales-focused", value: "Sales-focused" },
      { label: "Casual", value: "Casual" },
    ],
  },
  {
    id: "sampleWording",
    label: "Sample Response Wording",
    description: "Example of how you want to respond",
    helperText: "Provide a sample response so we can match your voice and style in all automated messages.",
    fieldType: "textarea",
    placeholder: "Thanks for reaching out! We would love to help. What specific issue can we solve for you?",
  },
  {
    id: "prohibitedWords",
    label: "Prohibited Words or Phrases",
    description: "Words we should never use in responses",
    helperText: "List any words, terms, or phrases that should never appear in automated responses. One per line.",
    fieldType: "textarea",
    placeholder: "competitor name\nslang term\ntechnical jargon",
  },
  // DM Strategy
  {
    id: "primaryDmGoal",
    label: "Primary Goal of DM Automation",
    description: "What do you want to achieve with DMs?",
    helperText: "Qualify: Determine if they are a good fit. Pricing: Share your rates. Book Call: Schedule a consultation. Collect Info: Gather requirements.",
    fieldType: "select",
    required: true,
    options: [
      { label: "Qualify leads", value: "Qualify" },
      { label: "Share pricing", value: "Pricing" },
      { label: "Book a call", value: "BookCall" },
      { label: "Collect information", value: "CollectInfo" },
      { label: "Other", value: "Other" },
    ],
  },
  {
    id: "desiredCallToAction",
    label: "Call-to-Action for DMs",
    description: "What do you want people to do next?",
    helperText: "This should be clear and actionable. Examples: \"Reply with your budget\", \"Book a 15-minute call\", \"Share your timeline\".",
    fieldType: "text",
    required: true,
    placeholder: "e.g., \"Reply with your availability for a free quote\"",
  },
  {
    id: "askLocation",
    label: "May We Ask for Location?",
    description: "Should the automation ask where they are located?",
    helperText: "Location info helps qualify leads. Only ask if relevant to your service area.",
    fieldType: "radio",
    required: true,
    options: [
      { label: "Yes", value: "Yes" },
      { label: "No", value: "No" },
    ],
  },
  {
    id: "askTimeline",
    label: "May We Ask for Timeline?",
    description: "Should the automation ask when they need the service?",
    helperText: "Timeline helps prioritize leads. Ask if you want to know urgency.",
    fieldType: "radio",
    required: true,
    options: [
      { label: "Yes", value: "Yes" },
      { label: "No", value: "No" },
    ],
  },
  {
    id: "askBudget",
    label: "May We Ask for Budget?",
    description: "Should the automation ask about their budget?",
    helperText: "Budget questions help qualify and route leads faster.",
    fieldType: "radio",
    required: true,
    options: [
      { label: "Yes", value: "Yes" },
      { label: "No", value: "No" },
    ],
  },
  // Lead Routing
  {
    id: "leadDestination",
    label: "Where Should Leads Be Logged?",
    description: "How do you want to receive leads?",
    helperText: "Sheet: Google Sheets or Excel. CRM: HubSpot, Pipedrive, etc. Email: Direct to your inbox.",
    fieldType: "select",
    required: true,
    options: [
      { label: "Spreadsheet (Google Sheets/Excel)", value: "Sheet" },
      { label: "CRM System", value: "CRM" },
      { label: "Email", value: "Email" },
    ],
  },
  {
    id: "crmSystem",
    label: "CRM System (if applicable)",
    description: "Which CRM do you use?",
    helperText: "If you chose CRM, let us know which one. Examples: HubSpot, Pipedrive, Salesforce, Monday.com.",
    fieldType: "text",
    placeholder: "e.g., HubSpot, Pipedrive",
  },
  {
    id: "notificationRecipients",
    label: "Who Gets Notified of New Leads?",
    description: "Email addresses that should receive notifications",
    helperText: "List all email addresses that should be notified when a new lead comes in. One per line.",
    fieldType: "textarea",
    required: true,
    placeholder: "john@example.com\nsales@example.com",
  },
  {
    id: "businessHoursRestrictions",
    label: "Business Hours Restrictions",
    description: "Should automation pause outside business hours?",
    helperText: "If you only want automation during certain hours, specify them here. Example: \"9am-6pm EST, Mon-Fri\"",
    fieldType: "textarea",
    placeholder: "e.g., 9am-6pm EST, Monday-Friday",
  },
  // Volume & Permissions
  {
    id: "estimatedCommentsPerDay",
    label: "Estimated Comments Per Day",
    description: "How many comments does your business get?",
    helperText: "This helps us set up the right automation volume. Higher volume may require rate limiting.",
    fieldType: "select",
    required: true,
    options: [
      { label: "0-20 comments/day", value: "0-20" },
      { label: "20-50 comments/day", value: "20-50" },
      { label: "50-100 comments/day", value: "50-100" },
      { label: "100+ comments/day", value: "100+" },
    ],
  },
  {
    id: "grantAdminAccess",
    label: "Grant Admin Access for Setup?",
    description: "Can we temporarily access your accounts?",
    helperText: "We may need temporary admin access to your Meta Business account to configure automation. Access is revoked once setup is complete.",
    fieldType: "radio",
    required: true,
    options: [
      { label: "Yes", value: "Yes" },
      { label: "No", value: "No" },
    ],
  },
  {
    id: "accountModel",
    label: "Account Ownership Model",
    description: "Who owns and manages the accounts?",
    helperText: "Client-owned: You manage the Meta Business account. Agency-managed: We manage it for you.",
    fieldType: "radio",
    required: true,
    options: [
      { label: "Client-owned", value: "ClientOwned" },
      { label: "Agency-managed", value: "AgencyManaged" },
    ],
  },
  // Approval & Launch
  {
    id: "finalMessageApprover",
    label: "Who Approves Final Messages?",
    description: "Who signs off on automated responses?",
    helperText: "This person will review and approve all automated message copy before they go live.",
    fieldType: "text",
    required: true,
    placeholder: "e.g., John Smith, Owner",
  },
  {
    id: "targetGoLiveDate",
    label: "Target Go-Live Date",
    description: "When do you want automation active?",
    helperText: "The date you want automation to start running. We will work backwards from this to set up everything in time.",
    fieldType: "date",
    required: true,
  },
  {
    id: "emergencyPauseContact",
    label: "Emergency Pause Contact",
    description: "Who to contact if something needs to stop",
    helperText: "If there is a problem, who should we contact immediately? Include name and phone number.",
    fieldType: "text",
    required: true,
    placeholder: "e.g., John Smith, 555-123-4567",
  },
  // Business Goals
  {
    id: "primaryServiceToPromote",
    label: "Primary Service to Promote",
    description: "What is your main service or product?",
    helperText: "This helps us tailor automated messages to highlight your primary offering.",
    fieldType: "text",
    required: true,
    placeholder: "e.g., Plumbing repairs, HVAC maintenance",
  },
  {
    id: "averageJobValue",
    label: "Average Job Value",
    description: "What is your typical project size?",
    helperText: "This helps prioritize lead quality and determine if someone is worth reaching out to.",
    fieldType: "select",
    required: true,
    options: [
      { label: "Under $1,000", value: "Under1k" },
      { label: "$1,000 - $5,000", value: "1k-5k" },
      { label: "$5,000 - $15,000", value: "5k-15k" },
      { label: "$15,000+", value: "15k+" },
    ],
  },
  {
    id: "idealCustomerLocation",
    label: "Ideal Customer Location",
    description: "Where do you serve?",
    helperText: "Your service area or geographic radius. This helps qualify leads based on location.",
    fieldType: "text",
    required: true,
    placeholder: "e.g., Austin, TX or within 50 miles of downtown",
  },
  {
    id: "qualifiedLeadDefinition",
    label: "What Makes a Lead Qualified?",
    description: "Your ideal customer profile",
    helperText: "Define what a perfect lead looks like for you. This helps automation target the right prospects.",
    fieldType: "textarea",
    required: true,
    placeholder: "e.g., Located in Austin, budget $5k+, needs service within 2 weeks",
  },
  {
    id: "unqualifiedLeadDefinition",
    label: "What Makes a Lead Unqualified?",
    description: "Red flags to avoid",
    helperText: "Describe leads you do not want to pursue. Examples: too far away, budget too small, wrong service type.",
    fieldType: "textarea",
    required: true,
    placeholder: "e.g., Outside service area, budget under $1k, competitor inquiries",
  },
  {
    id: "leadOwner",
    label: "Who Handles Incoming Leads?",
    description: "Who manages lead follow-up?",
    helperText: "The person responsible for contacting and qualifying new leads. Helps route notifications correctly.",
    fieldType: "select",
    required: true,
    options: [
      { label: "Owner", value: "Owner" },
      { label: "Sales Rep", value: "SalesRep" },
      { label: "Office Manager", value: "OfficeManager" },
      { label: "Other", value: "Other" },
    ],
  },
  {
    id: "capacityLimits",
    label: "Do You Have Capacity Limits?",
    description: "Can you handle unlimited leads?",
    helperText: "Helps determine if we should limit lead flow. Unlimited: Can take all leads. Limited: Have crew restrictions.",
    fieldType: "select",
    required: true,
    options: [
      { label: "Unlimited capacity", value: "Unlimited" },
      { label: "Limited crews/resources", value: "Limited" },
      { label: "Seasonal restrictions", value: "Seasonal" },
    ],
  },
  {
    id: "primaryGoal",
    label: "Primary Goal with This Automation",
    description: "What success looks like for you",
    helperText: "This helps us measure success and adjust the automation strategy if needed.",
    fieldType: "select",
    required: true,
    options: [
      { label: "More phone calls", value: "MoreCalls" },
      { label: "Higher-quality leads", value: "HigherQuality" },
      { label: "Booked appointments", value: "BookedAppointments" },
      { label: "Revenue growth", value: "RevenueGrowth" },
    ],
  },
  // Authorization
  {
    id: "clientSignature",
    label: "Client Signature",
    description: "Your full name to authorize this",
    helperText: "Type your full name as a digital signature authorizing the setup of this automation.",
    fieldType: "text",
    required: true,
    placeholder: "John Smith",
  },
  {
    id: "signatureDate",
    label: "Signature Date",
    description: "Today date",
    helperText: "The date you are authorizing this automation setup.",
    fieldType: "date",
    required: true,
  },
];

function formatMessage(data: Record<string, string>) {
  const hasNoLlc =
    data.businessFormationStatus === "NoEntity" ||
    data.businessFormationStatus === "SoleProprietor";
  const businessNameLabel = hasNoLlc ? "Business Name" : "Legal Business Name";
  const lines = [
    "Social Media Lead Capture Automation Intake",
    "",
    "Business Information",
    `- ${businessNameLabel}: ${data.legalBusinessName || ""}`,
    `- Business Formation Status: ${data.businessFormationStatus || ""}`,
    `- Public Brand Name: ${data.publicBrandName || ""}`,
    `- Primary Contact: ${data.primaryContactNameRole || ""}`,
    `- Email: ${data.primaryContactEmail || ""}`,
    `- Phone: ${data.primaryContactPhone || ""}`,
    "",
    "Social Media Accounts",
    `- Facebook Page: ${data.facebookPageUrl || ""}`,
    `- Instagram Username: ${data.instagramUsername || ""}`,
    `- Instagram Type: ${data.instagramBusinessOrCreator || ""}`,
    `- Accounts Connected: ${data.facebookInstagramConnected || ""}`,
    `- Uses DMs: ${data.usesDmForSalesSupport || ""}`,
    "",
    "Automation Configuration",
    `- Platforms: ${data.platformsToAutomate || ""}`,
    `- Trigger Scope: ${data.triggerScope || ""}`,
    `- Tone: ${data.preferredTone || ""}`,
    `- DM Goal: ${data.primaryDmGoal || ""}`,
    `- CTA: ${data.desiredCallToAction || ""}`,
    "",
    "Lead Routing",
    `- Destination: ${data.leadDestination || ""}`,
    `- CRM: ${data.crmSystem || ""}`,
    `- Recipients: ${data.notificationRecipients || ""}`,
    "",
    "Business Details",
    `- Service: ${data.primaryServiceToPromote || ""}`,
    `- Job Value: ${data.averageJobValue || ""}`,
    `- Location: ${data.idealCustomerLocation || ""}`,
    `- Lead Owner: ${data.leadOwner || ""}`,
    `- Capacity: ${data.capacityLimits || ""}`,
    `- Goal: ${data.primaryGoal || ""}`,
    "",
    "Approvals",
    `- Signature: ${data.clientSignature || ""}`,
    `- Date: ${data.signatureDate || ""}`,
  ];
  return lines.join("\n");
}

function resolveQuestionCopy(question: Question, formData: Record<string, string>): Question {
  if (question.id !== "legalBusinessName") return question;
  const noRegisteredEntity =
    formData.businessFormationStatus === "NoEntity" ||
    formData.businessFormationStatus === "SoleProprietor";
  if (!noRegisteredEntity) return question;

  return {
    ...question,
    label: "Business Name",
    description: "The name customers know your business by",
    helperText:
      "Use the business name you currently operate under. This can be your brand name or DBA if you do not have an LLC yet.",
    placeholder: "e.g., ABC Plumbing",
  };
}

export default function SteppedAutomationForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<SubmitState>("idle");
  const [error, setError] = useState<string | null>(null);

  const baseQuestion = QUESTIONS[currentStep];
  const question = resolveQuestionCopy(baseQuestion, formData);
  const totalSteps = QUESTIONS.length;
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;
  const currentValue = formData[question.id] || "";

  function handleInputChange(value: string) {
    setFormData((prev) => ({ ...prev, [question.id]: value }));
  }

  function handleNext() {
    if (question.required && !currentValue.trim()) {
      toast({ type: "error", title: "Required field", message: `${question.label} is required.` });
      return;
    }
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  }

  function handlePrevious() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  async function handleSubmit() {
    try {
      setStatus("submitting");
      setError(null);

      const name = formData.primaryContactNameRole || "";
      const email = formData.primaryContactEmail || "";
      const message = formatMessage(formData);
      const hasNoLlc =
        formData.businessFormationStatus === "NoEntity" ||
        formData.businessFormationStatus === "SoleProprietor";

      const response = await fetch("/api/sales-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          businessName: formData.legalBusinessName || "",
          businessFormationStatus: formData.businessFormationStatus || "",
          llcUpsellOpportunity: hasNoLlc,
          payload: formData,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to submit intake");
      }

      setStatus("success");
      toast({
        type: "success",
        title: "Intake submitted",
        message: "We will review this and follow up with implementation steps.",
      });
      setFormData({});
      setCurrentStep(0);
    } catch (err: any) {
      const message = err?.message || "Failed to submit intake";
      setStatus("error");
      setError(message);
      toast({ type: "error", title: "Submission failed", message });
    } finally {
      setStatus("idle");
    }
  }

  function showHelperToast() {
    toast({
      type: "info",
      title: question.label,
      message: question.helperText,
    });
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 py-8">
      <div className="w-full max-w-2xl">
        {status === "success" ? (
          <div className="bg-white rounded-3xl p-8 shadow-2xl text-center border border-green-100">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Intake Submitted Successfully</h2>
            <p className="text-gray-600 mb-6">We will review your information and follow up with implementation steps within 24 hours.</p>
            <button
              onClick={() => setStatus("idle")}
              className="inline-flex items-center justify-center rounded-lg bg-[#0f766e] text-white px-6 py-3 font-semibold hover:bg-[#115e59] transition-colors"
            >
              Start Over
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 shadow-2xl" style={{ boxShadow: "0 0 60px rgba(15, 118, 110, 0.15), 0 20px 40px rgba(0, 0, 0, 0.1)" }}>
            {/* Progress */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-500 mb-2">
                Question {currentStep + 1} of {totalSteps}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#0f766e] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{question.label}</h2>
              {question.description && <p className="text-gray-600 text-sm">{question.description}</p>}
            </div>

            {/* Input Field */}
            <div className="mb-6">
              {question.fieldType === "text" || question.fieldType === "email" || question.fieldType === "tel" || question.fieldType === "date" ? (
                <input
                  type={question.fieldType}
                  value={currentValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder={question.placeholder}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] transition-colors"
                  data-testid={`field-${question.id}`}
                />
              ) : question.fieldType === "textarea" ? (
                <textarea
                  value={currentValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder={question.placeholder}
                  rows={4}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] transition-colors resize-none"
                  data-testid={`field-${question.id}`}
                />
              ) : question.fieldType === "select" ? (
                <select
                  value={currentValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] transition-colors"
                  data-testid={`field-${question.id}`}
                >
                  <option value="">Select an option...</option>
                  {question.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : question.fieldType === "radio" ? (
                <div className="space-y-3" data-testid={`field-${question.id}`}>
                  {question.options?.map((opt) => (
                    <label key={opt.value} className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name={question.id}
                        value={opt.value}
                        checked={currentValue === opt.value}
                        onChange={(e) => handleInputChange(e.target.value)}
                        className="w-4 h-4 text-[#0f766e] border-gray-300 focus:ring-[#0f766e]"
                      />
                      <span className="ml-3 text-gray-700 group-hover:text-gray-900">{opt.label}</span>
                    </label>
                  ))}
                </div>
              ) : null}
            </div>

            {/* LLC Formation Offer - Show when user selects "No LLC yet" */}
            {question.id === "businessFormationStatus" && formData.businessFormationStatus === "NoEntity" && (
              <div className="mb-8 p-6 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">We Can Help You Form Your LLC</h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Registering an LLC is one of the best investments for your business. Here are the key benefits:
                    </p>
                    <ul className="space-y-2 text-sm text-gray-700 mb-4">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-orange-600 rounded-full" />
                        <span><strong>Legal Protection:</strong> Separate your personal assets from business liability</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-orange-600 rounded-full" />
                        <span><strong>Tax Benefits:</strong> Potential deductions and pass-through taxation</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-orange-600 rounded-full" />
                        <span><strong>Professional Credibility:</strong> Increases customer trust and confidence</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-orange-600 rounded-full" />
                        <span><strong>Client Contracts:</strong> Required for many corporate partnerships</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-orange-600 rounded-full" />
                        <span><strong>Brand Building:</strong> Reflects commitment to your business</span>
                      </li>
                    </ul>
                    <p className="text-xs text-gray-600 italic">
                      You can still proceed with automation setup, and we recommend forming your LLC before launch for full legal protection.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Helper Button */}
            <button
              type="button"
              onClick={showHelperToast}
              className="text-sm text-[#0f766e] hover:text-[#115e59] underline flex items-center gap-1 mb-8"
              data-testid={`helper-btn-${question.id}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Learn more about this field
            </button>

            {/* Error */}
            {error && <p className="text-red-600 text-sm mb-6 p-3 bg-red-50 rounded-lg">{error}</p>}

            {/* Navigation */}
            <div className="flex gap-3">
              {!isFirstStep && (
                <button
                  onClick={handlePrevious}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  data-testid="btn-previous"
                >
                  Previous
                </button>
              )}
              {!isLastStep ? (
                <button
                  onClick={handleNext}
                  className="flex-1 rounded-lg bg-[#0f766e] text-white px-4 py-3 font-semibold hover:bg-[#115e59] transition-colors"
                  data-testid="btn-next"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={status === "submitting"}
                  className="flex-1 rounded-lg bg-[#0f766e] text-white px-4 py-3 font-semibold hover:bg-[#115e59] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  data-testid="btn-submit"
                >
                  {status === "submitting" ? "Submitting..." : "Submit Intake"}
                </button>
              )}
            </div>

            {/* Disclosure */}
            <p className="text-xs text-gray-500 mt-6 text-center">By submitting, you authorize OfRoot Technology to configure social automation systems within your Meta and connected platforms.</p>
          </div>
        )}
      </div>
    </div>
  );
}
