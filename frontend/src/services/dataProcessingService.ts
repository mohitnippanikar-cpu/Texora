interface DataRecord {
  id: string;
  originalData: any;
  processedData: any;
  department: string;
  project: string;
  category: string;
  timestamp: string;
  source: string;
  validationStatus: 'valid' | 'invalid' | 'warning';
  validationErrors: string[];
}

interface ProcessingRule {
  id: string;
  name: string;
  department: string;
  category: string;
  filePattern: RegExp;
  columns: string[];
  validations: ValidationRule[];
  transformations: TransformationRule[];
}

interface ValidationRule {
  field: string;
  type: 'required' | 'numeric' | 'date' | 'email' | 'regex' | 'range';
  params?: any;
  message: string;
}

interface TransformationRule {
  field: string;
  type: 'format' | 'calculate' | 'lookup' | 'concatenate';
  params: any;
}

interface ProcessingStats {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  warningRecords: number;
  processingTime: number;
}

class DataProcessingService {
  private processingRules: Map<string, ProcessingRule[]> = new Map();
  private dataStorage: Map<string, DataRecord[]> = new Map();
  
  constructor() {
    this.initializeProcessingRules();
  }

  private initializeProcessingRules() {
    const rules: ProcessingRule[] = [
      {
        id: 'passenger-ridership',
        name: 'Passenger Ridership Data',
        department: 'Operations',
        category: 'Passenger Data',
        filePattern: /passenger|ridership|boarding/i,
        columns: ['date', 'station', 'entry_count', 'exit_count', 'line'],
        validations: [
          { field: 'date', type: 'date', message: 'Invalid date format' },
          { field: 'entry_count', type: 'numeric', message: 'Entry count must be numeric' },
          { field: 'exit_count', type: 'numeric', message: 'Exit count must be numeric' },
          { field: 'station', type: 'required', message: 'Station name is required' }
        ],
        transformations: [
          { field: 'date', type: 'format', params: { format: 'YYYY-MM-DD' } },
          { field: 'total_passengers', type: 'calculate', params: { formula: 'entry_count + exit_count' } }
        ]
      },
      {
        id: 'maintenance-logs',
        name: 'Maintenance Log Data',
        department: 'Maintenance',
        category: 'Maintenance Records',
        filePattern: /maintenance|repair|service/i,
        columns: ['date', 'train_id', 'type', 'description', 'cost', 'technician'],
        validations: [
          { field: 'date', type: 'date', message: 'Invalid maintenance date' },
          { field: 'train_id', type: 'required', message: 'Train ID is required' },
          { field: 'cost', type: 'numeric', message: 'Cost must be numeric' },
          { field: 'type', type: 'required', message: 'Maintenance type is required' }
        ],
        transformations: [
          { field: 'date', type: 'format', params: { format: 'YYYY-MM-DD HH:mm:ss' } },
          { field: 'train_id', type: 'format', params: { prefix: 'KMRL-' } }
        ]
      },
      {
        id: 'financial-revenue',
        name: 'Financial Revenue Data',
        department: 'Finance',
        category: 'Financial Data',
        filePattern: /financial|revenue|income|earning/i,
        columns: ['date', 'source', 'amount', 'currency', 'category'],
        validations: [
          { field: 'date', type: 'date', message: 'Invalid transaction date' },
          { field: 'amount', type: 'numeric', message: 'Amount must be numeric' },
          { field: 'currency', type: 'required', message: 'Currency is required' },
          { field: 'amount', type: 'range', params: { min: 0 }, message: 'Amount cannot be negative' }
        ],
        transformations: [
          { field: 'amount', type: 'format', params: { decimals: 2 } },
          { field: 'currency', type: 'format', params: { uppercase: true } }
        ]
      },
      {
        id: 'employee-data',
        name: 'Employee Data',
        department: 'HR',
        category: 'HR Data',
        filePattern: /employee|staff|personnel|hr/i,
        columns: ['emp_id', 'name', 'department', 'position', 'salary', 'join_date'],
        validations: [
          { field: 'emp_id', type: 'required', message: 'Employee ID is required' },
          { field: 'name', type: 'required', message: 'Employee name is required' },
          { field: 'salary', type: 'numeric', message: 'Salary must be numeric' },
          { field: 'join_date', type: 'date', message: 'Invalid join date' }
        ],
        transformations: [
          { field: 'emp_id', type: 'format', params: { prefix: 'KMRL-EMP-' } },
          { field: 'name', type: 'format', params: { titleCase: true } }
        ]
      },
      {
        id: 'safety-incidents',
        name: 'Safety Incident Reports',
        department: 'Safety',
        category: 'Safety Reports',
        filePattern: /safety|incident|accident|emergency/i,
        columns: ['date', 'location', 'severity', 'description', 'actions_taken'],
        validations: [
          { field: 'date', type: 'date', message: 'Invalid incident date' },
          { field: 'location', type: 'required', message: 'Incident location is required' },
          { field: 'severity', type: 'required', message: 'Severity level is required' },
          { field: 'description', type: 'required', message: 'Incident description is required' }
        ],
        transformations: [
          { field: 'severity', type: 'format', params: { uppercase: true } },
          { field: 'incident_id', type: 'calculate', params: { formula: 'SAFETY-{date}-{sequence}' } }
        ]
      }
    ];

    // Group rules by department
    rules.forEach(rule => {
      if (!this.processingRules.has(rule.department)) {
        this.processingRules.set(rule.department, []);
      }
      this.processingRules.get(rule.department)!.push(rule);
    });
  }

