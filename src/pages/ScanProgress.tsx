import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Shield,
  Loader2,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useScan } from '@/context/ScanContext';

const ScanProgress = () => {
  const { scanId } = useParams<{ scanId: string }>();
  const { getScanById, currentScan } = useScan();
  const [scan, setScan] = useState(getScanById(scanId || '') || currentScan);
  const navigate = useNavigate();

  useEffect(() => {
    if (scanId) {
      const result = getScanById(scanId);
      if (result) {
        setScan(result);
      }
    } else if (currentScan) {
      setScan(currentScan);
    }
  }, [scanId, getScanById, currentScan]);

  // Redirect to results when scan completes
  useEffect(() => {
    if (scan && scan.status === 'completed') {
      const timer = setTimeout(() => {
        navigate(`/scan-results/${scan.id}`, { replace: true });
      }, 2000); // 2 second delay to show completion

      return () => clearTimeout(timer);
    }
  }, [scan?.status, scan?.id, navigate]);

  // Redirect to dashboard if no scan found
  useEffect(() => {
    if (!scan) {
      navigate('/dashboard', { replace: true });
    }
  }, [scan, navigate]);

  if (!scan) {
    return null; // Will redirect to dashboard
  }

  const scanSteps = [
    "Initializing security scan...",
    "Analyzing website structure",
    "Scanning for open ports",
    "Testing for SQL injection vulnerabilities", 
    "Checking for XSS vulnerabilities",
    "Analyzing security headers",
    "Generating comprehensive report"
  ];

  const getCurrentStep = (progress: number) => {
    const stepIndex = Math.floor((progress / 100) * (scanSteps.length - 1));
    return scanSteps[Math.min(stepIndex, scanSteps.length - 1)];
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation Bar */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-green-400" />
              <span className="text-xl font-bold text-white">Laws Scanner</span>
            </div>
            
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="border-slate-700 text-slate-400 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative pt-16">
        <div className="absolute inset-0 bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="relative min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-2xl mx-auto space-y-8">
            
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3 mb-4">
                {scan.status === 'failed' ? (
                  <AlertCircle className="h-12 w-12 text-red-400" />
                ) : scan.status === 'completed' ? (
                  <CheckCircle className="h-12 w-12 text-green-400" />
                ) : (
                  <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-white">
                {scan.status === 'failed' ? 'Scan Failed' : 
                 scan.status === 'completed' ? 'Scan Complete!' : 
                 'Scanning in Progress'}
              </h1>
              
              <p className="text-lg text-slate-400">
                Scanning: <span className="text-white font-medium">{scan.url}</span>
              </p>
            </div>

            {/* Progress Card */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-white">Security Scan Progress</span>
                  <Badge 
                    variant="outline" 
                    className={`${
                      scan.status === 'failed' ? 'text-red-400 border-red-400 bg-red-400/10' :
                      scan.status === 'completed' ? 'text-green-400 border-green-400 bg-green-400/10' :
                      'text-blue-400 border-blue-400 bg-blue-400/10'
                    }`}
                  >
                    {scan.progress}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <Progress 
                    value={scan.progress} 
                    className="h-4"
                  />
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Started: {new Date(scan.timestamp).toLocaleTimeString()}</span>
                    <span>
                      {scan.status === 'completed' ? 'Complete' : 
                       scan.status === 'failed' ? 'Failed' : 
                       'In Progress'}
                    </span>
                  </div>
                </div>

                {/* Current Step */}
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-white">Current Step</h3>
                  <div className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg border border-slate-700">
                    {scan.status === 'scanning' && (
                      <Loader2 className="h-5 w-5 animate-spin text-blue-400 flex-shrink-0" />
                    )}
                    <p className="text-slate-300">
                      {scan.status === 'failed' ? 'Scan encountered an error and could not complete.' :
                       scan.status === 'completed' ? 'All security checks completed successfully!' :
                       getCurrentStep(scan.progress)}
                    </p>
                  </div>
                </div>

                {/* Scan Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-slate-700/20 rounded-lg">
                    <div className="text-2xl font-bold text-white">
                      {Math.floor((Date.now() - scan.timestamp) / 1000)}s
                    </div>
                    <div className="text-sm text-slate-400">Elapsed Time</div>
                  </div>
                  <div className="text-center p-3 bg-slate-700/20 rounded-lg">
                    <div className="text-2xl font-bold text-white">
                      {scan.status === 'completed' ? scan.summary?.total || 0 : '---'}
                    </div>
                    <div className="text-sm text-slate-400">Issues Found</div>
                  </div>
                </div>

                {/* Completion Message */}
                {scan.status === 'completed' && (
                  <div className="text-center space-y-3">
                    <CheckCircle className="h-8 w-8 text-green-400 mx-auto" />
                    <p className="text-green-400 font-medium">
                      Scan completed successfully! Redirecting to results...
                    </p>
                  </div>
                )}

                {/* Failed Message */}
                {scan.status === 'failed' && (
                  <div className="text-center space-y-3">
                    <AlertCircle className="h-8 w-8 text-red-400 mx-auto" />
                    <p className="text-red-400 font-medium">
                      The scan could not be completed. Please try again.
                    </p>
                    <Button
                      onClick={() => navigate('/dashboard')}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Try Another Scan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Tips */}
            {scan.status === 'scanning' && (
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium text-white mb-3">Did you know?</h3>
                  <p className="text-slate-400 text-sm">
                    While we scan your website, we're checking for over 50 different types of 
                    vulnerabilities including SQL injection, cross-site scripting (XSS), 
                    security misconfigurations, and more to ensure your website is secure.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanProgress;