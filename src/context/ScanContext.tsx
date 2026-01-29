import { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import axios, { AxiosError } from 'axios';
import React from 'react';
import { useAuth } from './AuthContext';

export type VulnerabilityLevel = 'high' | 'medium' | 'low' | 'none';

export interface Vulnerability {
  category: string;
  id: string;
  name: string;
  description: string;
  level: VulnerabilityLevel;
  details: string;
  recommendation: string;
}

export interface ScanResult {
  id: string;
  url: string;
  timestamp: number;
  status: 'scanning' | 'completed' | 'failed';
  progress: number;
  vulnerabilities: {
    sqlInjection: Vulnerability[];
    xss: Vulnerability[];
    openPorts: Vulnerability[];
    other: Vulnerability[];
  };
  summary: {
    high: number;
    medium: number;
    low: number;
    total: number;
  };
}

export interface CaptchaData {
  token: string;
  question: string;
}

interface ScanContextType {
  currentScan: ScanResult | null;
  scanHistory: ScanResult[];
  startScan: (url: string, captchaData?: { token: string; answer: string }) => Promise<string>;
  getScanById: (id: string) => ScanResult | undefined;
  getCaptcha: () => Promise<CaptchaData>;
  clearCurrentScan: () => void; // New method to clear current scan
  isScanning: boolean;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:8000';

export const ScanProvider = ({ children }: { children: ReactNode }) => {
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const { isAuthenticated } = useAuth();
  
  // Use useRef to store intervals to avoid stale closure issues
  const pollingIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Helper function to process scan data from API
  const processScanData = (scanData: any): ScanResult => {
    return {
      ...scanData,
      timestamp: typeof scanData.timestamp === 'string' 
        ? new Date(scanData.timestamp).getTime() 
        : scanData.timestamp || Date.now(),
      // Backend should already return grouped vulnerabilities, but fallback just in case
      vulnerabilities: scanData.vulnerabilities || {
        sqlInjection: [],
        xss: [],
        openPorts: [],
        other: []
      },
      summary: scanData.summary || {
        high: 0,
        medium: 0,
        low: 0,
        total: 0
      }
    };
  };

  // New function to clear current scan state
  const clearCurrentScan = useCallback(() => {
    console.log('Clearing current scan state');
    setCurrentScan(null);
    setIsScanning(false);
    
    // Clear any active polling intervals
    pollingIntervalsRef.current.forEach((interval) => {
      clearInterval(interval);
    });
    pollingIntervalsRef.current.clear();
  }, []);

  // Function for getting captcha
  const getCaptcha = async (): Promise<CaptchaData> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/captcha/`);
      return response.data;
    } catch (error) {
      console.error('Error getting captcha:', error);
      throw new Error('Failed to load captcha');
    }
  };

  // Poll for scan updates - removed pollingIntervals dependency
  const pollScanStatus = useCallback(async (scanId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/scan/${scanId}/`);
      const scanData = response.data;
      const processedScan = processScanData(scanData);
      
      setCurrentScan(processedScan);
      
      // Update scan history
      setScanHistory(prev => {
        const existingIndex = prev.findIndex(scan => scan.id === processedScan.id);
        if (existingIndex >= 0) {
          const newHistory = [...prev];
          newHistory[existingIndex] = processedScan;
          return newHistory;
        } else {
          return [processedScan, ...prev].slice(0, 20); // Keep last 20 scans
        }
      });

      // Stop polling if scan is complete or failed
      if (processedScan.status === 'completed' || processedScan.status === 'failed') {
        const interval = pollingIntervalsRef.current.get(scanId);
        if (interval) {
          clearInterval(interval);
          pollingIntervalsRef.current.delete(scanId);
        }
        
        setIsScanning(false);
        
        if (processedScan.status === 'completed') {
          toast.success("Scan completed successfully!");
        } else {
          toast.error("Scan failed. Please check the results for details.");
        }
      }
    } catch (error) {
      console.error('Error polling scan status:', error);
      
      // Stop polling on error
      const interval = pollingIntervalsRef.current.get(scanId);
      if (interval) {
        clearInterval(interval);
        pollingIntervalsRef.current.delete(scanId);
      }
      setIsScanning(false);
      
      if (error instanceof AxiosError) {
        toast.error(`Error checking scan status: ${error.response?.data?.error || error.message}`);
      }
    }
  }, []); // Empty dependency array since we use ref

  // Modified startScan function with better state management
  const startScan = async (url: string, captchaData?: { token: string; answer: string }): Promise<string> => {
    if (isScanning) {
      toast.error("A scan is already in progress");
      return '';
    }

    // Clear any previous scan state before starting new one
    clearCurrentScan();
    
    setIsScanning(true);

    try {
      // Prepare request data
      const requestData: any = { url };
      
      // Add captcha data for non-authenticated users
      if (!isAuthenticated && captchaData) {
        requestData.captcha_token = captchaData.token;
        requestData.captcha_answer = captchaData.answer;
      }

      // Start the scan via API
      const response = await axios.post(`${API_BASE_URL}/api/scan/`, requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout for starting scan
      });

      const scanData = response.data;
      const processedScan = processScanData(scanData);
      
      setCurrentScan(processedScan);
      setScanHistory(prev => [processedScan, ...prev]);

      toast.success("Scan started successfully!");
      
      // Start polling for updates
      const intervalId = setInterval(() => {
        pollScanStatus(scanData.id);
      }, 2000); // Poll every 2 seconds
      
      pollingIntervalsRef.current.set(scanData.id, intervalId);
      
      // Set a maximum polling time of 15 minutes 
      setTimeout(() => {
        const interval = pollingIntervalsRef.current.get(scanData.id);
        if (interval) {
          clearInterval(interval);
          pollingIntervalsRef.current.delete(scanData.id);
          setIsScanning(false);
          toast.warning("Scan is taking longer than expected. Please check results manually.");
        }
      }, 15 * 60 * 1000); // 15 minutes

      return scanData.id;
    } catch (error) {
      // Make sure to clear state on error
      setCurrentScan(null);
      setIsScanning(false);
      
      let errorMessage = 'Scan failed: Unknown error';
      if (error instanceof AxiosError) {
        if (error.code === 'ECONNABORTED') {
          errorMessage = 'Request timeout. Please try again.';
        } else if (error.response?.status === 429) {
          errorMessage = 'Rate limit exceeded. Please wait before starting another scan.';
        } else if (error.response?.data?.error) {
          errorMessage = `Scan failed: ${error.response.data.error}`;
        } else if (error.response?.status === 404) {
          errorMessage = 'API endpoint not found. Please check your backend configuration.';
        } else if (error.response && error.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = `Scan failed: ${error.message}`;
        }
      }

      toast.error(errorMessage);
      console.error('Scan error:', error);

      return '';
    }
  };

  const getScanById = (id: string): ScanResult | undefined => {
    // Check current scan first
    if (currentScan && currentScan.id === id) {
      return currentScan;
    }
    
    // Then check history
    return scanHistory.find(scan => scan.id === id);
  };

  React.useEffect(() => {
    return () => {
      // Clear all intervals on component unmount
      pollingIntervalsRef.current.forEach((interval) => {
        clearInterval(interval);
      });
      pollingIntervalsRef.current.clear();
    };
  }, []); 

  return (
    <ScanContext.Provider value={{
      currentScan,
      scanHistory,
      startScan,
      getScanById,
      getCaptcha,
      clearCurrentScan, 
      isScanning
    }}>
      {children}
    </ScanContext.Provider>
  );
};

export const useScan = () => {
  const context = useContext(ScanContext);
  if (context === undefined) {
    throw new Error('useScan must be used within a ScanProvider');
  }
  return context;
};