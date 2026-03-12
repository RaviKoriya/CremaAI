export const LEAD_STATUSES = [
  { value: "New", label: "New", color: "bg-gray-100 text-gray-700", dotColor: "bg-gray-400" },
  { value: "Contacted", label: "Contacted", color: "bg-blue-100 text-blue-700", dotColor: "bg-blue-500" },
  { value: "Qualified", label: "Qualified", color: "bg-teal-100 text-teal-700", dotColor: "bg-teal-500" },
  { value: "Proposal Sent", label: "Proposal Sent", color: "bg-purple-100 text-purple-700", dotColor: "bg-purple-500" },
  { value: "Negotiation", label: "Negotiation", color: "bg-orange-100 text-orange-700", dotColor: "bg-orange-500" },
  { value: "Won", label: "Won", color: "bg-green-100 text-green-700", dotColor: "bg-green-500" },
  { value: "Lost", label: "Lost", color: "bg-red-100 text-red-700", dotColor: "bg-red-500" },
] as const;

export type LeadStatus = typeof LEAD_STATUSES[number]["value"];

export const PRIORITIES = [
  { value: "Low", label: "Low", borderColor: "border-l-gray-400", badgeColor: "bg-gray-100 text-gray-600" },
  { value: "Medium", label: "Medium", borderColor: "border-l-orange-400", badgeColor: "bg-orange-100 text-orange-600" },
  { value: "High", label: "High", borderColor: "border-l-red-500", badgeColor: "bg-red-100 text-red-600" },
] as const;

export type Priority = typeof PRIORITIES[number]["value"];

export const LEAD_SOURCES = [
  { value: "Web", label: "Web" },
  { value: "Referral", label: "Referral" },
  { value: "LinkedIn", label: "LinkedIn" },
  { value: "Cold Call", label: "Cold Call" },
  { value: "Email Campaign", label: "Email Campaign" },
  { value: "Trade Show", label: "Trade Show" },
  { value: "Other", label: "Other" },
] as const;

export const ACTIVITY_TYPES = [
  { value: "Call", label: "Call", icon: "Phone" },
  { value: "Email", label: "Email", icon: "Mail" },
  { value: "Meeting", label: "Meeting", icon: "Calendar" },
  { value: "Note", label: "Note", icon: "FileText" },
  { value: "Task", label: "Task", icon: "CheckSquare" },
] as const;

export type ActivityType = typeof ACTIVITY_TYPES[number]["value"];

export const INVOICE_STATUSES = [
  { value: "Draft", label: "Draft", color: "bg-gray-100 text-gray-600" },
  { value: "Sent", label: "Sent", color: "bg-blue-100 text-blue-600" },
  { value: "Paid", label: "Paid", color: "bg-green-100 text-green-600" },
  { value: "Overdue", label: "Overdue", color: "bg-red-100 text-red-600" },
  { value: "Cancelled", label: "Cancelled", color: "bg-gray-100 text-gray-400" },
] as const;

export type InvoiceStatus = typeof INVOICE_STATUSES[number]["value"];

export const USER_ROLES = [
  { value: "Admin", label: "Admin" },
  { value: "Manager", label: "Manager" },
  { value: "Sales Rep", label: "Sales Rep" },
] as const;

export const LOST_REASONS = [
  { value: "Price", label: "Price" },
  { value: "Competitor", label: "Competitor" },
  { value: "Timing", label: "Timing" },
  { value: "No Budget", label: "No Budget" },
  { value: "No Need", label: "No Need" },
  { value: "Other", label: "Other" },
] as const;

export const PAYMENT_TERMS = [
  { value: "Due on Receipt", label: "Due on Receipt" },
  { value: "Net 15", label: "Net 15" },
  { value: "Net 30", label: "Net 30" },
  { value: "Net 60", label: "Net 60" },
  { value: "Custom", label: "Custom" },
] as const;

export const CURRENCIES = [
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "EUR", label: "Euro", symbol: "€" },
  { value: "GBP", label: "British Pound", symbol: "£" },
  { value: "INR", label: "Indian Rupee", symbol: "₹" },
  { value: "AUD", label: "Australian Dollar", symbol: "A$" },
  { value: "CAD", label: "Canadian Dollar", symbol: "C$" },
  { value: "SGD", label: "Singapore Dollar", symbol: "S$" },
  { value: "JPY", label: "Japanese Yen", symbol: "¥" },
  { value: "AED", label: "UAE Dirham", symbol: "د.إ" },
] as const;

export const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (US)" },
  { value: "America/Chicago", label: "Central Time (US)" },
  { value: "America/Denver", label: "Mountain Time (US)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Berlin", label: "Berlin (CET)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Sydney (AEDT)" },
] as const;

export const COUNTRIES = [
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "IN", label: "India" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "AU", label: "Australia" },
  { value: "CA", label: "Canada" },
  { value: "SG", label: "Singapore" },
  { value: "AE", label: "UAE" },
  { value: "JP", label: "Japan" },
  { value: "OTHER", label: "Other" },
] as const;

export const LEAD_AGING_THRESHOLDS = {
  healthy: 7,   // days — green
  warning: 30,  // days — amber
  // beyond 30 = red
} as const;

export const ARIA_CONTEXT_TYPES = [
  "dashboard",
  "lead",
  "contact",
  "invoice",
  "global",
] as const;

export type AriaContextType = typeof ARIA_CONTEXT_TYPES[number];
