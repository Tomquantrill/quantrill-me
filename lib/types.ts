export type BusinessType = 'accommodation' | 'rental' | 'experiences' | 'food' | '';
export type ContactRole = 'owner' | 'manager' | 'both' | '';
export type ProblemScope = 'specific' | 'full_audit' | 'not_sure' | '';
export type BudgetPosture = 'none' | 'rough' | 'ready' | '';
export type DecisionProcess = 'spot' | 'discuss' | 'slow' | '';
export type Timeline = 'urgent' | 'near_term' | 'no_urgency' | '';
export type BudgetVibe = 'open' | 'cautious' | 'hesitant' | 'hard_to_read' | '';
export type RecommendedTier = 'tier1' | 'tier2' | 'tier3' | '';
export type EffortEstimate = 'less_day' | 'one_two_days' | 'three_five_days' | 'one_two_weeks' | 'longer' | '';
export type SaveStatus = 'saved' | 'saving' | 'unsaved';
export type ConsultationStatus = 'draft' | 'complete' | 'archived' | 'lite_pending' | 'lite_complete';
export type ConsultationSource = 'full' | 'lite';

export interface PartAData {
  // Section 1
  businessName: string;
  businessType: BusinessType;
  location: string;
  contactRole: ContactRole;
  operatingYears: string;
  staffCount: string;
  staffBreakdown: string;
  peakSeasons: string;
  peakSplit: string;
  bookingChannels: string[];
  annualVolume: string;
  declinedVolume: boolean;
  operatingLanguages: string;

  // Section 2
  whatPrompted: string;
  currentFrustrations: string;
  alreadyTried: string;
  goodOutcome: string;
  previousWork: string;

  // Section 3: universal
  websitePlatform: string;
  websiteHosting: string;
  websiteLastUpdated: string;
  websiteManager: string;
  emailTools: string;
  socialPlatforms: string;
  socialWhoRuns: string;
  socialActivity: string;
  reviewsSources: string;
  reviewsHandling: string;
  docStorage: string;
  staffAccounts: string;
  subscriptions: string;

  // Section 3: accommodation
  pms: string;
  channelManager: string;
  otas: string;
  directBookingEngine: string;
  roomTracking: string;
  cleaningSchedule: string;
  guestComms: string;

  // Section 3: rental
  rentalBookingSystem: string;
  stockManagement: string;
  rentalPayments: string;
  damageDeposits: string;
  seasonalChangeover: string;

  // Section 3: experiences
  expBookingSystem: string;
  guideAllocation: string;
  capacityWaitlist: string;
  waiverHandling: string;
  expPayments: string;

  // Section 3: food & beverage
  fbReservations: string;
  fbPOS: string;
  supplierOrdering: string;
  stockWastage: string;
  fbStaffScheduling: string;

  // Section 4
  typicalDay: string;
  repetitiveTasks: string;
  multiSystemLogin: string;
  paperWhatsapp: string;
  regularBreaks: string;
  keyPersonAway: string;

  // Section 5
  problemScope: ProblemScope;
  budgetPosture: BudgetPosture;
  budgetFigure: string;
  decisionProcess: DecisionProcess;
  timeline: Timeline;
  budgetVibe: BudgetVibe;
  budgetNotes: string;
}

export interface PartBData {
  servicesFit: string[];
  recommendedTier: RecommendedTier;
  tierNotes: string;
  painPoint1: string;
  painPoint2: string;
  painPoint3: string;
  quickWins: string;
  complexityFlags: string;
  redFlags: string[];
  redFlagNotes: string;
  effortEstimate: EffortEstimate;
  fitRating: number;
  fitRatingReason: string;
  followUpActions: string;
}

export interface ConsultationFormData {
  contactName: string;
  partA: PartAData;
  partB: PartBData;
  notes: string;
}

export interface ConsultationRecord {
  id: string;
  created_at: string;
  business_name: string | null;
  business_type: string | null;
  contact_name: string | null;
  contact_role: string | null;
  summary_json: ConsultationFormData | null;
  notes: string | null;
  status: ConsultationStatus;
  source: ConsultationSource;
  token: string | null;
}

export interface LiteFormData {
  businessName: string;
  businessType: BusinessType;
  location: string;
  contactName: string;
  contactRole: ContactRole;
  operatingYears: string;
  staffCount: string;
  peakSeasons: string;
  bookingChannels: string[];
  operatingLanguages: string;
  whatPrompted: string;
  currentFrustrations: string;
  alreadyTried: string;
  goodOutcome: string;
  previousWork: string;
  websitePlatform: string;
  websiteHosting: string;
  websiteManager: string;
  emailTools: string;
  socialPlatforms: string;
  reviewsSources: string;
  subscriptions: string;
}