  async processFile(
    file: File, 
    department: string, 
    project: string,
    onProgress?: (progress: number) => void
  ): Promise<ProcessingStats> {
    const startTime = Date.now();
    
    try {
      // Determine file type and read content
      const content = await this.readFileContent(file);
      const records = await this.parseFileContent(content, file.type);
      
      // Find appropriate processing rule
      const rule = this.findProcessingRule(file.name, department);
      
      if (!rule) {
        throw new Error(`No processing rule found for file: ${file.name} in department: ${department}`);
      }

      console.log(`📊 Processing ${records.length} records with rule: ${rule.name}`);

      // Process records
      const processedRecords: DataRecord[] = [];
      let validRecords = 0;
      let invalidRecords = 0;
      let warningRecords = 0;

      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        
        // Report progress
        if (onProgress) {
          onProgress(Math.round((i / records.length) * 100));
        }

        try {
          const processedRecord = await this.processRecord(record, rule, department, project, file.name);
          processedRecords.push(processedRecord);

          switch (processedRecord.validationStatus) {
            case 'valid': validRecords++; break;
            case 'invalid': invalidRecords++; break;
            case 'warning': warningRecords++; break;
          }
        } catch (error) {
          console.error(`Error processing record ${i}:`, error);
          invalidRecords++;
        }
      }

      // Store processed records
      const storageKey = `${department}-${project}-${Date.now()}`;
      this.dataStorage.set(storageKey, processedRecords);

      const processingTime = Date.now() - startTime;
      
      console.log(`✅ File processing completed: ${validRecords} valid, ${invalidRecords} invalid, ${warningRecords} warnings in ${processingTime}ms`);

      return {
        totalRecords: records.length,
        validRecords,
        invalidRecords,
        warningRecords,
        processingTime
      };
    } catch (error) {
      console.error('File processing error:', error);
      throw error;
    }
  }

  private async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (_e) => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private async parseFileContent(content: string, fileType: string): Promise<any[]> {
    const type = fileType.toLowerCase();
    
    if (type.includes('csv') || type === 'text/csv') {
      return this.parseCSV(content);
    } else if (type.includes('json') || type === 'application/json') {
      return JSON.parse(content);
    } else if (type.includes('excel') || type.includes('spreadsheet')) {
      // For demo purposes, simulate Excel parsing
      return this.parseCSV(content); // In reality, you'd use a library like SheetJS
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  private parseCSV(content: string): any[] {
    const lines = content.trim().split('\n');
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const records = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const record: any = {};
      
      headers.forEach((header, index) => {
        record[header] = values[index] || '';
      });
      
      records.push(record);
    }
    
    return records;
  }

  private findProcessingRule(filename: string, department: string): ProcessingRule | null {
    const departmentRules = this.processingRules.get(department);
    if (!departmentRules) return null;

    return departmentRules.find(rule => 
      rule.filePattern.test(filename)
    ) || departmentRules[0]; // Fallback to first rule for department
  }

  private async processRecord(
    record: any, 
    rule: ProcessingRule, 
    department: string, 
    project: string, 
    source: string
  ): Promise<DataRecord> {
    const recordId = `${department}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Validate record
    const validationErrors: string[] = [];
    let validationStatus: 'valid' | 'invalid' | 'warning' = 'valid';

    for (const validation of rule.validations) {
      const fieldValue = record[validation.field];
      const error = this.validateField(fieldValue, validation);
      
      if (error) {
        validationErrors.push(`${validation.field}: ${error}`);
        if (validation.type === 'required') {
          validationStatus = 'invalid';
        } else if (validationStatus === 'valid') {
          validationStatus = 'warning';
        }
      }
    }

    // Transform record
    const processedData = { ...record };
    for (const transformation of rule.transformations) {
      try {
        processedData[transformation.field] = this.transformField(
          processedData[transformation.field], 
          transformation,
          processedData
        );
      } catch (error) {
        validationErrors.push(`Transformation error on ${transformation.field}: ${error}`);
        validationStatus = 'warning';
      }
    }

    return {
      id: recordId,
      originalData: record,
      processedData,
      department,
      project,
      category: rule.category,
      timestamp: new Date().toISOString(),
      source,
      validationStatus,
      validationErrors
    };
  }

  private validateField(value: any, rule: ValidationRule): string | null {
    switch (rule.type) {
      case 'required':
        return (value === null || value === undefined || value === '') ? rule.message : null;
        
      case 'numeric':
        return isNaN(Number(value)) ? rule.message : null;
        
      case 'date':
        return isNaN(Date.parse(value)) ? rule.message : null;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? rule.message : null;
        
      case 'regex':
        return !rule.params.pattern.test(value) ? rule.message : null;
        
      case 'range':
        const numValue = Number(value);
        if (rule.params.min !== undefined && numValue < rule.params.min) return rule.message;
        if (rule.params.max !== undefined && numValue > rule.params.max) return rule.message;
        return null;
        
      default:
        return null;
    }
  }

  private transformField(value: any, rule: TransformationRule, record: any): any {
    switch (rule.type) {
      case 'format':
        if (rule.params.format && rule.params.format.includes('YYYY')) {
          // Date formatting
          return new Date(value).toISOString().split('T')[0];
        } else if (rule.params.decimals !== undefined) {
          // Number formatting
          return Number(value).toFixed(rule.params.decimals);
        } else if (rule.params.uppercase) {
          return String(value).toUpperCase();
        } else if (rule.params.titleCase) {
          return String(value).replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
          );
        } else if (rule.params.prefix) {
          return rule.params.prefix + String(value);
        }
        return value;
        
      case 'calculate':
        // Simple formula evaluation
        const formula = rule.params.formula;
        if (formula.includes('+')) {
          const [field1, field2] = formula.split(' + ');
          return (Number(record[field1.trim()]) || 0) + (Number(record[field2.trim()]) || 0);
        }
        return value;
        
      case 'lookup':
        // Placeholder for lookup tables
        return rule.params.mapping[value] || value;
        
      case 'concatenate':
        return rule.params.fields.map((field: string) => record[field]).join(rule.params.separator || ' ');
        
      default:
        return value;
    }
  }

  // Public API methods
  categorizeFile(filename: string): { category: string; confidence: number } {
    const name = filename.toLowerCase();
    
    const patterns = [
      { pattern: /passenger|ridership|boarding/, category: 'Passenger Data', confidence: 0.9 },
      { pattern: /maintenance|repair|service/, category: 'Maintenance Records', confidence: 0.9 },
      { pattern: /financial|revenue|income/, category: 'Financial Data', confidence: 0.9 },
      { pattern: /employee|staff|hr/, category: 'HR Data', confidence: 0.9 },
      { pattern: /safety|incident|accident/, category: 'Safety Reports', confidence: 0.9 },
      { pattern: /schedule|timetable/, category: 'Schedule Data', confidence: 0.8 },
      { pattern: /inventory|asset/, category: 'Asset Management', confidence: 0.8 },
      { pattern: /customer|feedback/, category: 'Customer Data', confidence: 0.8 }
    ];

    for (const pattern of patterns) {
      if (pattern.pattern.test(name)) {
        return { category: pattern.category, confidence: pattern.confidence };
      }
    }

    return { category: 'General Data', confidence: 0.5 };
  }

  getProcessingRules(department?: string): ProcessingRule[] {
    if (department) {
      return this.processingRules.get(department) || [];
    }
    
    const allRules: ProcessingRule[] = [];
    this.processingRules.forEach(rules => allRules.push(...rules));
    return allRules;
  }

  getStoredData(department?: string, project?: string): DataRecord[] {
    const allData: DataRecord[] = [];
    
    this.dataStorage.forEach((records, _key) => {
      const filteredRecords = records.filter(record => {
        if (department && record.department !== department) return false;
        if (project && record.project !== project) return false;
        return true;
      });
      
      allData.push(...filteredRecords);
    });

    return allData.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  getProcessingStats(department?: string): {
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
    warningRecords: number;
    categories: { [key: string]: number };
  } {
    const data = this.getStoredData(department);
    
    const stats = {
      totalRecords: data.length,
      validRecords: 0,
      invalidRecords: 0,
      warningRecords: 0,
      categories: {} as { [key: string]: number }
    };

    data.forEach(record => {
      switch (record.validationStatus) {
        case 'valid': stats.validRecords++; break;
        case 'invalid': stats.invalidRecords++; break;
        case 'warning': stats.warningRecords++; break;
      }

      stats.categories[record.category] = (stats.categories[record.category] || 0) + 1;
    });

    return stats;
  }

  exportProcessedData(department?: string, project?: string, format: 'json' | 'csv' = 'json'): string {
    const data = this.getStoredData(department, project);
    
    if (format === 'csv') {
      if (data.length === 0) return '';
      
      const headers = Object.keys(data[0].processedData);
      const csvContent = [
        headers.join(','),
        ...data.map(record => 
          headers.map(header => 
            JSON.stringify(record.processedData[header] || '')
          ).join(',')
        )
      ].join('\n');
      
      return csvContent;
    }
    
    return JSON.stringify(data, null, 2);
  }
}

// Create singleton instance
const dataProcessingService = new DataProcessingService();

console.log('📊 Data Processing Service initialized');
console.log(`⚙️ Loaded ${dataProcessingService.getProcessingRules().length} processing rules`);

export default dataProcessingService;
export type { DataRecord, ProcessingRule, ValidationRule, TransformationRule, ProcessingStats };