import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { 
  Shield, 
  Mail, 
  Lock, 
  User, 
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const AuthPage = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleLogin = async (data: z.infer<typeof loginSchema>) => {
    setLoading(true);
    try {
      const result = await login(data.email, data.password);
      
      if (result.success) {
        toast.success("Login successful!");
     navigate("/dashboard", { replace: true });
      } else {
        toast.error(result.error || "Login failed. Please try again.");
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: z.infer<typeof registerSchema>) => {
    setLoading(true);
    try {
      const result = await register(data.username, data.email, data.password);
      
      if (result.success) {
        toast.success("Registration successful! Please log in.");
        setIsRegisterMode(false);
        registerForm.reset();
      } else {
        toast.error(result.error || "Registration failed. Please try again.");
      }
    } catch (error: any) {
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    loginForm.reset();
    registerForm.reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-green-400" />
              <span className="text-xl font-bold text-white">Laws Scanner</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <a href="/" className="text-slate-400 hover:text-white transition-colors">
                Home
              </a>
              <a href="#about" className="text-slate-400 hover:text-white transition-colors">
                About
              </a>
              <a href="#services" className="text-slate-400 hover:text-white transition-colors">
                Services
              </a>
              <a href="#contact" className="text-slate-400 hover:text-white transition-colors">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
      
      {/* Main Content */}
      <div className="relative flex-1 flex items-center justify-center px-4 pt-16">
        <div className="w-full max-w-md">
          <Card className="bg-slate-800/90 backdrop-blur-sm border-slate-700/50 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-r from-green-500/20 to-green-600/20 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-green-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                {isRegisterMode ? "Create Account" : "Welcome Back"}
              </CardTitle>
              <p className="text-slate-400 text-sm">
                {isRegisterMode 
                  ? "Join Laws Scanner to start securing your websites" 
                  : "Sign in to your Laws Scanner account"
                }
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {!isRegisterMode ? (
                // Login Form
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-green-500"
                        {...loginForm.register("email")}
                      />
                    </div>
                    {loginForm.formState.errors.email && (
                      <p className="text-red-400 text-xs">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-green-500"
                        {...loginForm.register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-red-400 text-xs">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              ) : (
                // Register Form
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="Choose a username"
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-green-500"
                        {...registerForm.register("username")}
                      />
                    </div>
                    {registerForm.formState.errors.username && (
                      <p className="text-red-400 text-xs">
                        {registerForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-green-500"
                        {...registerForm.register("email")}
                      />
                    </div>
                    {registerForm.formState.errors.email && (
                      <p className="text-red-400 text-xs">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-green-500"
                        {...registerForm.register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {registerForm.formState.errors.password && (
                      <p className="text-red-400 text-xs">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-green-500"
                        {...registerForm.register("confirmPassword")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-red-400 text-xs">
                        {registerForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              )}

              {/* Toggle between login and register */}
              <div className="text-center">
                <p className="text-slate-400 text-sm">
                  {isRegisterMode ? "Already have an account?" : "Don't have an account?"}{" "}
                  <button
                    onClick={toggleMode}
                    className="text-green-400 hover:text-green-300 font-medium transition-colors"
                  >
                    {isRegisterMode ? "Sign In" : "Sign Up"}
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <button
              onClick={() => navigate("/")}
              className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2 mx-auto"
            >
              <X className="h-4 w-4" />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default AuthPage;