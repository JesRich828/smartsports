export const GRANT_STATUSES = [
  "Researching",
  "Qualified",
  "Relationship Building",
  "LOI Drafting",
  "LOI Submitted",
  "Invited to Apply",
  "Application Drafting",
  "Submitted",
  "Pending",
  "Awarded",
  "Declined",
  "Reporting Due",
  "Closed",
] as const;
export type GrantStatus = (typeof GRANT_STATUSES)[number];

export const PROGRAMS = [
  "Great Lakes Academy Summer Enrichment Program",
  "Pathways Academic & Leadership Academy",
  "The Kinetic Lab",
  "General Operating Support",
] as const;
export type Program = (typeof PROGRAMS)[number];

export const LIKELIHOODS = ["High", "Medium", "Low"] as const;
export type Likelihood = (typeof LIKELIHOODS)[number];

export interface Grant {
  id: string;
  funderName: string;
  fundingType: string;
  priorityArea: string;
  geographicFocus: string;
  programFit: Program | string;
  amountRequested: number;
  likelihood: Likelihood;
  deadline: string;
  status: GrantStatus;
  loiDueDate: string;
  applicationDueDate: string;
  reportDueDate: string;
  contactName: string;
  contactEmail: string;
  relationshipNotes: string;
  nextStep: string;
  assignedOwner: string;
  documentsNeeded: string;
  submittedDate: string;
  decisionDate: string;
  awardAmount: number;
  declinedReason: string;
  renewalOpportunity: boolean;
  notes: string;
}

export const DONOR_TYPES = [
  "Individual Donor",
  "Major Gift Prospect",
  "Corporate Sponsor",
  "Board Contact",
  "Sports Leader",
  "Former Athlete",
  "Foundation Contact",
  "Community Partner",
] as const;
export type DonorType = (typeof DONOR_TYPES)[number];

export const DONOR_STAGES = [
  "Identification",
  "Qualification",
  "Cultivation",
  "Solicitation",
  "Stewardship",
  "Closed - Won",
  "Closed - Lost",
] as const;
export type DonorStage = (typeof DONOR_STAGES)[number];

export interface Donor {
  id: string;
  name: string;
  organization: string;
  type: DonorType | string;
  givingCapacity: string;
  interestArea: string;
  connection: string;
  lastContact: string;
  nextStep: string;
  askAmount: number;
  stage: DonorStage | string;
  notes: string;
}

export const SPONSOR_LEVELS = [
  { name: "Presenting Sponsor", amount: 25000 },
  { name: "Champion Sponsor", amount: 15000 },
  { name: "Leadership Sponsor", amount: 10000 },
  { name: "Foursome Sponsor", amount: 5000 },
  { name: "Hole Sponsor", amount: 1000 },
] as const;

export interface GolfSponsor {
  id: string;
  name: string;
  level: string;
  amount: number;
  confirmed: boolean;
  followUp: string;
}

export const SPONSOR_STATUSES = [
  "Prospect",
  "Contacted",
  "In Discussion",
  "Verbal Commitment",
  "Committed",
  "Declined",
] as const;
export type SponsorStatus = (typeof SPONSOR_STATUSES)[number];

export const CORPORATE_SPONSOR_LEVELS = [
  "Platinum",
  "Gold",
  "Silver",
  "Bronze",
  "In-Kind",
] as const;

export interface Sponsor {
  id: string;
  company: string;
  sponsorship_level: string;
  commitment: number;
  status: SponsorStatus | string;
  contact: string;
}

export interface GolfFoursome {
  id: string;
  captain: string;
  organization: string;
  players: number;
  amount: number;
  paid: boolean;
}

export interface GolfPlayer {
  id: string;
  name: string;
  organization: string;
  amount: number;
  paid: boolean;
}

export interface GolfAuctionItem {
  id: string;
  item: string;
  donor: string;
  estimatedValue: number;
  type: "Auction" | "In-kind";
}

export interface GolfExpense {
  id: string;
  item: string;
  amount: number;
  category: string;
}

export interface BoardMember {
  id: string;
  name: string;
  giveGoal: number;
  given: number;
  introductions: number;
  meetingsScheduled: number;
  prospectsAssigned: number;
  sponsorOutreach: number;
}

export interface Goals {
  totalRevenueGoal: number;
  cashGoal: number;
  inKindGoal: number;
  totalExpenses: number;
  boardGivingGoal: number;
  channels: { name: string; goal: number; raised: number }[];
}

export interface AppData {
  grants: Grant[];
  donors: Donor[];
  sponsors: Sponsor[];
  golfSponsors: GolfSponsor[];
  golfFoursomes: GolfFoursome[];
  golfPlayers: GolfPlayer[];
  golfAuction: GolfAuctionItem[];
  golfExpenses: GolfExpense[];
  board: BoardMember[];
  goals: Goals;
}