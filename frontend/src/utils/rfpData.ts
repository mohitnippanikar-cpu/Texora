export interface RFPAgent {
  completed: boolean;
  date?: string;
}

export interface RFPAgents {
  salesAgent: RFPAgent;
  technicalAgent: RFPAgent;
  pricingAgent: RFPAgent;
}

export interface TenderOverview {
  nameOfWork: string;
  biddingType: string;
  tenderType: string;
  biddingSystem: string;
  tenderingSection: string;
  contractType: string;
  contractCategory: string;
  expenditureType: string;
}

export interface TenderTimeline {
  tenderUploadedOn: string;
  biddingStartDate: string;
  tenderClosingDate: string;
  validityOfOffer: string;
  periodOfCompletion: string;
}

export interface FinancialDetails {
  advertisedValue: string;
  earnestMoney: string;
  tenderDocumentCost: string;
}

export interface BiddingDetails {
  biddingStyle: string;
  biddingUnit: string;
  rankingOrder: string;
}

export interface ParticipationRules {
  preBidConference: boolean;
  preBidConferenceNote?: string;
  jointVenture: boolean;
  consortium: boolean;
}

export interface RFP {
  id: number;
  title: string;
  customer: string;
  value: string;
  submissionDate: string;
  status: 'pending' | 'sales-agent' | 'technical-agent' | 'pricing-agent' | 'completed';
  currentAgent?: string;
  agents?: RFPAgents;
  tenderOverview?: TenderOverview;
  tenderTimeline?: TenderTimeline;
  financialDetails?: FinancialDetails;
  biddingDetails?: BiddingDetails;
  participationRules?: ParticipationRules;
}

