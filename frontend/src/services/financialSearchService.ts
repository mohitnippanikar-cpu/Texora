import { ProjectFinancialData, FileCitation, FinancialAllocation, SearchResults } from '../types';

export class FinancialSearchService {
  // Mock file database with financial information
  private static mockFiles: FileCitation[] = [
    {
      id: '1',
      fileName: 'Metro_A2_Budget_2024.pdf',
      filePath: '/documents/projects/metro-a2/budget/Metro_A2_Budget_2024.pdf',
      pageNumber: 15,
      section: 'Phase 2 Budget Allocation',
      excerpt: 'Total budget allocated for Metro A2 Extension Project Phase 2: ₹2,450 crores. This includes construction costs, land acquisition, and infrastructure development for the Kochi Metro extension from Palarivattom to Tripunithura.',
      lastModified: new Date('2024-09-15'),
      relevanceScore: 0.95
    },
    {
      id: '2',
      fileName: 'KMRL_Annual_Financial_Report_2024.xlsx',
      filePath: '/documents/finance/annual-reports/KMRL_Annual_Financial_Report_2024.xlsx',
      section: 'Project Wise Budget Distribution',
      excerpt: 'Metro A2 Extension Project: Allocated Budget - ₹2,450 crores, Spent Till Date - ₹856 crores, Remaining - ₹1,594 crores. Project is currently 35% complete in terms of financial utilization.',
      lastModified: new Date('2024-10-01'),
      relevanceScore: 0.92
    },
    {
      id: '3',
      fileName: 'Project_Status_Report_Q3_2024.docx',
      filePath: '/documents/projects/status-reports/Project_Status_Report_Q3_2024.docx',
      pageNumber: 8,
      section: 'Financial Summary - Metro Extensions',
      excerpt: 'Metro A2 Extension (Kochi): Central Government Grant - ₹1,225 crores, State Government Contribution - ₹857 crores, KMRL Internal Funds - ₹368 crores. Total project cost estimated at ₹2,450 crores.',
      lastModified: new Date('2024-09-30'),
      relevanceScore: 0.88
    },
    {
      id: '4',
      fileName: 'Land_Acquisition_Costs_Metro_A2.pdf',
      filePath: '/documents/projects/metro-a2/land-acquisition/Land_Acquisition_Costs_Metro_A2.pdf',
      pageNumber: 3,
      section: 'Cost Breakdown',
      excerpt: 'Land acquisition for Metro A2 extension project in Kochi: Total cost ₹420 crores. Breakdown: Residential properties - ₹245 crores, Commercial properties - ₹125 crores, Government land transfer - ₹50 crores.',
      lastModified: new Date('2024-08-20'),
      relevanceScore: 0.85
    },
    {
      id: '5',
      fileName: 'Construction_Contract_Details_2024.pdf',
      filePath: '/documents/contracts/Construction_Contract_Details_2024.pdf',
      pageNumber: 22,
      section: 'Metro A2 Construction Contracts',
      excerpt: 'Metro A2 Kochi Extension Construction Contracts: Civil Works - ₹1,680 crores (L&T Construction), Electrical & Signaling - ₹485 crores (Siemens India), Rolling Stock - ₹285 crores (Alstom Transport).',
      lastModified: new Date('2024-07-10'),
      relevanceScore: 0.83
    }
  ];

  // Mock financial allocations for Metro A2 project
  private static mockAllocations: FinancialAllocation[] = [
    {
      id: 'fa1',
      category: 'Civil Construction',
      allocatedAmount: 168000000000, // 1680 crores
      spentAmount: 58800000000,      // 588 crores
      remainingAmount: 109200000000, // 1092 crores
      currency: 'INR',
      lastUpdated: new Date('2024-09-30')
    },
    {
      id: 'fa2',
      category: 'Electrical & Signaling',
      allocatedAmount: 48500000000,  // 485 crores
      spentAmount: 14550000000,      // 145.5 crores
      remainingAmount: 33950000000,  // 339.5 crores
      currency: 'INR',
      lastUpdated: new Date('2024-09-30')
    },
    {
      id: 'fa3',
      category: 'Rolling Stock',
      allocatedAmount: 28500000000,  // 285 crores
      spentAmount: 8550000000,       // 85.5 crores
      remainingAmount: 19950000000,  // 199.5 crores
      currency: 'INR',
      lastUpdated: new Date('2024-09-30')
    },
    {
      id: 'fa4',
      category: 'Land Acquisition',
      allocatedAmount: 42000000000,  // 420 crores
      spentAmount: 37800000000,      // 378 crores
      remainingAmount: 4200000000,   // 42 crores
      currency: 'INR',
      lastUpdated: new Date('2024-09-30')
    },
    {
      id: 'fa5',
      category: 'Project Management & Others',
      allocatedAmount: 15000000000,  // 150 crores
      spentAmount: 4500000000,       // 45 crores
      remainingAmount: 10500000000,  // 105 crores
      currency: 'INR',
      lastUpdated: new Date('2024-09-30')
    }
  ];

  public static async searchFinancialData(query: string): Promise<SearchResults> {
    const startTime = Date.now();
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Filter relevant citations based on query
    const relevantCitations = this.mockFiles.filter(file => {
      const queryLower = query.toLowerCase();
      const fileContent = (file.fileName + ' ' + file.excerpt + ' ' + file.section).toLowerCase();
      
      return queryLower.includes('metro a2') || 
             queryLower.includes('kochi') ||
             queryLower.includes('finance') ||
             queryLower.includes('budget') ||
             queryLower.includes('allocation') ||
             fileContent.includes(queryLower);
    });

    // Create project financial data
    const projectData: ProjectFinancialData = {
      projectId: 'metro-a2-kochi',
      projectName: 'Metro A2 Extension Project - Kochi',
      totalAllocated: 245000000000, // 2450 crores
      totalSpent: 85600000000,      // 856 crores
      currency: 'INR',
      allocations: this.mockAllocations,
      citations: relevantCitations,
      lastUpdated: new Date('2024-10-01')
    };

    const searchDuration = Date.now() - startTime;

    return {
      query,
      projectData: [projectData],
      totalResults: relevantCitations.length,
      searchDuration,
      timestamp: new Date()
    };
  }

  public static formatCurrency(amount: number, currency: string = 'INR'): string {
    if (currency === 'INR') {
      // Convert to crores for better readability
      const crores = amount / 100000000;
      return `₹${crores.toFixed(2)} crores`;
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2
    }).format(amount);
  }

  public static calculatePercentageSpent(allocated: number, spent: number): number {
    return (spent / allocated) * 100;
  }
}