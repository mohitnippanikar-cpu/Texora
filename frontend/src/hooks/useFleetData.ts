import { useState, useEffect } from 'react';
import { Train, FleetMetrics, MaintenanceRecord } from '../types';
import apiService from '../services/api';

export function useFleetData() {
  const [trains, setTrains] = useState<Train[]>([]);
  const [metrics, setMetrics] = useState<FleetMetrics | null>(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const generateMockTrains = (): Train[] => {
    const mockTrains: Train[] = [];
    const statuses: Train['status'][] = ['service', 'standby', 'maintenance'];
    const jobStatuses: Train['jobCardStatus'][] = ['open', 'closed', 'pending'];
    
    // Real Kochi Metro stations and depots
    const serviceLocations = [
      'Aluva Platform', 'Pulinchodu Platform', 'Companypady Platform', 
      'Ambattukavu Platform', 'Muttom Platform', 'Kalamassery Platform', 
      'Cusat Platform', 'Pathadipalam Platform', 'Edapally Platform',
      'Changampuzha Park Platform', 'Palarivattom Platform', 'JLN Stadium Platform',
      'Kaloor Platform', 'Town Hall Platform', 'MG Road Platform',
      'Maharajas Platform', 'Ernakulam South Platform', 'Kadavanthra Platform',
      'Elamkulam Platform', 'Vyttila Platform', 'Thaikoodam Platform',
      'Petta Platform', 'SN Junction Platform', 'Vadakkekotta Platform',
      'Tripunithura Platform'
    ];

    const depotLocations = [
      'Muttom Depot', 'Kalamassery Depot', 'Aluva Maintenance Bay'
    ];

    const brandings = ['Standard Service', 'Express Service', 'Peak Hour Special'];

    // Generate 20 trains (realistic for Kochi Metro operations)
    for (let i = 1; i <= 20; i++) {
      const isInService = i <= 15; // 15 trains typically in service
      const status = isInService ? 'service' : (i <= 18 ? 'standby' : 'maintenance');
      
      const train: Train = {
        id: i.toString(),
        number: `KM-${i.toString().padStart(3, '0')}`, // Kochi Metro numbering
        status: status,
        healthScore: status === 'maintenance' ? 
          Math.floor(Math.random() * 20) + 70 : // 70-90 for maintenance
          Math.floor(Math.random() * 20) + 85,  // 85-100+ for operational
        mileage: Math.floor(Math.random() * 80000) + 20000, // 20k-100k km
        lastMaintenance: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        nextMaintenance: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        fitnessExpiry: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        jobCardStatus: jobStatuses[Math.floor(Math.random() * jobStatuses.length)],
        cleanlinessScore: Math.floor(Math.random() * 25) + 75, // 75-100
        branding: brandings[Math.floor(Math.random() * brandings.length)],
        location: status === 'maintenance' ? 
          depotLocations[Math.floor(Math.random() * depotLocations.length)] :
          (status === 'service' ? 
            serviceLocations[Math.floor(Math.random() * serviceLocations.length)] :
            'Standby at Muttom Depot'),
      };
      mockTrains.push(train);
    }
    return mockTrains;
  };

  const generateMockMetrics = (trains: Train[]): FleetMetrics => {
    const activeTrains = trains.filter(t => t.status === 'service').length;
    const avgHealthScore = trains.reduce((sum, t) => sum + t.healthScore, 0) / trains.length;
    
    return {
      totalTrains: trains.length,
      activeTrains,
      routeLength: 25.6, // Actual Kochi Metro route length
      fleetAvailability: (activeTrains / trains.length) * 100,
      avgHealthScore: avgHealthScore / 10, // Convert to 10-point scale
      onTimePerformance: 96.2 + (Math.random() * 2 - 1), // 95.2-97.2% realistic range
    };
  };

  const generateMockMaintenanceRecords = (): MaintenanceRecord[] => {
    const records: MaintenanceRecord[] = [];
    const types = [
      'Scheduled Monthly Service', 
      'Brake System Inspection', 
      'Traction Motor Check', 
      'Safety System Audit', 
      'Deep Cleaning & Sanitization',
      'Door Mechanism Service',
      'Air Conditioning Maintenance',
      'Communication System Check'
    ];
    const statuses: MaintenanceRecord['status'][] = ['completed', 'pending', 'in-progress'];

    const kochiStations = [
      'Aluva', 'Kalamassery', 'Edapally', 'MG Road', 'Vyttila', 
      'Tripunithura', 'Muttom Depot', 'Kalamassery Depot'
    ];

    for (let i = 1; i <= 50; i++) {
      const trainNumber = Math.ceil(Math.random() * 20);
      const type = types[Math.floor(Math.random() * types.length)];
      const location = kochiStations[Math.floor(Math.random() * kochiStations.length)];
      
      records.push({
        id: i.toString(),
        trainId: trainNumber.toString(),
        type: type,
        date: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: `${type} for KM-${trainNumber.toString().padStart(3, '0')} at ${location}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
      });
    }
    return records;
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Get real data from API
        const [trainsResponse, metricsResponse, maintenanceResponse] = await Promise.allSettled([
          apiService.getTrains(),
          apiService.getDashboardMetrics(),
          apiService.getMaintenanceSchedule()
        ]);
        
        let hasApiData = false;
        
        // Handle trains data
        if (trainsResponse.status === 'fulfilled' && trainsResponse.value.success) {
          const convertedTrains: Train[] = trainsResponse.value.data.trains.map((backendTrain: any) => ({
            id: backendTrain._id,
            number: backendTrain.trainNumber,
            status: backendTrain.status === 'operational' ? 'service' : 
                   backendTrain.status === 'depot' ? 'standby' : 'maintenance',
            healthScore: backendTrain.operationalMetrics?.onTimePerformance || 95,
            mileage: backendTrain.operationalMetrics?.totalDistance || 0,
            lastMaintenance: backendTrain.lastMaintenance?.split('T')[0] || new Date().toISOString().split('T')[0],
            nextMaintenance: backendTrain.nextMaintenance?.split('T')[0] || new Date().toISOString().split('T')[0],
            fitnessExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            jobCardStatus: backendTrain.alerts?.length > 0 ? 'open' : 'closed' as 'open' | 'closed' | 'pending',
            cleanlinessScore: 85 + Math.floor(Math.random() * 15),
            branding: 'Kochi Metro Service',
            location: backendTrain.currentStation
          }));
          setTrains(convertedTrains);
          hasApiData = true;
        }
        
        // Handle metrics data
        if (metricsResponse.status === 'fulfilled' && metricsResponse.value.success) {
          const backendMetrics = metricsResponse.value.data.overview;
          const convertedMetrics: FleetMetrics = {
            totalTrains: backendMetrics.totalTrains,
            activeTrains: backendMetrics.operationalTrains,
            routeLength: 25.6,
            fleetAvailability: backendMetrics.systemUptime,
            avgHealthScore: 9.2,
            onTimePerformance: metricsResponse.value.data.performance?.onTimePerformance || 96
          };
          setMetrics(convertedMetrics);
        }
        
        // Handle maintenance data
        if (maintenanceResponse.status === 'fulfilled' && maintenanceResponse.value.success) {
          const convertedRecords: MaintenanceRecord[] = maintenanceResponse.value.data.trains.map((train: any, index: number) => ({
            id: (index + 1).toString(),
            trainId: train._id,
            type: `${train.maintenanceType || 'routine'} maintenance`,
            date: train.nextMaintenance?.split('T')[0] || new Date().toISOString().split('T')[0],
            description: `${train.maintenanceType || 'Routine'} maintenance scheduled for ${train.trainNumber}`,
            status: 'pending' as 'completed' | 'pending' | 'in-progress'
          }));
          setMaintenanceRecords(convertedRecords);
        }
        
        // If no API data was loaded, use mock data
        if (!hasApiData) {
          console.info('📊 Using mock data (backend unavailable)');
          const mockTrains = generateMockTrains();
          const mockMetrics = generateMockMetrics(mockTrains);
          const mockRecords = generateMockMaintenanceRecords();
          
          setTrains(mockTrains);
          setMetrics(mockMetrics);
          setMaintenanceRecords(mockRecords);
        }
        
        // Real-time sockets disabled; animations handled in UI only
        
      } catch (error) {
        console.warn('Fleet data loading error:', error);
        // Always fall back to mock data on any error
        const mockTrains = generateMockTrains();
        const mockMetrics = generateMockMetrics(mockTrains);
        const mockRecords = generateMockMaintenanceRecords();
        
        setTrains(mockTrains);
        setMetrics(mockMetrics);
        setMaintenanceRecords(mockRecords);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // No socket listeners to clean up
    return () => {};
  }, []);

  const refreshData = async () => {
    try {
      const [trainsResponse, metricsResponse, maintenanceResponse] = await Promise.allSettled([
        apiService.getTrains(),
        apiService.getDashboardMetrics(),
        apiService.getMaintenanceSchedule()
      ]);
      
      // Update data only if API calls succeed
      if (trainsResponse.status === 'fulfilled' && trainsResponse.value.success) {
        const convertedTrains: Train[] = trainsResponse.value.data.trains.map((backendTrain: any) => ({
          id: backendTrain._id,
          number: backendTrain.trainNumber,
          status: backendTrain.status === 'operational' ? 'service' : 
                 backendTrain.status === 'depot' ? 'standby' : 'maintenance',
          healthScore: backendTrain.operationalMetrics?.onTimePerformance || 95,
          mileage: backendTrain.operationalMetrics?.totalDistance || 0,
          lastMaintenance: backendTrain.lastMaintenance?.split('T')[0] || new Date().toISOString().split('T')[0],
          nextMaintenance: backendTrain.nextMaintenance?.split('T')[0] || new Date().toISOString().split('T')[0],
          fitnessExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          jobCardStatus: backendTrain.alerts?.length > 0 ? 'open' : 'closed' as 'open' | 'closed' | 'pending',
          cleanlinessScore: 85 + Math.floor(Math.random() * 15),
          branding: 'Kochi Metro Service',
          location: backendTrain.currentStation
        }));
        setTrains(convertedTrains);
      }
      
      if (metricsResponse.status === 'fulfilled' && metricsResponse.value.success) {
        const backendMetrics = metricsResponse.value.data.overview;
        const convertedMetrics: FleetMetrics = {
          totalTrains: backendMetrics.totalTrains,
          activeTrains: backendMetrics.operationalTrains,
          routeLength: 25.6,
          fleetAvailability: backendMetrics.systemUptime,
          avgHealthScore: 9.2,
          onTimePerformance: metricsResponse.value.data.performance?.onTimePerformance || 96
        };
        setMetrics(convertedMetrics);
      }
      
      if (maintenanceResponse.status === 'fulfilled' && maintenanceResponse.value.success) {
        const convertedRecords: MaintenanceRecord[] = maintenanceResponse.value.data.trains.map((train: any, index: number) => ({
          id: (index + 1).toString(),
          trainId: train._id,
          type: `${train.maintenanceType || 'routine'} maintenance`,
          date: train.nextMaintenance?.split('T')[0] || new Date().toISOString().split('T')[0],
          description: `${train.maintenanceType || 'Routine'} maintenance scheduled for ${train.trainNumber}`,
          status: 'pending' as 'completed' | 'pending' | 'in-progress'
        }));
        setMaintenanceRecords(convertedRecords);
      }
    } catch (error) {
      console.warn('Refresh failed, keeping existing data:', error);
      // Don't fall back to mock data on refresh failure, keep existing data
    }
  };

  return {
    trains,
    metrics,
    maintenanceRecords,
    isLoading,
    refreshData,
  };
}