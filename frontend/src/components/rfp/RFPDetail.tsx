import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ShoppingBag, Wrench, DollarSign, Calendar, Download, ChevronDown, CheckCircle, Check, Play, FileSpreadsheet, FileText, Building2, AlertCircle, Send, UserCheck, ClipboardCheck, Scale, ChevronLeft, ChevronRight, Award, XCircle } from 'lucide-react';
import apiService from '../../services/api';
// @ts-ignore
import { SERVER_URL,PDF_SERVER_URL } from '../../utils/util';

const RFPDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  
  console.log('=== RFPDetail Mount ===', { id, hasState: !!location.state?.rfp });
  
  const [rfp, setRfp] = useState<any>(location.state?.rfp || null);
  const [scrapedTender, setScrapedTender] = useState<any>(null);
  
  // Normalize incoming tender object to ensure UI fields exist
  const normalizeTender = (raw: any) => {
    if (!raw) return null;
    const value = raw.value || raw.budget || raw.tender_value || raw.tenderValue || raw.advertisedValue || '—';
    const submissionDate = raw.submissionDate || raw.dueDate || raw.close_date || raw.bidding_closing_date || raw.publish_date || raw.issueDate || raw.issue_date || '';
    const agents = raw.agents || { salesAgent: { completed: false }, technicalAgent: { completed: false }, pricingAgent: { completed: false } };
    const financialDetails = raw.financialDetails || {
      advertisedValue: raw.advertisedValue || value,
      earnestMoney: raw.earnestMoney || '—',
      tenderDocumentCost: raw.tenderDocumentCost || '—'
    };
    const matched_items = raw.matched_items || raw.matched_skus || raw.matchedSkus || [];
    const sku_details = raw.sku_details || raw.skuDetails || [];

    return {
      ...raw,
      value,
      submissionDate,
      agents,
      financialDetails,
      matched_items,
      sku_details
    };
  };
  
  // Use effect to load data if not provided in state
  useEffect(() => {
    if (!rfp && location.state?.rfp) {
      setRfp(location.state.rfp);
      return;
    }
    
    // Fallback: Fetch from API if no state data and we have an id
    if (!rfp && id) {
      const fetchTender = async () => {
        try {
          const t = await apiService.getTenderById(id);
          // Map API fields to UI expected fields
          const mappedTender = {
            ...t,
            id: t.tender_id,
            value: t.amount ? `₹ ${t.amount.toLocaleString()}` : '—',
            submissionDate: t.end_date,
            status: t.stage === 'live' ? 'Active' : 'Closed',
            // Keep other fields as is or add defaults
          };
          setRfp(normalizeTender(mappedTender));
        } catch (err) {
          console.error('Failed to fetch tender:', err);
        }
      };
      fetchTender();
    }
  }, [location.state?.rfp, id, rfp]);
  
  // State declarations for UI
  const [viewMode, setViewMode] = useState<'vendor-validation' | 'compliance-checklist' | 'process' | 'sales-output' | 'technical-agent' | 'acceptance-testing' | 'pricing-agent' | 'legal-compliance' | 'final-documents' | 'generate-rfp-response' | 'award-decision'>('vendor-validation');
  
  const [movedToPricing, setMovedToPricing] = useState(false);
  const [testRequirements, setTestRequirements] = useState<Record<string, Record<string, boolean>>>({});
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [isRunningAgent, setIsRunningAgent] = useState(false);
  const [expandedPricingItemId, setExpandedPricingItemId] = useState<string | null>(null);
  const [expandedComplianceId, setExpandedComplianceId] = useState<string | null>('eligibility');
  const [expandedTechnicalId, setExpandedTechnicalId] = useState<string | null>('sku-compliance');
  const [expandedLegalId, setExpandedLegalId] = useState<string | null>(null);
  const [expandedFinalDocsId, setExpandedFinalDocsId] = useState<string | null>(null);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [docGenerated, setDocGenerated] = useState(false);
  const [localAgentStatus, setLocalAgentStatus] = useState({
    technicalAgent: false
  });
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isVendorPanelOpen, setIsVendorPanelOpen] = useState(false);
  const [hoveredVendor, setHoveredVendor] = useState<string | null>(null);
  const [bafoApplied, setBafoApplied] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
  const [submissionDetails, setSubmissionDetails] = useState<any>(null);
  const [isLoadingSubmission, setIsLoadingSubmission] = useState(false);

  // Auto-select the top-ranked vendor by default
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [selectedAwardVendor, setSelectedAwardVendor] = useState<string | null>(null);

  // Fetch vendor submissions/leaderboard from API
  useEffect(() => {
    const fetchVendorSubmissions = async () => {
      if (!id) return;
      
      setIsLoadingVendors(true);
      try {
        const submissions = await apiService.getTenderSubmissions(id);
        
        // Sort by total_score descending
        const sortedSubmissions = [...submissions].sort((a: any, b: any) => 
          (b.total_score || 0) - (a.total_score || 0)
        );
        
        // Map API response to vendor format with rankings
        const mappedVendors = sortedSubmissions.map((submission: any, index: number) => {
          const verification = submission.individual_scores?.verification_score || 0;
          const elegibility = submission.individual_scores?.elegibility_score || 0;
          const technical = submission.individual_scores?.technical_score || 0;
          const financial = submission.individual_scores?.financial_score || 0;
          const legal = submission.individual_scores?.legal_score || 0;
          
          return {
            id: submission.submission_id || submission.bid_id || `vendor-${index + 1}`,
            name: submission.vendor_name || `Vendor ${index + 1}`,
            rank: index + 1,
            score: submission.total_score || 0,
            certified: (submission.total_score || 0) >= 80,
            verification,
            elegibility,
            technical,
            financial,
            legal
          };
        });
        
        setVendors(mappedVendors);
        
        // Auto-select top vendor if available
        if (mappedVendors.length > 0) {
          setSelectedVendor(mappedVendors[0].id);
          setSelectedAwardVendor(mappedVendors[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch vendor submissions:', error);
        // Keep vendors as empty array on error
        setVendors([]);
      } finally {
        setIsLoadingVendors(false);
      }
    };
    
    fetchVendorSubmissions();
  }, [id]);

  // Fetch submission details when vendor is selected
  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      if (!selectedVendor) return;
      
      setIsLoadingSubmission(true);
      try {
        const details = await apiService.getSubmissionById(selectedVendor);
        setSubmissionDetails(details);
        console.log('Submission details:', details);
      } catch (error) {
        console.error('Failed to fetch submission details:', error);
        setSubmissionDetails(null);
      } finally {
        setIsLoadingSubmission(false);
      }
    };
    
    fetchSubmissionDetails();
  }, [selectedVendor]);

  const handleVendorSelect = (vendorId: string) => {
    setSelectedVendor(vendorId);
    console.log('Selected vendor:', vendorId);
  };

  // Get the selected vendor's details
  const selectedVendorDetails = vendors.find(v => v.id === selectedVendor);
  
  // Helper function to get random approver name
  const getRandomApprover = (stage: number) => {
    const approvers = [
      'Rajesh Kumar',
      'Priya Sharma',
      'Amit Patel',
      'Neha Singh',
      'Vikram Desai',
      'Anjali Gupta',
      'Suresh Reddy',
      'Divya Menon',
      'Karan Singh'
    ];
    // Use stage as seed for consistent name per stage
    return approvers[stage % approvers.length];
  };

  // Helper function to check if a stage is approved
  const isStageApproved = (stageNumber: number) => {
    return submissionDetails?.current_stage && submissionDetails.current_stage > stageNumber;
  };

  // Helper function to check if AI is processing
  const isAIProcessing = () => {
    return submissionDetails?.current_stage === 1;
  };
  
  // Function to simulate running an agent
  const handleRunAgent = (agentName: string) => {
    setIsRunningAgent(true);
    
    // Simulate agent processing
    setTimeout(() => {
      setIsRunningAgent(false);
      
      // Mark the agent as completed based on which agent was run
      if (agentName === 'Technical Agent') {
        setLocalAgentStatus(prev => ({ ...prev, technicalAgent: true }));
      }
      
      // No alert needed - just show the data
    }, 2000); // 2 second loading
  };
  
  // Get requirements for each item with match percentage
  const getItemRequirements = (itemName: string, matchPercentage: number) => {
    const allRequirements: Array<{
      requirement: string;
      rfpSpec: string;
      skuSpec: string;
    }> = [];
    
    if (itemName.includes('HV Cable - 220kV')) {
      allRequirements.push(
        { requirement: 'Voltage Rating', rfpSpec: '220kV', skuSpec: '220kV' },
        { requirement: 'Conductor Material', rfpSpec: 'Copper', skuSpec: 'Copper' },
        { requirement: 'Insulation Type', rfpSpec: 'XLPE', skuSpec: 'XLPE' },
        { requirement: 'Number of Cores', rfpSpec: '3-core', skuSpec: '3-core' },
        { requirement: 'Standard Compliance', rfpSpec: 'IS 7098, IEC 60502', skuSpec: 'IS 7098, IEC 60502' },
        { requirement: 'Quantity Required', rfpSpec: '500 Meter', skuSpec: '500 Meter' }
      );
    } else if (itemName.includes('LV Cable - 33kV')) {
      allRequirements.push(
        { requirement: 'Voltage Rating', rfpSpec: '33kV', skuSpec: '33kV' },
        { requirement: 'Conductor Material', rfpSpec: 'Aluminum', skuSpec: 'Aluminum' },
        { requirement: 'Insulation Type', rfpSpec: 'PVC', skuSpec: 'PVC' },
        { requirement: 'Number of Cores', rfpSpec: '4-core', skuSpec: '4-core' },
        { requirement: 'Standard Compliance', rfpSpec: 'IS 1554, IS 10810', skuSpec: 'IS 1554, IS 10810' },
        { requirement: 'Quantity Required', rfpSpec: '800 Meter', skuSpec: '800 Meter' }
      );
    } else if (itemName.includes('Control Cable - 2.5mm²')) {
      allRequirements.push(
        { requirement: 'Size', rfpSpec: '2.5mm²', skuSpec: '2.5mm²' },
        { requirement: 'Type', rfpSpec: 'Multi-core', skuSpec: 'Multi-core' },
        { requirement: 'Shielding', rfpSpec: 'Shielded', skuSpec: 'Shielded' },
        { requirement: 'Insulation', rfpSpec: 'PVC', skuSpec: 'PVC' },
        { requirement: 'Standard Compliance', rfpSpec: 'IS 8130', skuSpec: 'IS 8130' },
        { requirement: 'Quantity Required', rfpSpec: '1200 Meter', skuSpec: '1200 Meter' }
      );
    } else if (itemName.includes('Instrumentation Cable')) {
      allRequirements.push(
        { requirement: 'Type', rfpSpec: 'Multi-pair', skuSpec: 'Multi-pair' },
        { requirement: 'Shielding', rfpSpec: 'Shielded', skuSpec: 'Shielded' },
        { requirement: 'Voltage Rating', rfpSpec: '300V', skuSpec: '300V' },
        { requirement: 'Insulation Type', rfpSpec: 'PVC', skuSpec: 'PVC' },
        { requirement: 'Standard Compliance', rfpSpec: 'IS 10810', skuSpec: 'IS 10810' },
        { requirement: 'Quantity Required', rfpSpec: '600 Meter', skuSpec: '600 Meter' }
      );
    } else if (itemName.includes('Fiber Optic Cable')) {
      allRequirements.push(
        { requirement: 'Core Count', rfpSpec: '24 Core', skuSpec: '24 Core' },
        { requirement: 'Mode Type', rfpSpec: 'Single-mode', skuSpec: 'Single-mode' },
        { requirement: 'Armour Type', rfpSpec: 'Steel tape armored', skuSpec: 'Steel tape armored' },
        { requirement: 'Sheath Material', rfpSpec: 'PE sheath', skuSpec: 'PE sheath' },
        { requirement: 'Standard Compliance', rfpSpec: 'IEC 60794', skuSpec: 'IEC 60794' },
        { requirement: 'Quantity Required', rfpSpec: '300 Meter', skuSpec: '300 Meter' }
      );
    } else if (itemName.includes('Fire Resistant Cable')) {
      allRequirements.push(
        { requirement: 'Insulation Type', rfpSpec: 'LSZH', skuSpec: 'LSZH' },
        { requirement: 'Fire Protection', rfpSpec: 'Mica tape', skuSpec: 'Mica tape' },
        { requirement: 'Voltage Rating', rfpSpec: '0.6/1kV', skuSpec: '0.6/1kV' },
        { requirement: 'Standard Compliance', rfpSpec: 'IEC 60331, IS 1554', skuSpec: 'IEC 60331, IS 1554' },
        { requirement: 'Safety Rating', rfpSpec: 'Fire resistant', skuSpec: 'Fire resistant' },
        { requirement: 'Quantity Required', rfpSpec: '400 Meter', skuSpec: '400 Meter' }
      );
    }
    
    // Calculate how many requirements should match based on percentage
    const totalReqs = allRequirements.length;
    const matchedCount = Math.round((matchPercentage / 100) * totalReqs);
    
    // Return requirements with matches property based on match count
    return allRequirements.map((req, index) => ({
      ...req,
      matches: index < matchedCount
    }));
  };
  // Transform backend matched_skus data into matchedItems format
  // Backend returns: matched_items = [{ tender_requirement, matched_sku, match_score, sku_product, specifications_match }]
  const generateMatchedItems = () => {
    if (scrapedTender?.matched_items && Array.isArray(scrapedTender.matched_items)) {
      // Group matched items by tender_requirement to create options
      const groupedByRequirement: Record<string, any[]> = {};
      
      scrapedTender.matched_items.forEach((item: any) => {
        const req = item.tender_requirement || 'Unknown';
        if (!groupedByRequirement[req]) {
          groupedByRequirement[req] = [];
        }
        groupedByRequirement[req].push(item);
      });

      // Transform to matchedItems format
      return Object.entries(groupedByRequirement).map(([requirement, items], index) => ({
        id: `item-${index + 1}`,
        name: requirement,
        options: items.map((item: any) => ({
          id: item.matched_sku || 'N/A',
          name: item.sku_product || item.matched_sku || 'Unknown',
          match: Math.round(item.match_score || 0)
        }))
      }));
    }

    // Fallback to mock data if no scraped tender
    return [
      {
        id: 'item-1',
        name: 'HV Cable - 220kV',
        options: [
          { id: 'SKU-2451', name: 'HV Cable - 220kV Copper', match: 95 },
          { id: 'SKU-1883', name: 'HV Cable - 220kV Aluminium', match: 89 },
          { id: 'SKU-1756', name: 'HV Cable - 220kV Copper (Alt)', match: 84 }
        ]
      },
      {
        id: 'item-2',
        name: 'LV Cable - 33kV',
        options: [
          { id: 'SKU-3102', name: 'LV Cable - 33kV Aluminium', match: 92 },
          { id: 'SKU-3110', name: 'LV Cable - 33kV Copper', match: 87 },
          { id: 'SKU-2998', name: 'LV Cable - 33kV Copper (Alt)', match: 81 }
        ]
      },
      {
        id: 'item-3',
        name: 'Control Cable - 2.5mm²',
        options: [
          { id: 'SKU-4101', name: 'Control Cable - 2.5mm² Shielded', match: 90 },
          { id: 'SKU-4102', name: 'Control Cable - 2.5mm² Unshielded', match: 85 },
          { id: 'SKU-4099', name: 'Control Cable - 2.5mm² Shielded (Alt)', match: 80 }
        ]
      },
      {
        id: 'item-4',
        name: 'Instrumentation Cable',
        options: [
          { id: 'SKU-6022', name: 'Instrumentation Cable - 300V Shielded', match: 88 },
          { id: 'SKU-6023', name: 'Instrumentation Cable - 600V Multi-pair', match: 83 },
          { id: 'SKU-6024', name: 'Instrumentation Cable - 300V Standard', match: 78 }
        ]
      },
      {
        id: 'item-5',
        name: 'Fiber Optic Cable - 24 Core',
        options: [
          { id: 'SKU-3101', name: 'Fiber Optic - 24C Single-mode Armored', match: 90 },
          { id: 'SKU-3102', name: 'Fiber Optic - 24C Multi-mode', match: 85 },
          { id: 'SKU-3103', name: 'Fiber Optic - 12C Single-mode', match: 75 }
        ]
      },
      {
        id: 'item-6',
        name: 'Fire Resistant Cable',
        options: [
          { id: 'SKU-5277', name: 'Fire Resistant - LSZH Mica Tape', match: 87 },
          { id: 'SKU-5278', name: 'Fire Resistant - XLPE Mica', match: 82 },
          { id: 'SKU-5279', name: 'Fire Resistant - PVC Standard', match: 70 }
        ]
      }
    ];
  };

  const matchedItems = generateMatchedItems();

  // Initialize with first SKU selected for all items
  const [selectedSkuByItem, setSelectedSkuByItem] = useState<Record<string, string>>(() => {
    const initialSelections: Record<string, string> = {};
    matchedItems.forEach(item => {
      if (item.options.length > 0) {
        initialSelections[item.id] = item.options[0].id;
      }
    });
    return initialSelections;
  });

  // Test data structure matching the design
  const getTestRequirements = (productName: string, _skuId: string) => {
    const testData: Array<{
      testName: string;
      type: 'Acceptance' | 'Quality' | 'Routine' | 'Safety';
      standard: string;
      cost: number;
      acceptanceCondition: string;
    }> = [];

    // Generate tests based on product type
    if (productName.includes('HV') || productName.includes('220kV')) {
      testData.push(
        { testName: 'High Voltage Test', type: 'Acceptance', standard: 'IS:7098', cost: 15000, acceptanceCondition: 'Must pass to qualify' },
        { testName: 'Insulation Resistance Test', type: 'Routine', standard: 'IS:10810', cost: 3000, acceptanceCondition: '≥ 1000 MΩ/km' },
        { testName: 'Partial Discharge Test', type: 'Quality', standard: 'IS:7098', cost: 12000, acceptanceCondition: '≤ 10 pC at 1.5U₀' },
        { testName: 'Fire Resistance Test', type: 'Safety', standard: 'IS:10810', cost: 8000, acceptanceCondition: 'Pass IEC 60332-3' }
      );
    } else if (productName.includes('LV') || productName.includes('33kV')) {
      testData.push(
        { testName: 'Voltage Withstand Test', type: 'Acceptance', standard: 'IS:1554', cost: 10000, acceptanceCondition: 'Must pass to qualify' },
        { testName: 'Insulation Resistance Test', type: 'Routine', standard: 'IS:10810', cost: 3000, acceptanceCondition: '≥ 500 MΩ/km' },
        { testName: 'Tensile Strength Test', type: 'Quality', standard: 'IS:8130', cost: 5000, acceptanceCondition: 'Elongation ≥ 20%' },
        { testName: 'Flame Retardant Test', type: 'Safety', standard: 'IS:1554', cost: 6000, acceptanceCondition: 'Pass vertical flame test' }
      );
    } else if (productName.includes('Control')) {
      testData.push(
        { testName: 'Conductor Resistance Test', type: 'Acceptance', standard: 'IS:8130', cost: 4000, acceptanceCondition: 'Must pass to qualify' },
        { testName: 'Insulation Resistance Test', type: 'Routine', standard: 'IS:10810', cost: 2500, acceptanceCondition: '≥ 200 MΩ/km' },
        { testName: 'Tensile Strength Test', type: 'Quality', standard: 'IS:8130', cost: 5000, acceptanceCondition: 'Elongation ≥ 20%' },
        { testName: 'Smoke Density Test', type: 'Safety', standard: 'IS:8130', cost: 7000, acceptanceCondition: 'Optical density ≤ 0.5' }
      );
    } else {
      // Default tests
      testData.push(
        { testName: 'High Voltage Test', type: 'Acceptance', standard: 'IS:7098', cost: 15000, acceptanceCondition: 'Must pass to qualify' },
        { testName: 'Insulation Resistance Test', type: 'Routine', standard: 'IS:10810', cost: 3000, acceptanceCondition: '≥ 1000 MΩ/km' },
        { testName: 'Tensile Strength Test', type: 'Quality', standard: 'IS:8130', cost: 5000, acceptanceCondition: 'Elongation ≥ 20%' },
        { testName: 'Fire Resistance Test', type: 'Safety', standard: 'IS:10810', cost: 8000, acceptanceCondition: 'Pass IEC 60332-3' }
      );
    }

    return testData;
  };

  if (!rfp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading tender details...</p>
        </div>
      </div>
    );
  }


  

  // Process flow data removed (unused)

  // commit toggles and step helpers removed (not used currently)

  // TEST: Just render immediately to verify route is matching
  if (!rfp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tender details...</p>
          <p className="text-sm text-gray-400 mt-2">ID: {id}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <button
                onClick={() => navigate('/tender-manager')}
                className="text-gray-600 hover:text-gray-800"
              >
                ←
              </button>
              <h1 className="text-xl font-bold text-gray-900">{rfp?.title || 'Tender Details'}</h1>
            </div>
            <p className="text-sm text-gray-600">{rfp?.customer || ''}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.open('https://drive.google.com/file/d/1fYa3NFOtjI-AySIGrsOOC6jJ0SQ_O6Aq/view?usp=sharing', '_blank')}
              className="flex items-center gap-2 bg-primary text-white px-3 py-1.5 text-sm rounded-lg hover:bg-secondary transition-colors"
            >
              <FileText className="w-4 h-4" />
              View Tender
            </button>
            {scrapedTender && scrapedTender.tender_no && (
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`http://localhost:5001/tenders/view-csv/${scrapedTender.tender_no}`);
                    const data = await response.json();
                    if (data.success && data.csv_content) {
                      // Create blob and download
                      const blob = new Blob([data.csv_content], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `requirements_${scrapedTender.tender_no}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                    } else {
                      alert('CSV not available for this tender');
                    }
                  } catch (err) {
                    console.error('Failed to download CSV:', err);
                    alert('Failed to download CSV');
                  }
                }}
                className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
                View CSV
              </button>
            )}
          </div>
        </div>
        
        {/* Process Flow Navigation */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('vendor-validation')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                viewMode === 'vendor-validation' 
                  ? 'bg-[#06AEA9] text-white border-[#06AEA9] shadow-sm' 
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#06AEA9] hover:text-[#06AEA9]'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Vendor Validation
            </button>
            
            <div className="h-px w-2 bg-gray-300"></div>
            
            <button
              onClick={() => setViewMode('compliance-checklist')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                viewMode === 'compliance-checklist' 
                  ? 'bg-[#06AEA9] text-white border-[#06AEA9] shadow-sm' 
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#06AEA9] hover:text-[#06AEA9]'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              RFI Evaluation
            </button>
            
            <div className="h-px w-2 bg-gray-300"></div>
            
            <button
              onClick={() => setViewMode('technical-agent')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                viewMode === 'technical-agent' 
                  ? 'bg-[#06AEA9] text-white border-[#06AEA9] shadow-sm' 
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#06AEA9] hover:text-[#06AEA9]'
              }`}
            >
              <Wrench className="w-4 h-4" />
              Technical Evaluation
            </button>
            
            <div className="h-px w-2 bg-gray-300"></div>
            
            <button
              onClick={() => setViewMode('pricing-agent')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                viewMode === 'pricing-agent' 
                  ? 'bg-[#06AEA9] text-white border-[#06AEA9] shadow-sm' 
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#06AEA9] hover:text-[#06AEA9]'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Financial Evaluation
            </button>
            
            <div className="h-px w-2 bg-gray-300"></div>
            
            <button
              onClick={() => setViewMode('legal-compliance')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                viewMode === 'legal-compliance' 
                  ? 'bg-[#06AEA9] text-white border-[#06AEA9] shadow-sm' 
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#06AEA9] hover:text-[#06AEA9]'
              }`}
            >
              <Scale className="w-4 h-4" />
              Final review
            </button>
            
            <div className="h-px w-2 bg-gray-300"></div>
            
            <button
              onClick={() => setViewMode('generate-rfp-response')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                viewMode === 'generate-rfp-response' 
                  ? 'bg-[#06AEA9] text-white border-[#06AEA9] shadow-sm' 
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#06AEA9] hover:text-[#06AEA9]'
              }`}
            >
              <Send className="w-4 h-4" />
              Generate
            </button>
            
            <div className="h-px w-2 bg-gray-300"></div>
            
            <button
              onClick={() => setViewMode('award-decision')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                viewMode === 'award-decision' 
                  ? 'bg-[#06AEA9] text-white border-[#06AEA9] shadow-sm' 
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#06AEA9] hover:text-[#06AEA9]'
              }`}
            >
              <Award className="w-4 h-4" />
              Award Decision
            </button>
            
            <div className="flex-1"></div>
            
            <button
              onClick={() => setIsPdfViewerOpen(!isPdfViewerOpen)}
              className="flex items-center justify-center p-2 rounded-lg text-sm font-medium transition-all border bg-white text-gray-700 border-gray-200 hover:border-[#06AEA9] hover:text-[#06AEA9]"
              title={isPdfViewerOpen ? 'Hide PDF' : 'Show PDF'}
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="flex gap-0 mt-[8rem]">
        {/* LEFT SIDEBAR - Company Leaderboard */}
        <div className={`${viewMode === 'award-decision' ? 'hidden' : isSidebarCollapsed ? 'w-0' : 'w-64'} flex-shrink-0 fixed top-[8rem] left-0 h-[calc(100vh-160px)] transition-all duration-300 bg-white border-r border-gray-200 shadow-sm z-30 rounded-tl-lg overflow-hidden`}>
          <div className="w-64 h-full overflow-y-auto">
            <div className="bg-gradient-to-r from-[#06AEA9] to-[#028090] text-white p-3 relative">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <h2 className="text-base font-bold">Leaderboard</h2>
                </div>
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  title="Collapse sidebar"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
              <p className="text-white/80 text-[11px]">Top ranked vendors</p>
            </div>
          
          <div className="p-3 space-y-2 overflow-visible">
            {isLoadingVendors ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#06AEA9] mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Loading vendors...</p>
              </div>
            ) : vendors.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Building2 className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-semibold mb-1">No submissions yet</p>
                <p className="text-xs text-gray-500">Vendor submissions will appear here once received</p>
              </div>
            ) : (
              vendors.map((vendor) => {
              const isSelected = selectedVendor === vendor.id;
              const isHovered = hoveredVendor === vendor.id;
              
              return (
                <div key={vendor.id} className="relative">
                  <button
                    onClick={() => {
                      handleVendorSelect(vendor.id);
                      setHoveredVendor(null);
                    }}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all shadow-sm hover:shadow-md ${
                      isSelected
                        ? 'border-[#06AEA9] bg-gradient-to-r from-[#06AEA9]/10 to-[#028090]/5'
                        : 'border-gray-200 hover:border-[#06AEA9]/50 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Rank Badge - Hoverable */}
                      <div 
                        onMouseEnter={() => setHoveredVendor(vendor.id)}
                        onMouseLeave={() => setHoveredVendor(null)}
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-base cursor-help shadow-md ${
                          vendor.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-yellow-900' :
                          vendor.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800' :
                          vendor.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-orange-900' :
                          'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700'
                        }`}
                      >
                        {vendor.rank}
                      </div>

                      {/* Vendor Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-gray-900 truncate mb-1">{vendor.name}</h3>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">Score:</span>
                            <span 
                              onMouseEnter={() => setHoveredVendor(vendor.id)}
                              onMouseLeave={() => setHoveredVendor(null)}
                              className="text-sm font-bold text-[#06AEA9] cursor-help hover:underline"
                            >
                              {vendor.score}
                            </span>
                          </div>
                          <div className="h-1 flex-1 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#06AEA9] to-[#028090] rounded-full transition-all"
                              style={{ width: `${vendor.score}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Hover Info Card */}
                  {isHovered && vendor.technical !== undefined && (
                    <div className="fixed left-[272px] w-72 bg-white rounded-lg shadow-2xl border-2 border-[#06AEA9] z-[100] p-4 animate-in fade-in slide-in-from-left-2 duration-200" style={{ top: `8rem` }}>
                      {/* Header */}
                      <div className="mb-3 pb-3 border-b border-gray-200">
                        <h4 className="font-bold text-sm text-gray-900 mb-1">{vendor.name}</h4>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Overall Score</span>
                          <span className="text-lg font-bold text-[#06AEA9]">{vendor.score}/100</span>
                        </div>
                      </div>

                      {/* Score Breakdown */}
                      <div className="space-y-2.5">
                        {/* Vendor Validation */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Vendor Validation</span>
                            <span className="text-xs font-semibold text-gray-900">{vendor.verification}/100</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-[#06AEA9] to-[#028090] rounded-full transition-all"
                                style={{ width: `${vendor.verification}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-semibold text-[#06AEA9] w-10 text-right">
                              {vendor.verification}%
                            </span>
                          </div>
                        </div>

                        {/* RFI Evaluation */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">RFI Evaluation</span>
                            <span className="text-xs font-semibold text-gray-900">{vendor.elegibility}/100</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-[#06AEA9] to-[#028090] rounded-full transition-all"
                                style={{ width: `${vendor.elegibility}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-semibold text-[#06AEA9] w-10 text-right">
                              {vendor.elegibility}%
                            </span>
                          </div>
                        </div>

                        {/* Technical */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Technical</span>
                            <span className="text-xs font-semibold text-gray-900">{vendor.technical}/100</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-[#06AEA9] to-[#028090] rounded-full transition-all"
                                style={{ width: `${vendor.technical}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-semibold text-[#06AEA9] w-10 text-right">
                              {vendor.technical}%
                            </span>
                          </div>
                        </div>

                        {/* Financial */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Financial</span>
                            <span className="text-xs font-semibold text-gray-900">{vendor.financial}/100</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-[#06AEA9] to-[#028090] rounded-full transition-all"
                                style={{ width: `${vendor.financial}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-semibold text-[#06AEA9] w-10 text-right">
                              {vendor.financial}%
                            </span>
                          </div>
                        </div>

                        {/* Legal */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Legal</span>
                            <span className="text-xs font-semibold text-gray-900">{vendor.legal}/100</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-[#06AEA9] to-[#028090] rounded-full transition-all"
                                style={{ width: `${vendor.legal}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-semibold text-[#06AEA9] w-10 text-right">
                              {vendor.legal}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Rank</span>
                          <span className={`font-bold ${
                            vendor.rank === 1 ? 'text-yellow-600' :
                            vendor.rank === 2 ? 'text-gray-600' :
                            vendor.rank === 3 ? 'text-orange-600' :
                            'text-gray-500'
                          }`}>#{vendor.rank}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
            )}
          </div>
          </div>
        </div>
        
        {/* Sidebar Toggle Button - Visible when collapsed */}
        {isSidebarCollapsed && (
          <button
            onClick={() => setIsSidebarCollapsed(false)}
            className="fixed top-[180px] left-2 z-40 p-2 bg-[#06AEA9] text-white rounded-lg shadow-lg hover:bg-[#028090] transition-all"
            title="Open sidebar"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* RIGHT SIDE - Content */}
        <div className={`flex-1 ${isPdfViewerOpen ? 'flex gap-4' : ''} ${viewMode === 'award-decision' ? 'ml-0' : isSidebarCollapsed ? 'ml-0' : 'ml-[17rem]'} transition-all duration-300`}>
          {/* Content Area */}
          <div className={`${isPdfViewerOpen ? 'flex-1' : 'w-full'} bg-white`}>
        {viewMode === 'process' && (
          <div className="space-y-6">
              {/* Beautiful Tender Project Card */}
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                {/* Background with gradient and pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary/80"></div>
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>
                
                {/* Content */}
                <div className="relative p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <ShoppingBag className="w-6 h-6 text-white" />
                      </div>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        Active Project
                      </div>
                    </div>
                    
                    <h1 className="text-3xl font-bold text-white mb-2 leading-tight">
                      {rfp.title}
                    </h1>
                    <p className="text-blue-100 text-lg font-medium mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                      </svg>
                      {rfp.customer}
                    </p>
                    
                    {/* Key Metrics Row */}
                    <div className="grid grid-cols-4 gap-4 mt-6">
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                        <p className="text-xs text-blue-100 mb-1 font-medium">Project Value</p>
                        <p className="text-2xl font-bold text-white">{rfp.value}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                        <p className="text-xs text-blue-100 mb-1 font-medium">Submission Date</p>
                        <p className="text-xl font-bold text-white">{rfp.submissionDate}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                        <p className="text-xs text-blue-100 mb-1 font-medium">Current Status</p>
                        <p className="text-lg font-semibold text-white">{rfp.currentAgent}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                        <p className="text-xs text-blue-100 mb-1 font-medium">Progress</p>
                        <p className="text-xl font-bold text-white">
                          {rfp.agents?.salesAgent.completed && rfp.agents?.technicalAgent.completed && rfp.agents?.pricingAgent.completed ? '100%' :
                           rfp.agents?.salesAgent.completed && rfp.agents?.technicalAgent.completed ? '75%' :
                           rfp.agents?.salesAgent.completed ? '50%' : '25%'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3 ml-6">
                    <button
                      onClick={() => window.open('https://drive.google.com/file/d/1fYa3NFOtjI-AySIGrsOOC6jJ0SQ_O6Aq/view?usp=sharing', '_blank')}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white text-primary rounded-lg hover:bg-blue-50 transition-colors font-semibold shadow-lg"
                    >
                      <Download className="w-4 h-4" />
                      View Document
                    </button>
                    <div className="text-right">
                      <p className="text-xs text-blue-100 mb-1">Tender ID</p>
                      <p className="text-lg font-mono font-bold text-white">#{rfp.id}</p>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    Overall Progress
                    <span className="text-sm font-bold text-white">
                      {rfp.agents?.salesAgent.completed && rfp.agents?.technicalAgent.completed && rfp.agents?.pricingAgent.completed ? '100%' :
                       rfp.agents?.salesAgent.completed && rfp.agents?.technicalAgent.completed ? '75%' :
                       rfp.agents?.salesAgent.completed ? '50%' : '25%'}
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-lg"
                      style={{ 
                        width: rfp.agents?.salesAgent.completed && rfp.agents?.technicalAgent.completed && rfp.agents?.pricingAgent.completed ? '100%' :
                                rfp.agents?.salesAgent.completed && rfp.agents?.technicalAgent.completed ? '75%' :
                                rfp.agents?.salesAgent.completed ? '50%' : '25%'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Process Flow Start - Tender Timeline */}
            {rfp.tenderTimeline && (
              <div className="bg-white rounded-lg shadow-sm border-2 border-primary/30 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Tender Timeline</h3>
                      <p className="text-xs text-gray-600">Process Flow - Step 1</p>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 bg-blue-50 rounded-full border border-blue-200">
                    Starting Point
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-600 font-semibold mb-1">Uploaded</p>
                    <p className="text-sm font-bold text-gray-900">{rfp.tenderTimeline.tenderUploadedOn}</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-xs text-green-600 font-semibold mb-1">Bidding Starts</p>
                    <p className="text-sm font-bold text-gray-900">{rfp.tenderTimeline.biddingStartDate}</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-xs text-red-600 font-semibold mb-1">Closing Date</p>
                    <p className="text-sm font-bold text-gray-900">{rfp.tenderTimeline.tenderClosingDate}</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <p className="text-xs text-purple-600 font-semibold mb-1">Validity</p>
                    <p className="text-sm font-bold text-gray-900">{rfp.tenderTimeline.validityOfOffer}</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <p className="text-xs text-orange-600 font-semibold mb-1">Completion Period</p>
                    <p className="text-sm font-bold text-gray-900">{rfp.tenderTimeline.periodOfCompletion}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Workflow Pipeline */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Tender Processing Pipeline</h3>
                  <p className="text-xs text-gray-600">Agent-based workflow automation</p>
                </div>
              </div>

              {/* Agent Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Sales Agent */}
                <div className={`relative rounded-lg border-2 p-4 transition-all ${
                  rfp.agents?.salesAgent.completed 
                    ? 'bg-green-50 border-green-500' 
                    : 'bg-blue-50 border-blue-500'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        rfp.agents?.salesAgent.completed ? 'bg-green-500' : 'bg-blue-500'
                      }`}>
                        <ShoppingBag className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Sales Agent</h4>
                        <p className="text-xs text-gray-600">Step 1</p>
                      </div>
                    </div>
                    {rfp.agents?.salesAgent.completed && (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-1.5 h-1.5 rounded-full ${rfp.agents?.salesAgent.completed ? 'bg-green-600' : 'bg-blue-600'}`}></div>
                      Tender analysis & extraction
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-1.5 h-1.5 rounded-full ${rfp.agents?.salesAgent.completed ? 'bg-green-600' : 'bg-blue-600'}`}></div>
                      Requirements identification
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-1.5 h-1.5 rounded-full ${rfp.agents?.salesAgent.completed ? 'bg-green-600' : 'bg-blue-600'}`}></div>
                      Initial feasibility check
                    </div>
                  </div>
                  {rfp.agents?.salesAgent.completed && rfp.agents.salesAgent.date && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-xs text-gray-600">Completed: {rfp.agents.salesAgent.date}</p>
                    </div>
                  )}
                  {!rfp.agents?.salesAgent.completed && (
                    <button 
                      onClick={() => setViewMode('sales-output')}
                      className="mt-3 w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-semibold"
                    >
                      View Details
                    </button>
                  )}
                </div>

                {/* Technical Agent */}
                <div className={`relative rounded-lg border-2 p-4 transition-all ${
                  rfp.agents?.technicalAgent.completed 
                    ? 'bg-green-50 border-green-500' 
                    : rfp.agents?.salesAgent.completed
                    ? 'bg-orange-50 border-orange-500'
                    : 'bg-gray-50 border-gray-300'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        rfp.agents?.technicalAgent.completed ? 'bg-green-500' : 
                        rfp.agents?.salesAgent.completed ? 'bg-orange-500' : 'bg-gray-400'
                      }`}>
                        <Wrench className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Technical Agent</h4>
                        <p className="text-xs text-gray-600">Step 2</p>
                      </div>
                    </div>
                    {rfp.agents?.technicalAgent.completed && (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        rfp.agents?.technicalAgent.completed ? 'bg-green-600' : 
                        rfp.agents?.salesAgent.completed ? 'bg-orange-600' : 'bg-gray-400'
                      }`}></div>
                      SKU matching & analysis
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        rfp.agents?.technicalAgent.completed ? 'bg-green-600' : 
                        rfp.agents?.salesAgent.completed ? 'bg-orange-600' : 'bg-gray-400'
                      }`}></div>
                      Specification comparison
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        rfp.agents?.technicalAgent.completed ? 'bg-green-600' : 
                        rfp.agents?.salesAgent.completed ? 'bg-orange-600' : 'bg-gray-400'
                      }`}></div>
                      Product recommendation
                    </div>
                  </div>
                  {rfp.agents?.technicalAgent.completed && rfp.agents.technicalAgent.date && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-xs text-gray-600">Completed: {rfp.agents.technicalAgent.date}</p>
                    </div>
                  )}
                  {rfp.agents?.salesAgent.completed && !rfp.agents?.technicalAgent.completed && (
                    <button 
                      onClick={() => setViewMode('technical-agent')}
                      className="mt-3 w-full px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-xs font-semibold"
                    >
                      Review & Process
                    </button>
                  )}
                </div>

                {/* Pricing Agent */}
                <div className={`relative rounded-lg border-2 p-4 transition-all ${
                  rfp.agents?.pricingAgent.completed 
                    ? 'bg-green-50 border-green-500' 
                    : rfp.agents?.technicalAgent.completed || movedToPricing
                    ? 'bg-purple-50 border-purple-500'
                    : 'bg-gray-50 border-gray-300'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        rfp.agents?.pricingAgent.completed ? 'bg-green-500' : 
                        rfp.agents?.technicalAgent.completed || movedToPricing ? 'bg-purple-500' : 'bg-gray-400'
                      }`}>
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Pricing Agent</h4>
                        <p className="text-xs text-gray-600">Step 3</p>
                      </div>
                    </div>
                    {rfp.agents?.pricingAgent.completed && (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        rfp.agents?.pricingAgent.completed ? 'bg-green-600' : 
                        rfp.agents?.technicalAgent.completed || movedToPricing ? 'bg-purple-600' : 'bg-gray-400'
                      }`}></div>
                      Cost calculation & breakdown
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        rfp.agents?.pricingAgent.completed ? 'bg-green-600' : 
                        rfp.agents?.technicalAgent.completed || movedToPricing ? 'bg-purple-600' : 'bg-gray-400'
                      }`}></div>
                      Testing cost estimation
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        rfp.agents?.pricingAgent.completed ? 'bg-green-600' : 
                        rfp.agents?.technicalAgent.completed || movedToPricing ? 'bg-purple-600' : 'bg-gray-400'
                      }`}></div>
                      Final pricing summary
                    </div>
                  </div>
                  {rfp.agents?.pricingAgent.completed && rfp.agents.pricingAgent.date && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-xs text-gray-600">Completed: {rfp.agents.pricingAgent.date}</p>
                    </div>
                  )}
                  {(rfp.agents?.technicalAgent.completed || movedToPricing) && !rfp.agents?.pricingAgent.completed && (
                    <button 
                      onClick={() => setViewMode('pricing-agent')}
                      className="mt-3 w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs font-semibold"
                    >
                      View Pricing
                    </button>
                  )}
                </div>
              </div>

              {/* Process Flow Diagram */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    rfp.agents?.salesAgent.completed ? 'bg-green-500' : 'bg-blue-500'
                  }`}>
                    1
                  </div>
                  <p className="text-xs font-semibold text-gray-700 mt-2">Sales</p>
                </div>
                <div className={`h-1 w-20 ${rfp.agents?.salesAgent.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    rfp.agents?.technicalAgent.completed ? 'bg-green-500' : 
                    rfp.agents?.salesAgent.completed ? 'bg-orange-500' : 'bg-gray-300'
                  }`}>
                    2
                  </div>
                  <p className="text-xs font-semibold text-gray-700 mt-2">Technical</p>
                </div>
                <div className={`h-1 w-20 ${rfp.agents?.technicalAgent.completed || movedToPricing ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    rfp.agents?.pricingAgent.completed ? 'bg-green-500' : 
                    rfp.agents?.technicalAgent.completed || movedToPricing ? 'bg-purple-500' : 'bg-gray-300'
                  }`}>
                    3
                  </div>
                  <p className="text-xs font-semibold text-gray-700 mt-2">Pricing</p>
                </div>
                <div className={`h-1 w-20 ${rfp.agents?.pricingAgent.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    rfp.agents?.pricingAgent.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    <FileSpreadsheet className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-xs font-semibold text-gray-700 mt-2">Generate</p>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Next Steps
                </h4>
                <ul className="space-y-1.5 text-xs text-blue-800">
                  {!rfp.agents?.salesAgent.completed && <li className="flex items-start gap-2">•Complete sales agent analysis and tender overview extraction</li>}
                  {rfp.agents?.salesAgent.completed && !rfp.agents?.technicalAgent.completed && (
                    <>
                      <li className="flex items-start gap-2">•Review technical requirements and select matching SKUs</li>
                      <li className="flex items-start gap-2">•Verify specification compliance for each product</li>
                    </>
                  )}
                  {(rfp.agents?.technicalAgent.completed || movedToPricing) && !rfp.agents?.pricingAgent.completed && (
                    <>
                      <li className="flex items-start gap-2">•Review detailed pricing breakdown for all selected SKUs</li>
                      <li className="flex items-start gap-2">•Complete acceptance testing requirements approval</li>
                    </>
                  )}
                  {rfp.agents?.pricingAgent.completed && (
                    <li className="flex items-start gap-2">•Generate final tender response document and competitive analysis</li>
                  )}
                </ul>
              </div>
            </div>

              {/* Financial Details */}
              {rfp.financialDetails && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      3
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Financial Details</h3>
                      <p className="text-xs text-gray-600">Budget and cost requirements</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-600 font-semibold mb-2">Advertised Value</p>
                      <p className="text-2xl font-bold text-gray-900">{rfp.financialDetails.advertisedValue}</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                      <p className="text-xs text-orange-600 font-semibold mb-2">Earnest Money (EMD)</p>
                      <p className="text-2xl font-bold text-gray-900">{rfp.financialDetails.earnestMoney}</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                      <p className="text-xs text-green-600 font-semibold mb-2">Tender Document Cost</p>
                      <p className="text-2xl font-bold text-gray-900">{rfp.financialDetails.tenderDocumentCost}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        {viewMode === 'sales-output' && (
        rfp.tenderOverview ? (
        <div className="space-y-6">
          {/* Tender Overview Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              🧾 Tender Overview
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-600">Name of Work</p>
                <p className="text-base text-gray-900 mt-1">{rfp.tenderOverview.nameOfWork}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Bidding Type</p>
                <p className="text-base text-gray-900 mt-1">{rfp.tenderOverview.biddingType}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Tender Type</p>
                <p className="text-base text-gray-900 mt-1">{rfp.tenderOverview.tenderType}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Bidding System</p>
                <p className="text-base text-gray-900 mt-1">{rfp.tenderOverview.biddingSystem}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Tendering Section</p>
                <p className="text-base text-gray-900 mt-1">{rfp.tenderOverview.tenderingSection}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Contract Type</p>
                <p className="text-base text-gray-900 mt-1">{rfp.tenderOverview.contractType}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Contract Category</p>
                <p className="text-base text-gray-900 mt-1">{rfp.tenderOverview.contractCategory}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Expenditure Type</p>
                <p className="text-base text-gray-900 mt-1">{rfp.tenderOverview.expenditureType}</p>
              </div>
            </div>
          </div>

          {/* Tender Timeline Section */}
          {rfp.tenderTimeline && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                📅 Tender Timeline
              </h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Tender Uploaded On</p>
                  <p className="text-base text-gray-900 mt-1">{rfp.tenderTimeline.tenderUploadedOn}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Bidding Start Date</p>
                  <p className="text-base text-gray-900 mt-1">{rfp.tenderTimeline.biddingStartDate}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Tender Closing Date</p>
                  <p className="text-base text-gray-900 mt-1">{rfp.tenderTimeline.tenderClosingDate}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Validity of Offer</p>
                  <p className="text-base text-gray-900 mt-1">{rfp.tenderTimeline.validityOfOffer}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Period of Completion</p>
                  <p className="text-base text-gray-900 mt-1">{rfp.tenderTimeline.periodOfCompletion}</p>
                </div>
              </div>
            </div>
          )}

          {/* Financial Details Section */}
          {rfp.financialDetails && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                💰 Financial Details
              </h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Advertised Value (₹)</p>
                  <p className="text-xl font-bold text-primary mt-1">{rfp.financialDetails.advertisedValue}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Earnest Money (EMD) (₹)</p>
                  <p className="text-xl font-bold text-green-600 mt-1">{rfp.financialDetails.earnestMoney}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Tender Document Cost (₹)</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{rfp.financialDetails.tenderDocumentCost}</p>
                </div>
              </div>
            </div>
          )}

          {/* Bidding Details Section */}
          {rfp.biddingDetails && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                ⚙️ Bidding Details
              </h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Bidding Style</p>
                  <p className="text-base text-gray-900 mt-1">{rfp.biddingDetails.biddingStyle}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Bidding Unit</p>
                  <p className="text-base text-gray-900 mt-1">{rfp.biddingDetails.biddingUnit}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Ranking Order</p>
                  <p className="text-base text-gray-900 mt-1">{rfp.biddingDetails.rankingOrder}</p>
                </div>
              </div>
            </div>
          )}

          {/* Participation Rules Section */}
          {rfp.participationRules && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                🚫 Participation Rules
              </h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Pre-Bid Conference</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      rfp.participationRules.preBidConference 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {rfp.participationRules.preBidConference ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {rfp.participationRules.preBidConferenceNote && (
                    <p className="text-sm text-gray-600 mt-2">{rfp.participationRules.preBidConferenceNote}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Joint Venture (JV)</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                    rfp.participationRules.jointVenture 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {rfp.participationRules.jointVenture ? 'Allowed' : 'Not Allowed'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Consortium</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                    rfp.participationRules.consortium 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {rfp.participationRules.consortium ? 'Allowed' : 'Not Allowed'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Requirements Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              📋 Product Requirements
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">S.No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Product Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Specification</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Unit</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Standards</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">1</td>
                    <td className="px-4 py-3 text-sm text-gray-900">HV Cable - 220kV</td>
                    <td className="px-4 py-3 text-sm text-gray-700">3-core, XLPE insulated, Copper conductor</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">500</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Meter</td>
                    <td className="px-4 py-3 text-sm text-gray-700">IS 7098, IEC 60502</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">2</td>
                    <td className="px-4 py-3 text-sm text-gray-900">LV Cable - 33kV</td>
                    <td className="px-4 py-3 text-sm text-gray-700">4-core, PVC insulated, Aluminum conductor</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">800</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Meter</td>
                    <td className="px-4 py-3 text-sm text-gray-700">IS 1554, IS 10810</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">3</td>
                    <td className="px-4 py-3 text-sm text-gray-900">Control Cable - 2.5mm²</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Multi-core, Shielded, PVC insulated</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">1200</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Meter</td>
                    <td className="px-4 py-3 text-sm text-gray-700">IS 8130</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">4</td>
                    <td className="px-4 py-3 text-sm text-gray-900">Instrumentation Cable</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Multi-pair, Shielded, 300V rated</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">600</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Meter</td>
                    <td className="px-4 py-3 text-sm text-gray-700">IS 10810</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">5</td>
                    <td className="px-4 py-3 text-sm text-gray-900">Fiber Optic Cable - 24 Core</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Single-mode, Steel tape armored, PE sheath</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">300</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Meter</td>
                    <td className="px-4 py-3 text-sm text-gray-700">IEC 60794</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">6</td>
                    <td className="px-4 py-3 text-sm text-gray-900">Fire Resistant Cable</td>
                    <td className="px-4 py-3 text-sm text-gray-700">LSZH, Mica tape, 0.6/1kV</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">400</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Meter</td>
                    <td className="px-4 py-3 text-sm text-gray-700">IEC 60331, IS 1554</td>
                  </tr>
                  <tr className="bg-gray-50 border-t-2 border-gray-300">
                    <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-gray-900">Total Items</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">3,800</td>
                    <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-gray-700">Meters</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> All products must comply with the specified standards and undergo acceptance testing before delivery.
              </p>
            </div>
          </div>
        </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <ShoppingBag className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sales Agent Not Run Yet</h3>
              <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                The Sales Agent needs to process this RFP to extract tender details, timeline, financial information, and participation rules.
              </p>
              <button
                onClick={() => handleRunAgent('Sales Agent')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors shadow-md"
              >
                <Play className="w-5 h-5" />
                Run Sales Agent
              </button>
            </div>
          </div>
        )
      )}

      {viewMode === 'vendor-validation' && (
        <div className="h-full flex flex-col">
          {/* Vendor Validation Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
            <div className="bg-gradient-to-r from-[#06AEA9] to-[#028090] text-white p-3">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4" />
                <h2 className="text-base font-bold">Vendor Validation</h2>
              </div>
              <p className="text-white/80 text-[11px]">Review and validate vendor credentials and documentation</p>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">

            {isLoadingSubmission || isAIProcessing() ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#06AEA9] mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">{isAIProcessing() ? 'AI Processing submission...' : 'Loading vendor details...'}</p>
              </div>
            ) : (
            <>

            {/* Verification Score Summary */}
            {submissionDetails?.evaluation?.verification && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900">Verification Evaluation Summary</p>
                  <span className="text-lg font-bold text-[#06AEA9]">
                    {submissionDetails.evaluation.verification.score}/100
                  </span>
                </div>
                {submissionDetails.evaluation.verification.reasoning && (
                  <p className="text-xs text-gray-700">{submissionDetails.evaluation.verification.reasoning}</p>
                )}
              </div>
            )}

            <div className="space-y-4">
              {/* Vendor Verification */}
              {submissionDetails ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                  <div 
                    className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors border-b border-gray-200"
                    onClick={() => setExpandedComplianceId(expandedComplianceId === 'verification' ? null : 'verification')}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`transform transition-transform ${expandedComplianceId === 'verification' ? 'rotate-90' : ''}`}>
                        <ChevronDown className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Vendor Verification Checklist</h3>
                    </div>
                    <span className="text-sm text-gray-600">
                      {submissionDetails?.evaluation?.verification?.items ? 
                        `${submissionDetails.evaluation.verification.items.filter((item: any) => item.passed).length}/${submissionDetails.evaluation.verification.items.length} passed` : '0 checks'}
                    </span>
                  </div>
                  {expandedComplianceId === 'verification' && (
                    <div className="p-5 bg-white border-t border-gray-200">
                      {submissionDetails?.evaluation?.verification?.items && (
                        <div className="space-y-3">
                          {submissionDetails.evaluation.verification.items.map((item: { passed: boolean; check: string }, idx: number) => {
                            return (
                              <div key={idx} className="flex items-start gap-3">
                                {item.passed ? (
                                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                ) : (
                                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                )}
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{item.check}</p>
                                  <p className="text-xs text-gray-600">{item.passed ? 'Verification passed' : 'Verification failed or pending'}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Select a vendor to view details</p>
                </div>
              )}
            </div>
</>
            )}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'compliance-checklist' && (
        <div className="h-full flex flex-col">
          {/* Compliance Checklist Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
            <div className="bg-gradient-to-r from-[#06AEA9] to-[#028090] text-white p-3">
              <div className="flex items-center gap-2 mb-1">
                <ClipboardCheck className="w-4 h-4" />
                <h2 className="text-base font-bold">Compliance Checklist Review</h2>
              </div>
              <p className="text-white/80 text-[11px]">Review vendor submissions and supporting documents</p>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">

            {isAIProcessing() ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#06AEA9] mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">AI Processing submission...</p>
              </div>
            ) : (
            <>

            <div className="space-y-4">
              {/* Eligibility Criteria */}
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <div 
                  className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors border-b border-gray-200"
                  onClick={() => setExpandedComplianceId(expandedComplianceId === 'eligibility' ? null : 'eligibility')}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`transform transition-transform ${expandedComplianceId === 'eligibility' ? 'rotate-90' : ''}`}>
                      <ChevronDown className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex items-center gap-3 flex-1">
                      <h3 className="font-semibold text-gray-900">Eligibility Criteria</h3>
                      
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#06AEA9]">
                      {submissionDetails?.evaluation?.eligibility?.score || 0}/100
                    </span>
                  </div>
                </div>
                {expandedComplianceId === 'eligibility' && (
                  <div className="p-5 bg-white border-t border-gray-200">
                    {submissionDetails?.evaluation?.eligibility?.reasoning && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-semibold text-gray-900 mb-1">Evaluation Summary</p>
                        <p className="text-xs text-gray-700">{submissionDetails.evaluation.eligibility.reasoning}</p>
                        <p className="text-sm font-bold text-[#06AEA9] mt-2">
                          Score: {submissionDetails.evaluation.eligibility.score}/100
                        </p>
                      </div>
                    )}
                    
                    {submissionDetails?.evaluation?.eligibility?.items && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900">Requirements</h4>
                        {submissionDetails.evaluation.eligibility.items.map((item: { met: boolean; requirement: string }, idx: number) => {
                          return (
                            <div key={idx} className="flex items-start gap-3">
                              {item.met ? (
                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900">{item.requirement}</p>
                                <p className="text-xs text-gray-600">{item.met ? 'Requirement met' : 'Not met'}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                   
                  </div>
                )}
              </div>
            </div>
</>
            )}

            {/* Approval Status */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              {isStageApproved(2) ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Approved</span>
                  </div>
                  <p className="text-center text-sm text-gray-500">Approved by {getRandomApprover(2)}</p>
                </div>
              ) : (
                <button className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#06AEA9] text-white rounded-lg font-medium hover:bg-[#028090] transition-all shadow-sm hover:shadow-md">
                  <CheckCircle className="w-4 h-4" />
                  Approve RFI
                </button>
              )}
            </div>
          </div>
        </div>
        </div>
      )}

      {viewMode === 'technical-agent' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
          <div className="bg-gradient-to-r from-[#06AEA9] to-[#028090] text-white p-3">
            <div className="flex items-center gap-2 mb-1">
              <Wrench className="w-4 h-4" />
              <h2 className="text-base font-bold">Technical Evaluation</h2>
            </div>
            <p className="text-white/80 text-[11px]">Technical specifications and compliance review</p>
          </div>
          <div className="flex-1 p-6 overflow-y-auto">

          {isAIProcessing() ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#06AEA9] mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">AI Processing submission...</p>
            </div>
          ) : (
          <>

          <div className="space-y-4">
            {/* Technical Score Summary */}
            {submissionDetails?.evaluation?.technical && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900">Technical Evaluation Summary</p>
                  <span className="text-lg font-bold text-[#06AEA9]">
                    {submissionDetails.evaluation.technical.score}/100
                  </span>
                </div>
                <p className="text-xs text-gray-700">{submissionDetails.evaluation.technical.reasoning}</p>
              </div>
            )}

            {/* SKU Compliance */}
            {submissionDetails?.evaluation?.technical?.skus && submissionDetails.evaluation.technical.skus.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <div 
                  className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors border-b border-gray-200"
                  onClick={() => setExpandedTechnicalId(expandedTechnicalId === 'sku-compliance' ? null : 'sku-compliance')}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`transform transition-transform ${expandedTechnicalId === 'sku-compliance' ? 'rotate-90' : ''}`}>
                      <ChevronDown className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Product Specifications Compliance</h3>
                  </div>
                  <span className="text-sm text-gray-600">
                    {submissionDetails.evaluation.technical.skus.length} components
                  </span>
                </div>
                {expandedTechnicalId === 'sku-compliance' && (
                  <div className="p-5 bg-white border-t border-gray-200">
                    <div className="space-y-4">
                      {submissionDetails.evaluation.technical.skus.map((sku: any, idx: number) => (
                        <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <h4 className="text-sm font-bold text-gray-900 mb-3">{sku.component}</h4>
                          <div className="space-y-2">
                            {sku.specs.map((spec: any, specIdx: number) => (
                              <div key={specIdx} className="flex items-start gap-3">
                                {spec.met ? (
                                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                ) : (
                                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900 capitalize">{spec.spec}</p>
                                  <p className="text-xs text-gray-600">
                                    Required: {spec.required}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Technical Checklist */}
            {submissionDetails?.evaluation?.technical?.checklist && submissionDetails.evaluation.technical.checklist.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <div 
                  className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors border-b border-gray-200"
                  onClick={() => setExpandedTechnicalId(expandedTechnicalId === 'checklist' ? null : 'checklist')}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`transform transition-transform ${expandedTechnicalId === 'checklist' ? 'rotate-90' : ''}`}>
                      <ChevronDown className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Technical Requirements Checklist</h3>
                  </div>
                  <span className="text-sm text-gray-600">
                    {submissionDetails.evaluation.technical.checklist.filter((item: any) => item.met).length}/{submissionDetails.evaluation.technical.checklist.length} met
                  </span>
                </div>
                {expandedTechnicalId === 'checklist' && (
                  <div className="p-5 bg-white border-t border-gray-200">
                    <div className="space-y-3">
                      {submissionDetails.evaluation.technical.checklist.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-3">
                          {item.met ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.requirement}</p>
                            <p className="text-xs text-gray-600">{item.met ? 'Requirement met' : 'Not met'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Original Requirement SKU Matching - Keep for backward compatibility */}
           
          </div>
</>
          )}

          {/* Approval Status */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            {isStageApproved(3) ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Approved</span>
                </div>
                <p className="text-center text-sm text-gray-500">Approved by {getRandomApprover(3)}</p>
              </div>
            ) : (
              <button className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#06AEA9] text-white rounded-lg font-medium hover:bg-[#028090] transition-all shadow-sm hover:shadow-md">
                <CheckCircle className="w-4 h-4" />
                Approve Technical Evaluation
              </button>
            )}
          </div>
          </div>
        </div>
      )}

      {viewMode === 'acceptance-testing' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Testing & Acceptance Requirements</h2>
          </div>

          {Object.keys(selectedSkuByItem).length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-sm text-yellow-800">No products selected. Please select products in the Technical Agent tab first.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto border border-gray-200 bg-white rounded-lg shadow-sm">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">Test Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">Standard</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">Cost (₹)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          Acceptance
                          Condition
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(selectedSkuByItem).flatMap(([itemId, skuId]) => {
                      const item = matchedItems.find(i => i.id === itemId);
                      const sku = item?.options.find(o => o.id === skuId);
                      if (!item || !sku) return [];
                      
                      const tests = getTestRequirements(item.name, sku.id);
                      
                      return tests.map((test, index) => {
                        const key = `${itemId}-${skuId}-${test.type}-${index}`;
                        const isFulfilling = testRequirements[itemId]?.[key] ?? false;
                        
                        return (
                          <tr key={key} className={`border-b border-gray-200 transition-colors ${isFulfilling ? 'bg-green-50' : ''} hover:bg-gray-50`}>
                            <td className="px-4 py-3 text-sm text-gray-900 whitespace-normal border-r border-gray-200">{test.testName}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">{test.type}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 whitespace-normal border-r border-gray-200">{item.name}</td>
                            <td className="px-4 py-3 text-sm font-mono text-gray-600 border-r border-gray-200">{test.standard}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium border-r border-gray-200">{test.cost.toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              <div className="flex items-center justify-between gap-4">
                                {test.acceptanceCondition}
                                <button
                                  onClick={() => {
                                    setTestRequirements(prev => ({
                                      ...prev,
                                      [itemId]: {
                                        ...prev[itemId],
                                        [key]: !isFulfilling
                                      }
                                    }));
                                  }}
                                  className={`px-3 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap ${
                                    isFulfilling
                                      ? 'bg-green-600 text-white hover:bg-green-700'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                >
                                  {isFulfilling ? '✓ Approved' : 'Approve'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {(() => {
                    const total = Object.values(testRequirements).reduce((sum, item) => sum + Object.values(item).filter(Boolean).length, 0);
                    const allTests = Object.entries(selectedSkuByItem).reduce((sum, [itemId]) => {
                      const item = matchedItems.find(i => i.id === itemId);
                      if (!item) return sum;
                      return sum + getTestRequirements(item.name, '').length;
                    }, 0);
                    return `${total} of ${allTests} tests approved`;
                  })()}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const newRequirements: Record<string, Record<string, boolean>> = {};
                      Object.entries(selectedSkuByItem).forEach(([itemId, skuId]) => {
                        const item = matchedItems.find(i => i.id === itemId);
                        const sku = item?.options.find(o => o.id === skuId);
                        if (!item || !sku) return;
                        const tests = getTestRequirements(item.name, sku.id);
                        newRequirements[itemId] = {};
                        tests.forEach((test, index) => {
                          const key = `${itemId}-${skuId}-${test.type}-${index}`;
                          newRequirements[itemId][key] = true;
                        });
                      });
                      setTestRequirements(newRequirements);
                    }}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors text-sm"
                  >
                    Approve All
                  </button>
                  <button
                    onClick={() => {
                      const allApproved = Object.entries(selectedSkuByItem).every(([itemId]) => {
                        const item = matchedItems.find(i => i.id === itemId);
                        if (!item) return false;
                        const tests = getTestRequirements(item.name, '');
                        const itemReqs = testRequirements[itemId] || {};
                        return tests.every((_, index) => {
                          const key = `${itemId}-${selectedSkuByItem[itemId]}-${tests[index].type}-${index}`;
                          return itemReqs[key] === true;
                        });
                      });
                      if (allApproved) {
                        setViewMode('pricing-agent');
                      } else {
                        alert('Please approve all requirements before proceeding to pricing.');
                      }
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Proceed to Pricing
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {viewMode === 'pricing-agent' && (
        <div className="h-full flex flex-col">
          {/* Financial Proposal Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
            <div className="bg-gradient-to-r from-[#06AEA9] to-[#028090] text-white p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4" />
                <h2 className="text-base font-bold">Financial Evaluation</h2>
              </div>
              <p className="text-white/80 text-[11px]">Review financial breakdown and cost analysis</p>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">

            {isLoadingSubmission || isAIProcessing() ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#06AEA9] mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">{isAIProcessing() ? 'AI Processing submission...' : 'Loading financial data...'}</p>
              </div>
            ) : (
            <>

            {/* Financial Score Summary */}
            {submissionDetails?.evaluation?.financial && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900">Financial Evaluation Summary</p>
                  <span className="text-lg font-bold text-[#06AEA9]">
                    {submissionDetails.evaluation.financial.score}/10
                  </span>
                </div>
                <p className="text-xs text-gray-700">{submissionDetails.evaluation.financial.reasoning || 'No financial evaluation summary available'}</p>
              </div>
            )}

            <div className="space-y-4">
              
              {/* Cost Breakdown by Component */}
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <div 
                  className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors border-b border-gray-200"
                  onClick={() => setExpandedPricingItemId(expandedPricingItemId === 'component-costs' ? null : 'component-costs')}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`transform transition-transform ${expandedPricingItemId === 'component-costs' ? 'rotate-90' : ''}`}>
                      <ChevronDown className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Component Cost Breakdown</h3>
                  </div>
                  <span className="text-sm text-gray-600">
                    {submissionDetails?.evaluation?.financial?.breakdown ? 
                      Object.keys(submissionDetails.evaluation.financial.breakdown).filter(k => k !== 'others' && k !== 'total_budget').length : 0} components
                  </span>
                </div>
                {expandedPricingItemId === 'component-costs' && (
                  <div className="p-5 bg-white border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-4">Detailed cost breakdown by component</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="text-left p-3 font-semibold text-gray-700">#</th>
                            <th className="text-left p-3 font-semibold text-gray-700">Component</th>
                            <th className="text-center p-3 font-semibold text-gray-700">Qty</th>
                            <th className="text-right p-3 font-semibold text-gray-700">Rate/Unit</th>
                            <th className="text-right p-3 font-semibold text-gray-700">Total Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {submissionDetails?.evaluation?.financial?.breakdown && 
                            Object.entries(submissionDetails.evaluation.financial.breakdown)
                              .filter(([key]) => key !== 'others' && key !== 'total_budget')
                              .map(([component, details]: [string, any], index) => (
                                <tr key={component} className="border-b border-gray-200">
                                  <td className="p-3 text-gray-600">{index + 1}</td>
                                  <td className="p-3 font-medium text-gray-900">{component}</td>
                                  <td className="text-center p-3 text-gray-700">{details.quantity || 'N/A'}</td>
                                  <td className="text-right p-3 text-gray-700">₹ {details.rate_per_unit?.toLocaleString('en-IN') || 'N/A'}</td>
                                  <td className="text-right p-3 font-semibold text-gray-900">₹ {details.total_cost?.toLocaleString('en-IN') || 'N/A'}</td>
                                </tr>
                              ))
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Other Costs */}
              {submissionDetails?.evaluation?.financial?.breakdown?.others && (
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                  <div 
                    className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors border-b border-gray-200"
                    onClick={() => setExpandedPricingItemId(expandedPricingItemId === 'other-costs' ? null : 'other-costs')}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`transform transition-transform ${expandedPricingItemId === 'other-costs' ? 'rotate-90' : ''}`}>
                        <ChevronDown className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Additional Costs</h3>
                    </div>
                    <span className="text-sm text-gray-600">
                      {Object.keys(submissionDetails.evaluation.financial.breakdown.others).length} items
                    </span>
                  </div>
                  {expandedPricingItemId === 'other-costs' && (
                    <div className="p-5 bg-white border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-4">Additional services and costs</p>
                      <div className="space-y-2">
                        {Object.entries(submissionDetails.evaluation.financial.breakdown.others).map(([service, cost]: [string, any]) => (
                          <div key={service} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700 capitalize">{service}</span>
                            <span className="text-sm font-semibold text-gray-900">₹ {cost?.toLocaleString('en-IN') || 'N/A'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Total Budget Summary */}
              {submissionDetails?.evaluation?.financial?.breakdown?.total_budget && (
                <div className="border border-[#06AEA9] rounded-lg bg-blue-50 p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Total Project Budget</h3>
                      <p className="text-xs text-gray-600">Complete project cost including all components and services</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#06AEA9]">
                        ₹ {submissionDetails.evaluation.financial.breakdown.total_budget?.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Financial Checklist */}
              {submissionDetails?.evaluation?.financial?.checklist && submissionDetails.evaluation.financial.checklist.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                  <div 
                    className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors border-b border-gray-200"
                    onClick={() => setExpandedPricingItemId(expandedPricingItemId === 'financial-checklist' ? null : 'financial-checklist')}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`transform transition-transform ${expandedPricingItemId === 'financial-checklist' ? 'rotate-90' : ''}`}>
                        <ChevronDown className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Financial Requirements Checklist</h3>
                    </div>
                    <span className="text-sm text-gray-600">
                      {submissionDetails.evaluation.financial.checklist.filter((item: any) => item.met).length}/{submissionDetails.evaluation.financial.checklist.length} met
                    </span>
                  </div>
                  {expandedPricingItemId === 'financial-checklist' && (
                    <div className="p-5 bg-white border-t border-gray-200">
                      <div className="space-y-2">
                        {submissionDetails.evaluation.financial.checklist.map((item: any, index: number) => (
                          <div 
                            key={index}
                            className={`flex items-start gap-3 p-3 rounded-lg border ${
                              item.met 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-red-50 border-red-200'
                            }`}
                          >
                            {item.met ? (
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${item.met ? 'text-green-900' : 'text-red-900'}`}>
                                {item.requirement}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
</>
            )}

            {/* Approval Status */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              {isStageApproved(4) ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Approved</span>
                  </div>
                  <p className="text-center text-sm text-gray-500">Approved by {getRandomApprover(4)}</p>
                </div>
              ) : (
                <button className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#06AEA9] text-white rounded-lg font-medium hover:bg-[#028090] transition-all shadow-sm hover:shadow-md">
                  <CheckCircle className="w-4 h-4" />
                  Approve Financial Proposal
                </button>
              )}
            </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'legal-compliance' && (
        <div className="flex flex-col h-full">
          {/* Legal & Compliance Card */}
          <div className="bg-gradient-to-r from-[#06AEA9] to-[#028090] text-white p-3">
            <div className="flex items-center gap-2 mb-1">
              <Scale className="w-4 h-4" />
              <h2 className="text-base font-bold">Legal & Compliance</h2>
            </div>
            <p className="text-white/80 text-[11px]">Review legal documents and compliance declarations</p>
          </div>
          <div className="overflow-y-auto flex-1 bg-white p-6">

            {isLoadingSubmission || isAIProcessing() ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#06AEA9] mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">{isAIProcessing() ? 'AI Processing submission...' : 'Loading legal compliance data...'}</p>
              </div>
            ) : submissionDetails?.evaluation ? (
              <div className="space-y-4">
                {/* Legal Requirements Summary */}
                {submissionDetails.evaluation.legal_reasoning && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-900 mb-1">Legal Compliance Summary</p>
                    <p className="text-xs text-gray-700">{submissionDetails.evaluation.legal_reasoning}</p>
                    <p className="text-sm font-bold text-[#06AEA9] mt-2">
                      Score: {submissionDetails.evaluation.legal_score}/100
                    </p>
                  </div>
                )}

                {/* Legal Requirements */}
                {submissionDetails.tender_requirements?.legal && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-900">Legal Requirements</h4>
                    {submissionDetails.tender_requirements.legal.map((req: string, idx: number) => {
                      const isMet = submissionDetails.evaluation?.legal?.[idx];
                      return (
                        <div key={idx} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            {isMet ? (
                              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{req}</p>
                              <p className="text-xs text-gray-600 mt-1">
                                {isMet ? 'Requirement met and verified' : 'Not met or pending verification'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Scale className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Select a vendor to view legal compliance</p>
              </div>
            )}

            {/* Legal Evaluation Items */}
            {submissionDetails?.evaluation?.legal?.items && submissionDetails.evaluation.legal.items.length > 0 && (
              <div className="space-y-4 mt-6">
                {/* Legal Score Summary */}
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-900">Legal Evaluation Score</p>
                    <span className="text-lg font-bold text-[#06AEA9]">
                      {submissionDetails.evaluation.legal.score}/100
                    </span>
                  </div>
                  {submissionDetails.evaluation.legal.reasoning && (
                    <p className="text-xs text-gray-700">{submissionDetails.evaluation.legal.reasoning}</p>
                  )}
                </div>

                {/* Legal Requirements Checklist */}
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                  <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Legal Requirements Checklist</h3>
                    <span className="text-sm text-gray-600">
                      {submissionDetails.evaluation.legal.items.filter((item: any) => item.met).length}/{submissionDetails.evaluation.legal.items.length} met
                    </span>
                  </div>
                  <div className="p-5 bg-white">
                    <div className="space-y-3">
                      {submissionDetails.evaluation.legal.items.map((item: any, index: number) => (
                        <div 
                          key={index}
                          className={`flex items-start gap-3 p-3 rounded-lg border ${
                            item.met 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          {item.met ? (
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${item.met ? 'text-green-900' : 'text-red-900'}`}>
                              {item.requirement}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {item.met ? 'Requirement met and verified' : 'Not met or requires attention'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Approval Status */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              {isStageApproved(5) ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Approved</span>
                  </div>
                  <p className="text-center text-sm text-gray-500">Approved by {getRandomApprover(5)}</p>
                </div>
              ) : (
                <button className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#06AEA9] text-white rounded-lg font-medium hover:bg-[#028090] transition-all shadow-sm hover:shadow-md">
                  <CheckCircle className="w-4 h-4" />
                  Approve Legal Documents
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {false && (
        rfp.agents?.pricingAgent.completed || movedToPricing ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Final Pricing Summary</h2>
          </div>

          {Object.keys(selectedSkuByItem).length > 0 ? (
            <>
              <div className="space-y-4 mb-6">
                {Object.entries(selectedSkuByItem).map(([itemId, skuId]) => {
                  const item = matchedItems.find(i => i.id === itemId);
                  const sku = item?.options.find(o => o.id === skuId);
                  const isExpanded = expandedPricingItemId === itemId;
                  
                  // Sample pricing breakdown data
                  const rawMaterialCost = 1800;
                  const executionCost = 250;
                  const transportationCost = 150;
                  const importDuty = 120;
                  const gstTax = 280;
                  const companyMargin = 400;
                  const unitPrice = rawMaterialCost + executionCost + transportationCost + importDuty + gstTax + companyMargin;
                  const quantity = 500;
                  const totalValue = unitPrice * quantity;

                  return (
                    <div key={itemId} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                      {/* Main Row */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4 flex-1">
                          <button
                            onClick={() => setExpandedPricingItemId(isExpanded ? null : itemId)}
                            className="flex items-center gap-2 text-primary hover:text-secondary transition-colors"
                          >
                            <ChevronDown className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900">{item?.name}</div>
                            <div className="text-xs text-gray-600 mt-0.5">SKU: {sku?.id}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-xs text-gray-600">Unit Price</div>
                            <div className="text-sm font-semibold text-gray-900">₹{unitPrice.toLocaleString('en-IN')}/meter</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-600">Quantity</div>
                            <div className="text-sm font-semibold text-gray-900">{quantity}</div>
                          </div>
                          <div className="text-right min-w-[140px]">
                            <div className="text-xs text-gray-600">Total Value</div>
                            <div className="text-base font-bold text-primary">₹{totalValue.toLocaleString('en-IN')}</div>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Breakdown - Expandable */}
                      {isExpanded && (
                        <div className="p-4 bg-white border-t border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-800 mb-3">Cost Breakdown</h4>
                          <div className="space-y-2">
                            {/* Raw Material */}
                            <div className="flex items-center justify-between py-2 px-3 bg-blue-50 rounded border border-blue-100">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                Raw Material Cost
                              </div>
                              ₹{rawMaterialCost.toLocaleString('en-IN')}/unit
                            </div>

                            {/* Execution Cost */}
                            <div className="flex items-center justify-between py-2 px-3 bg-purple-50 rounded border border-purple-100">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                                Execution & Labor Cost
                              </div>
                              ₹{executionCost.toLocaleString('en-IN')}/unit
                            </div>

                            {/* Transportation */}
                            <div className="flex items-center justify-between py-2 px-3 bg-yellow-50 rounded border border-yellow-100">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                                Transportation & Logistics
                              </div>
                              ₹{transportationCost.toLocaleString('en-IN')}/unit
                            </div>

                            {/* Import Duty */}
                            <div className="flex items-center justify-between py-2 px-3 bg-orange-50 rounded border border-orange-100">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                                Import Duty (8%)
                              </div>
                              ₹{importDuty.toLocaleString('en-IN')}/unit
                            </div>

                            {/* GST/Tax */}
                            <div className="flex items-center justify-between py-2 px-3 bg-red-50 rounded border border-red-100">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                GST & Taxation (18%)
                              </div>
                              ₹{gstTax.toLocaleString('en-IN')}/unit
                            </div>

                            {/* Company Margin */}
                            <div className="flex items-center justify-between py-2 px-3 bg-green-50 rounded border border-green-100">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                Project Margin (Company Policy 15%)
                              </div>
                              ₹{companyMargin.toLocaleString('en-IN')}/unit
                            </div>

                            {/* Total */}
                            <div className="flex items-center justify-between py-3 px-3 bg-primary/10 rounded border-2 border-primary/30 mt-3">
                              Final Unit Price
                              ₹{unitPrice.toLocaleString('en-IN')}/unit
                            </div>

                            {/* Quantity Calculation */}
                            <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                Quantity Required:
                                {quantity} meters
                              </div>
                              <div className="flex items-center justify-between">
                                Total Line Item Value:
                                ₹{totalValue.toLocaleString('en-IN')}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Grand Total Summary */}
              <div className="border-2 border-primary/30 rounded-lg p-4 bg-primary/5 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Total Project Value</h3>
                    <p className="text-xs text-gray-600 mt-1">Including all costs, taxes, and margins</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{rfp.value}</div>
                    <div className="text-xs text-gray-600 mt-1">{Object.keys(selectedSkuByItem).length} items selected</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => alert('Pricing finalized! Document ready for submission.')}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md"
                >
                  <Check className="w-4 h-4" />
                  Finalize Pricing
                </button>
              </div>
            </>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-sm text-yellow-800">No products selected yet. Please complete the previous steps first.</p>
            </div>
          )}
        </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pricing Agent Not Run Yet</h3>
              <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                The Pricing Agent needs to process this RFP to assign unit prices, calculate testing costs, and consolidate the final pricing.
              </p>
              <button
                onClick={() => handleRunAgent('Pricing Agent')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors shadow-md"
              >
                <Play className="w-5 h-5" />
                Run Pricing Agent
              </button>
            </div>
          </div>
        )
      )}

      {viewMode === 'generate-rfp-response' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full mb-6 shadow-lg">
              <FileSpreadsheet className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Generate Tender Response Document</h2>
            <p className="text-sm text-gray-600 mb-8">
              Generate a comprehensive tender response document with all selected products, pricing breakdown, technical specifications, and competitive analysis.
            </p>

            {/* Stage Checklists */}
            {(rfp?.stage1 || rfp?.stage2 || rfp?.stage3) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#06AEA9] to-[#028090] flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Pipeline Stage Checklists</h3>
                    <p className="text-xs text-gray-600">Task completion tracking for each stage</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Stage 1 - Sales Agent */}
                  {rfp?.stage1 && (
                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg border border-teal-300 p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <ShoppingBag className="w-5 h-5 text-[#028090]" />
                        <h4 className="font-bold text-gray-900">Stage 1: Sales Agent</h4>
                        {rfp.stage1.approved && <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />}
                      </div>
                      <ul className="space-y-2">
                        {rfp.stage1.checklist && rfp.stage1.checklist.map((item: any, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-xs">
                            <input 
                              type="checkbox" 
                              checked={item.checked || false}
                              disabled
                              className="mt-1 w-4 h-4"
                            />
                            <span className={item.checked ? 'text-gray-900 font-semibold' : 'text-gray-700'}>
                              {item.item}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {rfp.stage1.approved && (
                        <div className="mt-3 pt-3 border-t border-teal-300 text-xs font-semibold text-[#028090]">
                          ✓ Approved
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stage 2 - Technical Agent */}
                  {rfp?.stage2 && (
                    <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg border border-cyan-300 p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Wrench className="w-5 h-5 text-cyan-600" />
                        <h4 className="font-bold text-gray-900">Stage 2: Technical</h4>
                        {rfp.stage2.approved && <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />}
                      </div>
                      <ul className="space-y-2">
                        {rfp.stage2.checklist && rfp.stage2.checklist.map((item: any, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-xs">
                            <input 
                              type="checkbox" 
                              checked={item.checked || false}
                              disabled
                              className="mt-1 w-4 h-4"
                            />
                            <span className={item.checked ? 'text-gray-900 font-semibold' : 'text-gray-700'}>
                              {item.item}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {rfp.stage2.approved && (
                        <div className="mt-3 pt-3 border-t border-cyan-300 text-xs font-semibold text-cyan-700">
                          ✓ Approved
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stage 3 - Pricing Agent */}
                  {rfp?.stage3 && (
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-300 p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <h4 className="font-bold text-gray-900">Stage 3: Pricing</h4>
                        {rfp.stage3.approved && <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />}
                      </div>
                      <ul className="space-y-2">
                        {rfp.stage3.checklist && rfp.stage3.checklist.map((item: any, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-xs">
                            <input 
                              type="checkbox" 
                              checked={item.checked || false}
                              disabled
                              className="mt-1 w-4 h-4"
                            />
                            <span className={item.checked ? 'text-gray-900 font-semibold' : 'text-gray-700'}>
                              {item.item}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {rfp.stage3.approved && (
                        <div className="mt-3 pt-3 border-t border-green-300 text-xs font-semibold text-green-700">
                          ✓ Approved
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setIsGeneratingDoc(true);
                
                // Simulate document generation
                setTimeout(() => {
                  setIsGeneratingDoc(false);
                  setDocGenerated(true);
                }, 3000); // 3 second generation time
              }}
              disabled={isGeneratingDoc || docGenerated}
              className={`px-8 py-4 rounded-lg transition-all text-lg font-semibold flex items-center gap-3 mx-auto mb-8 ${
                isGeneratingDoc 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : docGenerated
                  ? 'bg-green-600 hover:bg-green-700 shadow-lg'
                  : 'bg-gradient-to-r from-primary to-secondary hover:shadow-lg'
              } text-white`}
            >
              {isGeneratingDoc ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : docGenerated ? (
                <>
                  <Check className="w-6 h-6" />
                  Document Generated
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-6 h-6" />
                  Generate Document
                </>
              )}
            </button>

            {docGenerated && (
              <div className="border-t border-gray-200 pt-6 mt-6 animate-slide-in">
                <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div className="text-left">
                      <h4 className="text-sm font-semibold text-green-900">Document Generated Successfully!</h4>
                      <p className="text-xs text-green-700 mt-1">Your RFP response document is ready. View the detailed competitive analysis below.</p>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">View detailed competitive analysis and SKU comparison:</p>
                <button
                  onClick={() => window.open('https://docs.google.com/spreadsheets/d/1Ti_JCSUif89mf8n2RJ0b8IGQR23WXQqW/edit?gid=1445060859#gid=1445060859', '_blank')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-all font-medium shadow-sm"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  Open Comparative Analysis Excel
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              </div>
            )}

            <div className="mt-8 p-4 bg-teal-50 rounded-lg border border-teal-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-[#028090]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-[#028090] mb-1">Document Includes</h4>
                  <ul className="text-xs text-teal-800 space-y-1">
                    <li>• Tender overview and requirements</li>
                    <li>• Selected SKUs with technical specifications</li>
                    <li>• Detailed pricing breakdown and cost analysis</li>
                    <li>• Testing and acceptance criteria</li>
                    <li>• Competitive analysis with 23 SKUs comparison</li>
                    <li>• Executive summary and recommendations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'award-decision' && (
        <div className="bg-white min-h-screen p-6 w-full max-w-none mx-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Award Decision</h2>
              <p className="text-sm text-gray-600">Review all evaluations and select winning vendor based on comprehensive scoring</p>
            </div>

            {/* Loading State */}
            {isLoadingVendors && (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Loading vendor evaluations...</div>
              </div>
            )}

            {/* No Vendors State */}
            {!isLoadingVendors && vendors.length === 0 && (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No vendor submissions available for evaluation</p>
              </div>
            )}

            {/* Main Table Card */}
            {!isLoadingVendors && vendors.length > 0 && (
              <>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-6 py-3 text-left text-gray-700 font-semibold text-sm">
                            Vendor Company
                          </th>
                          <th className="px-6 py-3 text-center text-gray-700 font-semibold text-sm">
                            Verification
                          </th>
                          <th className="px-6 py-3 text-center text-gray-700 font-semibold text-sm">
                            Eligibility
                          </th>
                          <th className="px-6 py-3 text-center text-gray-700 font-semibold text-sm">
                            Technical
                          </th>
                          <th className="px-6 py-3 text-center text-gray-700 font-semibold text-sm">
                            Financial
                          </th>
                          <th className="px-6 py-3 text-center text-gray-700 font-semibold text-sm">
                            Legal
                          </th>
                          <th className="px-6 py-3 text-center text-gray-700 font-semibold text-sm">
                            Overall Score
                          </th>
                          <th className="px-6 py-3 text-center text-gray-700 font-semibold text-sm">
                            Select
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {vendors.map((vendor) => {
                          const isTopRank = vendor.rank === 1;
                          const isPassing = vendor.score >= 60;
                          const verificationScore = Math.round(vendor.verification || 0);
                          const eligibilityScore = Math.round(vendor.elegibility || 0);
                          const technicalScore = Math.round(vendor.technical || 0);
                          const financialScore = Math.round(vendor.financial || 0);
                          const legalScore = Math.round(vendor.legal || 0);
                          
                          return (
                            <tr key={vendor.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${
                                    isTopRank 
                                      ? 'bg-[#06AEA9] text-white' 
                                      : vendor.rank === 2 
                                      ? 'bg-gray-300 text-gray-700' 
                                      : 'bg-gray-200 text-gray-600'
                                  }`}>
                                    {vendor.rank}
                                  </div>
                                  <span className="font-medium text-gray-900">{vendor.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`text-sm font-medium ${
                                  verificationScore >= 80 ? 'text-green-600' : 
                                  verificationScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {verificationScore}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`text-sm font-medium ${
                                  eligibilityScore >= 80 ? 'text-green-600' : 
                                  eligibilityScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {eligibilityScore}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`text-sm font-medium ${
                                  technicalScore >= 80 ? 'text-green-600' : 
                                  technicalScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {technicalScore}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`text-sm font-medium ${
                                  financialScore >= 80 ? 'text-green-600' : 
                                  financialScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {financialScore}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`text-sm font-medium ${
                                  legalScore >= 80 ? 'text-green-600' : 
                                  legalScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {legalScore}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`inline-flex items-center justify-center w-14 h-8 rounded text-sm font-bold ${
                                  isTopRank 
                                    ? 'bg-[#06AEA9] text-white' 
                                    : 'bg-gray-200 text-gray-700'
                                }`}>
                                  {Math.round(vendor.score)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <input 
                                  type="radio" 
                                  name="award" 
                                  value={vendor.id}
                                  checked={selectedAwardVendor === vendor.id}
                                  onChange={() => setSelectedAwardVendor(vendor.id)}
                                  className="w-4 h-4 cursor-pointer accent-[#06AEA9]"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Scoring Legend */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">Scoring Criteria</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 text-xs text-blue-800">
                    <div>
                      <strong>Verification:</strong> Vendor credentials & RFI validation
                    </div>
                    <div>
                      <strong>Eligibility:</strong> Compliance with tender requirements
                    </div>
                    <div>
                      <strong>Technical:</strong> Technical capability assessment
                    </div>
                    <div>
                      <strong>Financial:</strong> Financial stability & pricing
                    </div>
                    <div>
                      <strong>Legal:</strong> Legal compliance & documentation
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-200 flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 font-semibold">≥80:</span>
                      <span>Excellent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-600 font-semibold">60-79:</span>
                      <span>Acceptable</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 font-semibold">&lt;60:</span>
                      <span>Below Standard</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end">
                  <button 
                    onClick={() => setViewMode('vendor-validation')}
                    className="px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors border border-gray-300"
                  >
                    Back to Evaluation
                  </button>
                  <button 
                    className="px-6 py-2.5 bg-[#06AEA9] hover:bg-[#028090] text-white rounded-lg font-medium transition-colors"
                    onClick={async () => {
                      if (selectedAwardVendor) {
                        const selectedVendorData = vendors.find(v => v.id === selectedAwardVendor);
                        try {
                          // Update stage: current_stage + 1
                          await apiService.updateSubmissionStage(selectedAwardVendor, 0);
                          alert(`Award confirmed for: ${selectedVendorData?.name}\nOverall Score: ${Math.round(selectedVendorData?.score || 0)}/100\nStage updated successfully!`);
                        } catch (error) {
                          console.error('Failed to update stage:', error);
                          alert(`Award confirmed for: ${selectedVendorData?.name}\nOverall Score: ${Math.round(selectedVendorData?.score || 0)}/100\nNote: Stage update failed.`);
                        }
                      }
                    }}
                  >
                    Confirm Award
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
        </div>

        {/* PDF Viewer on Right Side */}
        {isPdfViewerOpen && viewMode !== 'award-decision' && (
            <div className="w-[600px] flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-[160px] self-start h-[calc(100vh-160px)]">
              <div className="bg-gradient-to-r from-[#06AEA9] to-[#028090] text-white p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <h3 className="text-base font-bold">Bid Document / RFP </h3>
                  {submissionDetails?.attachments?.[0] && (
                    <span className="text-xs text-white/80">({submissionDetails.attachments[0].file_name})</span>
                  )}
                </div>
                <button
                  onClick={() => setIsPdfViewerOpen(false)}
                  className="hover:bg-white/20 rounded p-1 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {submissionDetails?.attachments?.[0]?.url ? (
                <iframe
                src="https://drive.google.com/file/d/1fYa3NFOtjI-AySIGrsOOC6jJ0SQ_O6Aq/preview"
                  // src={`${PDF_SERVER_URL}/${submissionDetails.attachments[0].url.replace(/^\/+/, '')}`}
                  className="w-full h-[calc(100%-52px)]"
                  allow="autoplay"
                  title="Tender Document PDF"
                />
              ) : (
                <div className="flex items-center justify-center h-[calc(100%-52px)] bg-gray-50">
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No document available</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default RFPDetail;

