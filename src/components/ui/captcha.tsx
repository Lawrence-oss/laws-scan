import { useState, useEffect } from 'react';
import { RefreshCw, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useScan, type CaptchaData } from '@/context/ScanContext';
import { toast } from 'sonner';

interface CaptchaProps {
  onCaptchaComplete: (captchaData: { token: string; answer: string }, isValid: boolean) => void;
  isRequired: boolean;
}

export const Captcha = ({ onCaptchaComplete, isRequired }: CaptchaProps) => {
  const [captchaData, setCaptchaData] = useState<CaptchaData | null>(null);
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const { getCaptcha } = useScan();

  // Calculate the correct answer based on the question
  const getCorrectAnswer = (question: string): number | null => {
    if (!question) return null;
    
    // Extract numbers and operator from question like "5 + 3 = ?"
    const match = question.match(/(\d+)\s*([+\-×*])\s*(\d+)\s*=\s*\?/);
    if (!match) return null;
    
    const num1 = parseInt(match[1]);
    const operator = match[2];
    const num2 = parseInt(match[3]);
    
    switch (operator) {
      case '+':
        return num1 + num2;
      case '-':
        return num1 - num2;
      case '×':
      case '*':
        return num1 * num2;
      default:
        return null;
    }
  };

  const loadCaptcha = async () => {
    if (!isRequired) {
      onCaptchaComplete({ token: '', answer: '' }, true);
      return;
    }

    setIsLoading(true);
    setAnswer('');
    setIsValid(false);
    setHasAttempted(false);
    
    try {
      const data = await getCaptcha();
      setCaptchaData(data);
    } catch (error) {
      toast.error('Failed to load security verification');
      console.error('Captcha loading error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCaptcha();
  }, [isRequired]);

  const handleAnswerChange = (value: string) => {
    setAnswer(value);
    setHasAttempted(true);
    
    if (captchaData && value.trim()) {
      const userAnswer = parseInt(value.trim());
      const correctAnswer = getCorrectAnswer(captchaData.question);
      const valid = !isNaN(userAnswer) && userAnswer === correctAnswer;
      
      setIsValid(valid);
      onCaptchaComplete({
        token: captchaData.token,
        answer: value.trim()
      }, valid);
    } else {
      setIsValid(false);
      onCaptchaComplete({ token: '', answer: '' }, false);
    }
  };

  const handleRefresh = () => {
    loadCaptcha();
  };

  if (!isRequired) {
    return null;
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-green-400" />
          Security Verification
        </CardTitle>
        <CardDescription>
          Please solve the math problem below to verify you're human
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
            <span className="ml-2 text-slate-400">Loading verification...</span>
          </div>
        ) : captchaData ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center bg-slate-700/50 rounded-lg p-6 border border-slate-600">
              <div className="text-center">
                <div className="text-2xl font-mono text-white mb-2">
                  {captchaData.question}
                </div>
                <div className="text-sm text-slate-400">
                  Enter the answer below
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="number"
                  value={answer}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Enter your answer"
                  className={`pr-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-green-500 ${
                    hasAttempted 
                      ? isValid 
                        ? 'border-green-500 focus:border-green-400' 
                        : 'border-red-500 focus:border-red-400'
                      : ''
                  }`}
                />
                {hasAttempted && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isValid ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                className="border-slate-600 text-slate-400 hover:text-white hover:border-slate-500"
                title="Get new question"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            
            {hasAttempted && (
              <div className="text-sm text-center">
                {isValid ? (
                  <span className="text-green-400 flex items-center justify-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Correct! You can now start scanning.
                  </span>
                ) : (
                  <span className="text-red-400 flex items-center justify-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Incorrect answer. Please try again.
                  </span>
                )}
              </div>
            )}
            
            <div className="text-xs text-slate-400 text-center">
              Having trouble? Click the refresh button for a new question
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="text-slate-400 mb-4">Failed to load security verification</div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="border-slate-600 text-slate-400 hover:text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};