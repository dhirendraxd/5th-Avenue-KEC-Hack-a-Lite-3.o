import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Home } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loginWithGoogle, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const success = await loginWithGoogle();
      if (!success) {
        throw new Error('Google sign-in was canceled or failed.');
      }
      toast({
        title: 'Signed in with Google',
        description: 'Firebase integration can be connected next.',
      });
      navigate('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please try again.';
      toast({
        title: 'Google sign-in failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="mb-4 flex justify-center">
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>

        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">GearShift</span>
        </Link>

        <Card>
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl">Sign in to GearShift</CardTitle>
            <CardDescription>
              Google is the default and only login method.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button type="button" variant="outline" className="w-full gap-2" onClick={handleGoogleAuth} disabled={isLoading}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.3-1.9 3v2.5h3.1c1.8-1.6 2.8-4 2.8-6.9 0-.7-.1-1.3-.2-1.9H12z" />
                <path fill="#34A853" d="M12 21c2.5 0 4.7-.8 6.2-2.2l-3.1-2.5c-.9.6-2 .9-3.1.9-2.4 0-4.5-1.6-5.2-3.8H3.6v2.6C5.1 19 8.3 21 12 21z" />
                <path fill="#4A90E2" d="M6.8 13.4c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V7H3.6A9 9 0 0 0 2.7 11.5c0 1.4.3 2.8.9 4l3.2-2.1z" />
                <path fill="#FBBC05" d="M12 5.8c1.4 0 2.6.5 3.6 1.4l2.7-2.7C16.7 3 14.5 2 12 2 8.3 2 5.1 4 3.6 7l3.2 2.6c.7-2.2 2.8-3.8 5.2-3.8z" />
              </svg>
              {isLoading ? 'Signing in...' : 'Continue with Google'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Sign in uses your Firebase Google Auth configuration.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
