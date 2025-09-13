import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  Activity, 
  Loader2,
  Search,
  Globe,
  Lock,
  Zap,
  CheckCircle,
  AlertTriangle,
  History,
  ArrowRight,
  MoonIcon,
  SunIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/components/ui/theme-provider';
import { useScan } from '@/context/ScanContext';
import { useAuth } from '@/context/AuthContext';
import { Captcha } from '@/components/ui/captcha';

const urlSchema = z.object({
  url: z
    .string()
    .min(1, { message: "URL is required" })
    .regex(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/, {
      message: "Please enter a valid URL",
    }),
});

const Dashboard = () => {
  const { currentScan, startScan, isScanning, scanHistory } = useScan();
  const { isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [captchaData, setCaptchaData] = useState<{ token: string; answer: string } | null>(null);
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);
  const [lastScanStatus, setLastScanStatus] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof urlSchema>>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      url: "",
    },
  });

  // Monitor scan status changes to navigate when complete
  useEffect(() => {
    if (currentScan) {
      // Only navigate if scan just completed (status changed from scanning to completed)
      if (currentScan.status === 'completed' && lastScanStatus === 'scanning') {
        // Small delay to ensure UI updates, then navigate
        setTimeout(() => {
          navigate(`/app/scan-results/${currentScan.id}`);
        }, 1000);
      }
      setLastScanStatus(currentScan.status);
    }
  }, [currentScan?.status, navigate, lastScanStatus]);

  const onCaptchaComplete = (data: { token: string; answer: string }, isValid: boolean) => {
    setCaptchaData(data);
    setIsCaptchaValid(isValid);
  };

  const onSubmit = async (data: z.infer<typeof urlSchema>) => {
    // Ensure URL has protocol
    const url = data.url.startsWith('http') ? data.url : `https://${data.url}`;
    
    // Check captcha for non-authenticated users
    if (!isAuthenticated) {
      if (!captchaData || !captchaData.answer) {
        form.setError('url', {
          type: 'manual',
          message: 'Please complete the security verification first'
        });
        return;
      }
      
      if (!isCaptchaValid) {
        form.setError('url', {
          type: 'manual',
          message: 'Please provide the correct answer to the captcha'
        });
        return;
      }
    }
    
    try {
      const scanId = await startScan(url, captchaData || undefined);
      if (scanId) {
        // Reset form and captcha
        form.reset();
        setCaptchaData(null);
        setIsCaptchaValid(false);
        setLastScanStatus('scanning'); // Track that we started scanning
        
        // Don't navigate immediately - let the useEffect handle navigation when scan completes
      }
    } catch (error) {
      console.error("Scan failed:", error);
    }
  };

  const recentScans = scanHistory.slice(0, 3);
  
  const scanSteps = [
    "Analyzing website structure",
    "Scanning for open ports",
    "Testing for SQL injection vulnerabilities", 
    "Checking for XSS vulnerabilities",
    "Analyzing security headers",
    "Generating comprehensive report"
  ];

  const getCurrentStep = (progress: number) => {
    const stepIndex = Math.floor((progress / 100) * scanSteps.length);
    return scanSteps[Math.min(stepIndex, scanSteps.length - 1)];
  };

  // Determine if the scan button should be disabled
  const isScanDisabled = isScanning || (!isAuthenticated && (!isCaptchaValid || !captchaData?.answer));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Top Navigation Bar */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-green-400" />
              <span className="text-xl font-bold text-white">Laws Scanner</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="rounded-full text-slate-400 hover:text-white hover:bg-slate-700"
              >
                {theme === 'dark' ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="relative py-16 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              
              {/* Left Content */}
              <div className="max-w-2xl space-y-8">
                <div className="space-y-4">
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20 px-3 py-1">
                    <Shield className="w-3 h-3 mr-1" />
                    Laws Scanner
                  </Badge>
                  
                  <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white">
                    Scan Your Websites for Vulnerabilities,{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                      Securely
                    </span>
                  </h1>
                  
                  <p className="text-lg text-slate-400 leading-relaxed">
                    Advanced security scanning that protects your users and business from 
                    hacking attempts, data breaches, and security vulnerabilities.
                  </p>
                </div>
                
                {/* Scan Form */}
                <div className="space-y-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <div className="relative flex-1">
                          <Globe className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                          <Input 
                            placeholder="https://example.com" 
                            {...form.register("url")}
                            disabled={isScanning}
                            className="pl-10 h-12 bg-slate-800/50 border-slate-700 focus:border-green-500 focus:ring-green-500/20 text-white placeholder:text-slate-400"
                          />
                        </div>
                        <Button 
                          type="submit" 
                          disabled={isScanDisabled}
                          className={`h-12 px-8 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-medium transition-opacity ${
                            isScanDisabled ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {isScanning ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Scanning...
                            </>
                          ) : (
                            <>
                              <Search className="mr-2 h-4 w-4" />
                              Start Scan
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="mt-1">
                        <FormMessage />
                      </div>
                    </form>
                  </Form>

                  {/* Captcha for non-authenticated users */}
                  {!isAuthenticated && (
                    <Captcha 
                      onCaptchaComplete={onCaptchaComplete}
                      isRequired={!isAuthenticated}
                    />
                  )}

                  {/* Scanning Progress */}
                  {isScanning && currentScan && (
                    <Card className="bg-slate-800/50 border-slate-700 animate-pulse">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1 flex-1">
                              <p className="text-sm font-medium text-white flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-green-400" />
                                Scanning {currentScan.url}
                              </p>
                              <p className="text-xs text-slate-400">
                                {getCurrentStep(currentScan.progress)}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-green-400 border-green-400 bg-green-400/10">
                              {currentScan.progress}%
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <Progress 
                              value={currentScan.progress} 
                              className="h-3 bg-slate-700"
                            />
                            <div className="flex justify-between text-xs text-slate-400">
                              <span>Started</span>
                              <span>{currentScan.progress === 100 ? 'Complete' : 'In Progress'}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Show when scan completes */}
                  {!isScanning && currentScan && currentScan.status === 'completed' && (
                    <Card className="bg-green-500/10 border-green-500/20">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-6 w-6 text-green-400" />
                            <div>
                              <p className="text-white font-medium">Scan Complete!</p>
                              <p className="text-sm text-slate-400">
                                Found {currentScan.summary.total} vulnerabilities
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => navigate(`/app/scan-results/${currentScan.id}`)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            View Results
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>GDPR Compliant</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Lock className="w-4 h-4 text-green-400" />
                    <span>Enterprise Grade</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-green-400" />
                    <span>Real-time Results</span>
                  </div>
                </div>
              </div>

              {/* Right Content - Image */}
              <div className="w-full lg:w-1/2 max-w-lg">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl blur-3xl" />
                  <div className="relative bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 aspect-square flex items-center justify-center">
                    <img 
                      src="/images/security-icons.png.png" 
                      alt="Security Scanner Illustration" 
                      className="w-full h-full object-contain opacity-90 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold text-white">Why Choose Laws Scanner?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Our advanced security scanner provides comprehensive vulnerability assessment 
              with industry-leading accuracy and speed.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500/20 to-green-600/20 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-green-400" />
                </div>
                <CardTitle className="text-xl text-white">Easy-to-Use</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">
                  Simply enter your website URL and get comprehensive security analysis 
                  with detailed vulnerability reports in minutes.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500/20 to-blue-600/20 flex items-center justify-center mb-4">
                  <Activity className="h-6 w-6 text-blue-400" />
                </div>
                <CardTitle className="text-xl text-white">Fast Results</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">
                  Advanced scanning algorithms deliver accurate results in minutes, 
                  not hours. Get actionable insights immediately.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500/20 to-purple-600/20 flex items-center justify-center mb-4">
                  <ShieldAlert className="h-6 w-6 text-purple-400" />
                </div>
                <CardTitle className="text-xl text-white">Industry Specific</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">
                  Tailored cybersecurity solutions that adapt to your industry's 
                  specific compliance requirements and threat landscape.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Recent Scans Section */}
      {recentScans.length > 0 && (
        <div className="py-16 px-4 md:px-8 border-t border-slate-700/50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-slate-400" />
                <h3 className="text-xl font-semibold text-white">Recent Scans</h3>
              </div>
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-400 hover:text-white">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="grid gap-4">
              {recentScans.map((scan) => (
                <Card 
                  key={scan.id} 
                  className="bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/app/scan-results/${scan.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <div>
                          <p className="font-medium text-white">{scan.url}</p>
                          <p className="text-sm text-slate-400">
                            {new Date(scan.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {scan.summary.high > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {scan.summary.high} Critical
                          </Badge>
                        )}
                        {scan.summary.total === 0 && (
                          <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                            Secure
                          </Badge>
                        )}
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="py-8 px-4 md:px-8 border-t border-slate-700/50">
        <div className="max-w-7xl mx-auto">
          <Alert className="bg-amber-500/10 border-amber-500/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <AlertTitle className="text-amber-400">Security Notice</AlertTitle>
                <AlertDescription className="text-amber-300/80">
                  Only scan websites that you own or have explicit permission to test. 
                  Unauthorized security scanning may violate terms of service or local laws.
                </AlertDescription>
              </div>
            </div>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;