export const rfpData: RFP[] = [
  {
    id: 1,
    title: 'Metro Railway Project - Wires & Cables',
    customer: 'National Metro Rail Authority',
    value: '₹2,50,00,000',
    submissionDate: '15/03/2024',
    status: 'sales-agent',
    currentAgent: 'Sales Agent - Processing',
    agents: {
      salesAgent: { completed: true, date: '20/01/2024' },
      technicalAgent: { completed: false },
      pricingAgent: { completed: false }
    },
    tenderOverview: {
      nameOfWork: 'Supply and Installation of HT/LT Cables for Metro Rail Corridors',
      biddingType: 'Normal Tender',
      tenderType: 'Open',
      biddingSystem: 'Two Packet System',
      tenderingSection: 'ELECT',
      contractType: 'Works – Electrical',
      contractCategory: 'Expenditure',
      expenditureType: 'Capital (Works)'
    },
    tenderTimeline: {
      tenderUploadedOn: '05/01/2024, 14:30',
      biddingStartDate: '12/01/2024',
      tenderClosingDate: '15/03/2024, 15:30',
      validityOfOffer: '120 Days',
      periodOfCompletion: '18 Months'
    },
    financialDetails: {
      advertisedValue: '₹2,50,00,000.00',
      earnestMoney: '₹2,50,000.00',
      tenderDocumentCost: '₹5,000.00'
    },
    biddingDetails: {
      biddingStyle: 'Item Rate for BOQ',
      biddingUnit: 'Lowest to Highest',
      rankingOrder: 'Lowest to Highest'
    },
    participationRules: {
      preBidConference: true,
      preBidConferenceNote: 'Pre-bid meeting scheduled on 18/01/2024',
      jointVenture: true,
      consortium: false
    }
  },
  {
    id: 2,
    title: 'Smart City Infrastructure - Cable Supply',
    customer: 'Urban Development Corp',
    value: '₹1,80,00,000',
    submissionDate: '28/02/2024',
    status: 'technical-agent',
    currentAgent: 'Technical Agent - SKU Matching',
    agents: {
      salesAgent: { completed: true, date: '15/01/2024' },
      technicalAgent: { completed: true, date: '18/01/2024' },
      pricingAgent: { completed: false }
    },
    tenderOverview: {
      nameOfWork: 'Smart City Street Lighting and Underground Cable Infrastructure',
      biddingType: 'Limited Tender',
      tenderType: 'Open',
      biddingSystem: 'Single Packet System',
      tenderingSection: 'URBAN',
      contractType: 'Works – Civil & Electrical',
      contractCategory: 'Expenditure',
      expenditureType: 'Capital (Infrastructure)'
    },
    tenderTimeline: {
      tenderUploadedOn: '10/01/2024, 10:00',
      biddingStartDate: '18/01/2024',
      tenderClosingDate: '28/02/2024, 14:00',
      validityOfOffer: '90 Days',
      periodOfCompletion: '15 Months'
    },
    financialDetails: {
      advertisedValue: '₹1,80,00,000.00',
      earnestMoney: '₹1,80,000.00',
      tenderDocumentCost: '₹3,000.00'
    },
    biddingDetails: {
      biddingStyle: 'Single Rate for Tender',
      biddingUnit: 'Above/Below/Par',
      rankingOrder: 'Lowest to Highest'
    },
    participationRules: {
      preBidConference: false,
      preBidConferenceNote: 'Not Applicable',
      jointVenture: false,
      consortium: false
    }
  },
  {
    id: 3,
    title: 'Highway Expansion - Electrical Cables',
    customer: 'NHAI Infrastructure Ltd',
    value: '₹3,20,00,000',
    submissionDate: '10/03/2024',
    status: 'pricing-agent',
    currentAgent: 'Pricing Agent - Calculating Costs',
    agents: {
      salesAgent: { completed: true, date: '12/01/2024' },
      technicalAgent: { completed: true, date: '16/01/2024' },
      pricingAgent: { completed: true, date: '20/01/2024' }
    },
    tenderOverview: {
      nameOfWork: 'Supply of HV Cables and Lighting for National Highway Expansion',
      biddingType: 'Normal Tender',
      tenderType: 'Open',
      biddingSystem: 'Two Packet System',
      tenderingSection: 'INFRA',
      contractType: 'Works – Highway Electrical',
      contractCategory: 'Expenditure',
      expenditureType: 'Capital (Infrastructure)'
    },
    tenderTimeline: {
      tenderUploadedOn: '08/01/2024, 11:00',
      biddingStartDate: '15/01/2024',
      tenderClosingDate: '10/03/2024, 16:00',
      validityOfOffer: '150 Days',
      periodOfCompletion: '24 Months'
    },
    financialDetails: {
      advertisedValue: '₹3,20,00,000.00',
      earnestMoney: '₹3,20,000.00',
      tenderDocumentCost: '₹10,000.00'
    },
    biddingDetails: {
      biddingStyle: 'Item Rate for BOQ',
      biddingUnit: 'Percentage Above/Below',
      rankingOrder: 'Lowest to Highest'
    },
    participationRules: {
      preBidConference: true,
      preBidConferenceNote: 'Pre-bid meeting on 20/01/2024 at NHAI HQ',
      jointVenture: true,
      consortium: true
    }
  },
  {
    id: 4,
    title: 'Power Grid Infrastructure - HV Cables',
    customer: 'Power Grid Corporation',
    value: '₹4,50,00,000',
    submissionDate: '05/04/2024',
    status: 'completed',
    currentAgent: 'Ready for Submission',
    agents: {
      salesAgent: { completed: true, date: '10/01/2024' },
      technicalAgent: { completed: true, date: '14/01/2024' },
      pricingAgent: { completed: true, date: '18/01/2024' }
    },
    tenderOverview: {
      nameOfWork: 'Provision of LT Power Supply arrangement in Shop-30 at Furnishing division',
      biddingType: 'Normal Tender',
      tenderType: 'Open',
      biddingSystem: 'Single Packet System',
      tenderingSection: 'CONS',
      contractType: 'Works – General',
      contractCategory: 'Expenditure',
      expenditureType: 'Capital (Works)'
    },
    tenderTimeline: {
      tenderUploadedOn: '08/09/2025, 17:12',
      biddingStartDate: '16/09/2025',
      tenderClosingDate: '30/09/2025, 15:30',
      validityOfOffer: '90 Days',
      periodOfCompletion: '12 Months'
    },
    financialDetails: {
      advertisedValue: '₹7,05,90,921.00',
      earnestMoney: '₹5,03,000.00',
      tenderDocumentCost: '₹0.00'
    },
    biddingDetails: {
      biddingStyle: 'Single Rate for Tender',
      biddingUnit: 'Above/Below/Par',
      rankingOrder: 'Lowest to Highest'
    },
    participationRules: {
      preBidConference: false,
      preBidConferenceNote: 'Not Applicable',
      jointVenture: false,
      consortium: false
    }
  },
  {
    id: 5,
    title: 'Metro Rolling Stock Upgrade',
    customer: 'Metro Rail Partners',
    value: '₹95,00,000',
    submissionDate: '05/03/2024',
    status: 'sales-agent',
    currentAgent: 'Sales Agent - Initial Review',
    agents: {
      salesAgent: { completed: false },
      technicalAgent: { completed: false },
      pricingAgent: { completed: false }
    }
  },
  {
    id: 6,
    title: 'Fiber Optic Network Design',
    customer: 'Tech Infrastructure Board',
    value: '₹1,10,00,000',
    submissionDate: '20/02/2024',
    status: 'technical-agent',
    currentAgent: 'Technical Agent - SKU Analysis',
    agents: {
      salesAgent: { completed: true, date: '08/01/2024' },
      technicalAgent: { completed: false },
      pricingAgent: { completed: false }
    }
  },
  {
    id: 7,
    title: 'Industrial Automation Control Systems',
    customer: 'Northern Industries Ltd',
    value: '₹2,75,00,000',
    submissionDate: '18/02/2024',
    status: 'technical-agent',
    currentAgent: 'Technical Agent - Specifications Review',
    agents: {
      salesAgent: { completed: true, date: '05/01/2024' },
      technicalAgent: { completed: false },
      pricingAgent: { completed: false }
    }
  },
  {
    id: 8,
    title: 'Airport Expansion - Cables & Harness',
    customer: 'Airports Modernization Corp',
    value: '₹4,20,00,000',
    submissionDate: '25/02/2024',
    status: 'pricing-agent',
    currentAgent: 'Pricing Agent - Cost Estimation',
    agents: {
      salesAgent: { completed: true, date: '03/01/2024' },
      technicalAgent: { completed: true, date: '12/01/2024' },
      pricingAgent: { completed: false }
    }
  },
  {
    id: 9,
    title: 'Shipyard Electrification Package',
    customer: 'Global Shipbuilders Ltd',
    value: '₹1,55,00,000',
    submissionDate: '03/03/2024',
    status: 'pricing-agent',
    currentAgent: 'Pricing Agent - Final Pricing',
    agents: {
      salesAgent: { completed: true, date: '06/01/2024' },
      technicalAgent: { completed: true, date: '15/01/2024' },
      pricingAgent: { completed: false }
    }
  },
  {
    id: 10,
    title: 'Solar Power Plant - Cable Installation',
    customer: 'Renewable Energy Corporation',
    value: '₹3,75,00,000',
    submissionDate: '18/03/2024',
    status: 'sales-agent',
    currentAgent: 'Sales Agent - Processing',
    agents: {
      salesAgent: { completed: false },
      technicalAgent: { completed: false },
      pricingAgent: { completed: false }
    },
    tenderOverview: {
      nameOfWork: 'Supply of Solar DC Cables and Power Cables for 100MW Solar Plant',
      biddingType: 'Normal Tender',
      tenderType: 'Open Bidding System',
      biddingSystem: 'Single Packet System',
      tenderingSection: 'ENERGY',
      contractType: 'Works – Electrical',
      contractCategory: 'Expenditure',
      expenditureType: 'Capital (Works)'
    },
    tenderTimeline: {
      tenderUploadedOn: '01/02/2024, 11:00',
      biddingStartDate: '08/02/2024',
      tenderClosingDate: '18/03/2024, 16:00',
      validityOfOffer: '180 Days',
      periodOfCompletion: '24 Months'
    },
    financialDetails: {
      advertisedValue: '₹3,75,00,000.00',
      earnestMoney: '₹3,75,000.00',
      tenderDocumentCost: '₹8,000.00'
    },
    biddingDetails: {
      biddingStyle: 'Item Rate for BOQ',
      biddingUnit: 'Lowest to Highest',
      rankingOrder: 'Lowest to Highest'
    },
    participationRules: {
      preBidConference: true,
      preBidConferenceNote: 'Pre-bid meeting on 12/02/2024',
      jointVenture: true,
      consortium: true
    }
  },
  {
    id: 11,
    title: 'Oil Refinery Expansion - HV Cables',
    customer: 'Petrochemical Industries Ltd',
    value: '₹5,60,00,000',
    submissionDate: '22/03/2024',
    status: 'sales-agent',
    currentAgent: 'Sales Agent - Processing',
    agents: {
      salesAgent: { completed: false },
      technicalAgent: { completed: false },
      pricingAgent: { completed: false }
    },
    tenderOverview: {
      nameOfWork: 'Supply and Installation of High Voltage Cables for Refinery Expansion',
      biddingType: 'Limited Tender',
      tenderType: 'Open',
      biddingSystem: 'Two Packet System',
      tenderingSection: 'PETRO',
      contractType: 'Works – Electrical & Instrumentation',
      contractCategory: 'Expenditure',
      expenditureType: 'Capital (Industrial)'
    },
    tenderTimeline: {
      tenderUploadedOn: '05/02/2024, 09:30',
      biddingStartDate: '12/02/2024',
      tenderClosingDate: '22/03/2024, 17:00',
      validityOfOffer: '150 Days',
      periodOfCompletion: '20 Months'
    },
    financialDetails: {
      advertisedValue: '₹5,60,00,000.00',
      earnestMoney: '₹5,60,000.00',
      tenderDocumentCost: '₹10,000.00'
    },
    biddingDetails: {
      biddingStyle: 'Single Rate for Tender',
      biddingUnit: 'Above/Below/Par',
      rankingOrder: 'Lowest to Highest'
    },
    participationRules: {
      preBidConference: true,
      preBidConferenceNote: 'Mandatory pre-bid meeting on 15/02/2024',
      jointVenture: true,
      consortium: false
    }
  },
  {
    id: 12,
    title: 'Defence Installation - Communication Cables',
    customer: 'Ministry of Defence Projects',
    value: '₹2,95,00,000',
    submissionDate: '30/03/2024',
    status: 'sales-agent',
    currentAgent: 'Sales Agent - Processing',
    agents: {
      salesAgent: { completed: false },
      technicalAgent: { completed: false },
      pricingAgent: { completed: false }
    },
    tenderOverview: {
      nameOfWork: 'Supply of Specialized Communication and Control Cables for Defence Facilities',
      biddingType: 'Restricted Tender',
      tenderType: 'Limited',
      biddingSystem: 'Two Packet System',
      tenderingSection: 'DEFENCE',
      contractType: 'Works – Special Category',
      contractCategory: 'Expenditure',
      expenditureType: 'Capital (Defence)'
    },
    tenderTimeline: {
      tenderUploadedOn: '10/02/2024, 10:00',
      biddingStartDate: '17/02/2024',
      tenderClosingDate: '30/03/2024, 15:00',
      validityOfOffer: '200 Days',
      periodOfCompletion: '16 Months'
    },
    financialDetails: {
      advertisedValue: '₹2,95,00,000.00',
      earnestMoney: '₹2,95,000.00',
      tenderDocumentCost: '₹5,000.00'
    },
    biddingDetails: {
      biddingStyle: 'Item Rate for BOQ',
      biddingUnit: 'Lowest to Highest',
      rankingOrder: 'Technical and Financial'
    },
    participationRules: {
      preBidConference: true,
      preBidConferenceNote: 'Security clearance required for attendance',
      jointVenture: false,
      consortium: false
    }
  }
];

// Helper function to get RFP by ID
export const getRFPById = (id: number): RFP | undefined => {
  return rfpData.find(rfp => rfp.id === id);
};

// Helper function to get RFPs by status
export const getRFPsByStatus = (status: RFP['status']): RFP[] => {
  return rfpData.filter(rfp => rfp.status === status);
};

// Helper function to get all RFPs
export const getAllRFPs = (): RFP[] => {
  return rfpData;
};

