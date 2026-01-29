import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Scan, 
  Lock, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Globe,
  Zap,
  Eye,
  User,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

const LandingPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: <Scan className="h-8 w-8 text-green-400" />,
      title: "Advanced Vulnerability Scanning",
      description: "Comprehensive security analysis that identifies potential threats and vulnerabilities in your web applications."
    },
    {
      icon: <Lock className="h-8 w-8 text-green-400" />,
      title: "Real-time Security Monitoring", 
      description: "Continuous monitoring of your websites with instant alerts when security issues are detected."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-green-400" />,
      title: "Detailed Reporting & Analytics",
      description: "Get comprehensive reports with actionable insights to improve your website's security posture."
    },
    {
      icon: <Zap className="h-8 w-8 text-green-400" />,
      title: "Lightning Fast Scans",
      description: "Quick and efficient security scans that don't slow down your development workflow."
    },
    {
      icon: <Eye className="h-8 w-8 text-green-400" />,
      title: "Deep Security Analysis",
      description: "Go beyond surface-level checks with in-depth analysis of your application's security layers."
    },
    {
      icon: <Globe className="h-8 w-8 text-green-400" />,
      title: "Multi-Platform Support",
      description: "Secure websites, web apps, and APIs across different platforms and technologies."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="relative bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-green-400" />
              <span className="text-xl font-bold text-white">Laws Scanner</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <a href="#features" className="text-slate-400 hover:text-white transition-colors">
                Features
              </a>
              <a href="#about" className="text-slate-400 hover:text-white transition-colors">
                About
              </a>
              <a href="#testimonials" className="text-slate-400 hover:text-white transition-colors">
                Testimonials
              </a>
              <a href="#contact" className="text-slate-400 hover:text-white transition-colors">
                Contact
              </a>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <span className="text-slate-400 text-sm">Welcome, {user?.username}</span>
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
                  >
                    Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/auth')}
                    className="text-slate-400 hover:text-white"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => navigate('/dashboard')} // CHANGED: Now goes to dashboard
                    className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
                  >
                    Start Free Scan
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 z-50">
              <div className="px-4 py-6 space-y-4">
                <a href="#features" className="block text-slate-400 hover:text-white transition-colors">
                  Features
                </a>
                <a href="#about" className="block text-slate-400 hover:text-white transition-colors">
                  About
                </a>
                <a href="#testimonials" className="block text-slate-400 hover:text-white transition-colors">
                  Testimonials
                </a>
                <a href="#contact" className="block text-slate-400 hover:text-white transition-colors">
                  Contact
                </a>
                <div className="pt-4 border-t border-slate-700/50">
                  {isAuthenticated ? (
                    <>
                      <p className="text-slate-400 text-sm mb-3">Welcome, {user?.username}</p>
                      <Button 
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
                      >
                        Dashboard
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <Button 
                        variant="ghost" 
                        onClick={() => navigate('/auth')}
                        className="w-full text-slate-400 hover:text-white"
                      >
                        Sign In
                      </Button>
                      <Button 
                        onClick={() => navigate('/dashboard')} // CHANGED: Now goes to dashboard
                        className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
                      >
                        Start Free Scan
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Secure Your
                  <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent"> Web Applications</span>
                </h1>
                <p className="text-xl text-slate-400 leading-relaxed">
                  Advanced vulnerability scanning and real-time security monitoring to protect your websites from threats. Stay ahead of attackers with comprehensive security analysis.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <>
                    <Button 
                      size="lg"
                      onClick={() => navigate('/dashboard')}
                      className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
                    >
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button 
                      size="lg"
                      variant="outline"
                      onClick={() => {
                        const confirmLogout = window.confirm('Are you sure you want to log out?');
                        if (confirmLogout) {
                          logout();
                        }
                      }}
                      className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <LogOut className="mr-2 h-5 w-5" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      size="lg"
                      onClick={() => navigate('/dashboard')} 
                      className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
                    >
                      Start Free Scan
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button 
                      size="lg"
                      variant="outline"
                      onClick={() => navigate('/auth')} 
                      className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <User className="mr-2 h-5 w-5" />
                      Sign In
                    </Button>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">10K+</div>
                  <div className="text-slate-400 text-sm">Websites Secured</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">99.9%</div>
                  <div className="text-slate-400 text-sm">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">24/7</div>
                  <div className="text-slate-400 text-sm">Monitoring</div>
                </div>
              </div>
            </div>

            {/* Hero Image Placeholder */}
            <div className="relative">
              <div className="aspect-square  flex items-center justify-center">
                <img
      src="/images/data-breach-concept-laptop-hacked.png"
      alt="Data Breach Concept"
      className="h-full w-full object-cover rounded-2xl"
    />
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-green-500/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-500/20 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-white">Powerful Security Features</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Comprehensive security tools designed to keep your web applications safe from evolving threats.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-700/50 border-slate-600/50 hover:bg-slate-700/70 transition-colors">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* About Image Placeholder */}
            <div className="relative order-2 lg:order-1">
              <div className="aspect-video flex items-center justify-center">
                <img 
                src="/images/situation-people-office-flat-background.png"
                alt="Office Illustration" 
                className="h-full w-full object-cover rounded-2xl" />
              </div>
            </div>

            <div className="space-y-6 order-1 lg:order-2">
              <h2 className="text-4xl font-bold text-white">
                Why Choose Laws Scanner?
              </h2>
              <p className="text-lg text-slate-400">
                We're dedicated to making web security accessible and effective for businesses of all sizes. 
                Our platform combines cutting-edge technology with user-friendly interfaces to deliver 
                comprehensive security solutions.
              </p>
              
              <div className="space-y-4">
                {[
                  "Industry-leading vulnerability detection",
                  "Easy integration with existing workflows",
                  "24/7 expert support and monitoring",
                  "Compliance with security standards"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-slate-300">{item}</span>
                  </div>
                ))}
              </div>

              <Button 
                size="lg"
                onClick={() => navigate('/dashboard')} // CHANGED: Now goes to dashboard
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
              >
                Start Free Scan Today
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-4xl font-bold text-white">
            Ready to Secure Your Web Applications?
          </h2>
          <p className="text-xl text-slate-400">
            Join thousands of developers and security professionals who trust Laws Scanner 
            to protect their web applications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Button 
                  size="lg"
                  onClick={() => navigate('/dashboard')}
                  className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
                >
                  Go to Dashboard
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    const confirmLogout = window.confirm('Are you sure you want to log out?');
                    if (confirmLogout) {
                      logout();
                    }
                  }}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button 
                  size="lg"
                  onClick={() => navigate('/dashboard')} 
                  className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
                >
                  Start Your Free Scan
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/auth')} 
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="relative bg-slate-900 border-t border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-green-400" />
                <span className="text-lg font-bold text-white">Laws Scanner</span>
              </div>
              <p className="text-slate-400">
                Advanced web security scanning and monitoring for modern applications.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <div className="space-y-2">
                <a href="#features" className="block text-slate-400 hover:text-white transition-colors">Features</a>
                <a href="#" className="block text-slate-400 hover:text-white transition-colors">Pricing</a>
                <a href="#" className="block text-slate-400 hover:text-white transition-colors">API</a>
                <a href="#" className="block text-slate-400 hover:text-white transition-colors">Documentation</a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <div className="space-y-2">
                <a href="#about" className="block text-slate-400 hover:text-white transition-colors">About</a>
                <a href="#" className="block text-slate-400 hover:text-white transition-colors">Careers</a>
                <a href="#" className="block text-slate-400 hover:text-white transition-colors">Blog</a>
                <a href="#" className="block text-slate-400 hover:text-white transition-colors">Press</a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <div className="space-y-2">
                <a href="#" className="block text-slate-400 hover:text-white transition-colors">Help Center</a>
                <a href="#" className="block text-slate-400 hover:text-white transition-colors">Contact</a>
                <a href="#" className="block text-slate-400 hover:text-white transition-colors">Status</a>
                <a href="#" className="block text-slate-400 hover:text-white transition-colors">Privacy</a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700/50 mt-12 pt-8 text-center">
            <p className="text-slate-400">
              © 2024 Laws Scanner. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;