import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Code,
  Database,
  Info,
  Loader2,
  ShieldAlert,
  ArrowLeft,
  Download,
  Wifi
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type ScanResult, useScan, type Vulnerability } from '@/context/ScanContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const SeverityIcon = ({ level }: { level: string }) => {
  switch (level) {
    case 'high':
      return <AlertCircle className="h-5 w-5 text-destructive" />;
    case 'medium':
      return <AlertTriangle className="h-5 w-5 text-warning" />;
    case 'low':
      return <Info className="h-5 w-5 text-info" />;
    default:
      return <CheckCircle2 className="h-5 w-5 text-success" />;
  }
};

const SeverityBadge = ({ level }: { level: string }) => {
  const classes = {
    high: 'bg-destructive/20 text-destructive border-destructive',
    medium: 'bg-warning/20 text-warning border-warning',
    low: 'bg-info/20 text-info border-info',
    none: 'bg-success/20 text-success border-success',
  };

  return (
    <Badge variant="outline" className={`${classes[level as keyof typeof classes]}`}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </Badge>
  );
};

const VulnerabilityItem = ({ vulnerability }: { vulnerability: Vulnerability }) => {
  return (
    <AccordionItem value={vulnerability.id}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-3 text-left">
          <SeverityIcon level={vulnerability.level} />
          <div>
            <h4 className="font-medium">{vulnerability.name}</h4>
            <p className="text-sm text-muted-foreground">{vulnerability.description}</p>
          </div>
        </div>
        <SeverityBadge level={vulnerability.level} />
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 pt-2">
          <div>
            <h5 className="font-medium">Details</h5>
            <p className="text-sm text-muted-foreground">{vulnerability.details}</p>
          </div>
          <div>
            <h5 className="font-medium">Recommendation</h5>
            <p className="text-sm text-muted-foreground">{vulnerability.recommendation}</p>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

const VulnerabilityCategory = ({ 
  title, 
  vulnerabilities, 
  icon 
}: { 
  title: string;
  vulnerabilities: Vulnerability[];
  icon: React.ReactNode;
}) => {
  if (vulnerabilities.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No vulnerabilities detected.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
          <Badge variant="outline" className="ml-2">
            {vulnerabilities.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Accordion type="multiple" className="w-full">
          {vulnerabilities.map((vulnerability) => (
            <VulnerabilityItem 
              key={vulnerability.id} 
              vulnerability={vulnerability} 
            />
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-12 space-y-4">
    <Loader2 className="h-10 w-10 animate-spin text-primary" />
    <p className="text-lg font-medium">Loading scan results...</p>
  </div>
);

const ScanStatsSummary = ({ scan }: { scan: ScanResult }) => {
  const totalVulnerabilities = scan.summary.total;
  const highSeverity = scan.summary.high;
  const mediumSeverity = scan.summary.medium;
  const lowSeverity = scan.summary.low;
  
  const pieData = [
    { name: 'High', value: highSeverity, color: '#ef4444' },
    { name: 'Medium', value: mediumSeverity, color: '#f59e0b' },
    { name: 'Low', value: lowSeverity, color: '#0ea5e9' },
  ].filter(item => item.value > 0);
  
  const categoryData = [
    { name: 'SQL Injection', count: scan.vulnerabilities.sqlInjection.length },
    { name: 'XSS', count: scan.vulnerabilities.xss.length },
    { name: 'Open Ports', count: scan.vulnerabilities.openPorts.length },
    { name: 'Other', count: scan.vulnerabilities.other.length },
  ].filter(item => item.count > 0);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className={totalVulnerabilities > 0 ? 'border-destructive/50' : 'border-success/50'}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Vulnerabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalVulnerabilities}
            </div>
          </CardContent>
        </Card>
        
        <Card className={highSeverity > 0 ? 'border-destructive/50' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {highSeverity}
            </div>
          </CardContent>
        </Card>
        
        <Card className={mediumSeverity > 0 ? 'border-warning/50' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Medium Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {mediumSeverity}
            </div>
          </CardContent>
        </Card>
        
        <Card className={lowSeverity > 0 ? 'border-info/50' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">
              {lowSeverity}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {totalVulnerabilities > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vulnerability Severity</CardTitle>
              <CardDescription>Distribution of vulnerabilities by severity level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} issues`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vulnerability Categories</CardTitle>
              <CardDescription>Number of issues by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryData}
                    margin={{top: 5, right: 30, left: 20, bottom: 5}}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip formatter={(value) => [`${value} issues`, 'Count']} />
                    <Legend />
                    <Bar dataKey="count" name="Issues" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

const ScanResults = () => {
  const { scanId } = useParams<{ scanId: string }>();
  const { getScanById } = useScan();
  const [scan, setScan] = useState<ScanResult | undefined>();
  const navigate = useNavigate();

  useEffect(() => {
    if (scanId) {
      const result = getScanById(scanId);
      setScan(result);
    }
  }, [scanId, getScanById]);

  if (!scan) {
    return <LoadingState />;
  }

  if (scan.status === 'scanning') {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Scanning in progress</h1>
            <p className="text-muted-foreground">Scanning {scan.url}</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Scan progress</p>
            <span className="text-sm font-medium">{scan.progress}%</span>
          </div>
          <Progress value={scan.progress} className="h-2" />
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleExport = () => {
    const reportData = JSON.stringify(scan, null, 2);
    const blob = new Blob([reportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-scan-${scan.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const securityRating = () => {
    if (scan.summary.high > 0) return 'Critical';
    if (scan.summary.medium > 0) return 'Warning';
    if (scan.summary.low > 0) return 'Acceptable';
    return 'Secure';
  };

  const securityRatingClass = () => {
    if (scan.summary.high > 0) return 'text-destructive';
    if (scan.summary.medium > 0) return 'text-warning';
    if (scan.summary.low > 0) return 'text-info';
    return 'text-success';
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Security Scan Results</h1>
          <p className="text-muted-foreground">
            {scan.url} • {formatDate(scan.timestamp)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1">
            <h2 className="text-lg font-medium mb-2">Security Rating</h2>
            <div className={`text-3xl font-bold ${securityRatingClass()}`}>
              {securityRating()}
            </div>
          </div>
          <Separator orientation="vertical" className="h-16 hidden md:block" />
          <div className="flex-1">
            <h2 className="text-lg font-medium mb-2">Summary</h2>
            <p>
              {scan.summary.total === 0 ? (
                "No vulnerabilities were found during the scan."
              ) : (
                `Found ${scan.summary.total} vulnerabilities: 
                ${scan.summary.high} high, 
                ${scan.summary.medium} medium, and 
                ${scan.summary.low} low severity issues.`
              )}
            </p>
          </div>
        </div>
      </Card>
      
      <ScanStatsSummary scan={scan} />

      {scan.summary.total > 0 && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Security Vulnerabilities Detected</AlertTitle>
          <AlertDescription>
            Your website has security vulnerabilities that should be addressed. 
            Please review the details below and implement the recommended fixes.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Vulnerabilities</TabsTrigger>
          <TabsTrigger value="sql">SQL Injection ({scan.vulnerabilities.sqlInjection.length})</TabsTrigger>
          <TabsTrigger value="xss">XSS ({scan.vulnerabilities.xss.length})</TabsTrigger>
          <TabsTrigger value="ports">Open Ports ({scan.vulnerabilities.openPorts.length})</TabsTrigger>
          <TabsTrigger value="other">Other ({scan.vulnerabilities.other.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <VulnerabilityCategory 
            title="SQL Injection Vulnerabilities" 
            vulnerabilities={scan.vulnerabilities.sqlInjection}
            icon={<Database className="h-4 w-4 text-destructive" />}
          />
          <VulnerabilityCategory 
            title="Cross-Site Scripting (XSS) Vulnerabilities" 
            vulnerabilities={scan.vulnerabilities.xss}
            icon={<Code className="h-4 w-4 text-destructive" />}
          />
          <VulnerabilityCategory 
            title="Open Ports & Services" 
            vulnerabilities={scan.vulnerabilities.openPorts}
            icon={<Wifi className="h-4 w-4 text-warning" />}
          />
          <VulnerabilityCategory 
            title="Other Security Issues" 
            vulnerabilities={scan.vulnerabilities.other}
            icon={<ShieldAlert className="h-4 w-4 text-info" />}
          />
        </TabsContent>

        <TabsContent value="sql">
          <VulnerabilityCategory 
            title="SQL Injection Vulnerabilities" 
            vulnerabilities={scan.vulnerabilities.sqlInjection}
            icon={<Database className="h-4 w-4 text-destructive" />}
          />
        </TabsContent>

        <TabsContent value="xss">
          <VulnerabilityCategory 
            title="Cross-Site Scripting (XSS) Vulnerabilities" 
            vulnerabilities={scan.vulnerabilities.xss}
            icon={<Code className="h-4 w-4 text-destructive" />}
          />
        </TabsContent>

        <TabsContent value="ports">
          <VulnerabilityCategory 
            title="Open Ports & Services" 
            vulnerabilities={scan.vulnerabilities.openPorts}
            icon={<Wifi className="h-4 w-4 text-warning" />}
          />
        </TabsContent>

        <TabsContent value="other">
          <VulnerabilityCategory 
            title="Other Security Issues" 
            vulnerabilities={scan.vulnerabilities.other}
            icon={<ShieldAlert className="h-4 w-4 text-info" />}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScanResults;  