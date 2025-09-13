import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="space-y-6">
        <Shield className="h-24 w-24 text-muted-foreground mx-auto" />
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <Button 
          onClick={() => navigate('/')}
          className="glow glow-primary"
          size="lg"
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}