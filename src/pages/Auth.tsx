import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Volume2, Mic, ArrowUp, Plus, Sparkles } from 'lucide-react';
import heroEquipment from '@/assets/hero-equipment.jpg';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loginWithGoogle, login, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isCreating, setIsCreating] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const success = await loginWithGoogle();
      if (success) {
        toast({
          title: 'Signed in with Google',
          description: 'Welcome to 5th Avenue.',
        });
        navigate('/dashboard');
      }
    } catch {
      toast({
        title: 'Google sign-in failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast({
          title: isCreating ? 'Account ready' : 'Signed in',
          description: 'Welcome to 5th Avenue.',
        });
        navigate('/dashboard');
        return;
      }

      toast({
        title: isCreating ? 'Could not create account' : 'Sign in failed',
        description: 'Try Google sign in, or check your email and password.',
        variant: 'destructive',
      });
    } catch {
      toast({
        title: isCreating ? 'Could not create account' : 'Sign in failed',
        description: 'Try Google sign in, or check your email and password.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen w-full overflow-hidden bg-background">
        <div className="pointer-events-none absolute left-6 top-6 z-20 sm:left-8 sm:top-8">
          <nav className="pointer-events-auto flex items-center gap-2 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">Auth</span>
          </nav>
        </div>

        <div className="flex w-full items-center justify-center bg-background px-6 py-10 sm:px-10 lg:w-[44%] lg:px-16">
          <div className="w-full max-w-[360px] space-y-6">
            <h1 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
              {isCreating ? 'Create your account' : 'Sign in to your account'}
            </h1>

            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full gap-2 rounded-lg bg-muted/45 text-xs"
                onClick={handleGoogleAuth}
                disabled={isLoading}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.3-1.9 3v2.5h3.1c1.8-1.6 2.8-4 2.8-6.9 0-.7-.1-1.3-.2-1.9H12z" />
                  <path fill="#34A853" d="M12 21c2.5 0 4.7-.8 6.2-2.2l-3.1-2.5c-.9.6-2 .9-3.1.9-2.4 0-4.5-1.6-5.2-3.8H3.6v2.6C5.1 19 8.3 21 12 21z" />
                  <path fill="#4A90E2" d="M6.8 13.4c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V7H3.6A9 9 0 0 0 2.7 11.5c0 1.4.3 2.8.9 4l3.2-2.1z" />
                  <path fill="#FBBC05" d="M12 5.8c1.4 0 2.6.5 3.6 1.4l2.7-2.7C16.7 3 14.5 2 12 2 8.3 2 5.1 4 3.6 7l3.2 2.6c.7-2.2 2.8-3.8 5.2-3.8z" />
                </svg>
                {isLoading ? 'Please wait...' : 'Sign up with Google'}
              </Button>

              <form onSubmit={handleEmailAuth} className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Email</label>
                  <Input
                    type="email"
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 rounded-lg border-border/80"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-10 rounded-lg border-border/80"
                  />
                </div>

                <Button type="submit" className="h-10 w-full rounded-lg bg-foreground text-background hover:bg-foreground/90">
                  {isCreating ? 'Create account' : 'Sign in'}
                </Button>
              </form>

              <p className="text-center text-xs text-muted-foreground">
                {isCreating ? 'Already have an account?' : 'Need an account?'}{' '}
                <button
                  type="button"
                  className="font-medium text-foreground hover:underline"
                  onClick={() => setIsCreating((previous) => !previous)}
                >
                  {isCreating ? 'Sign in' : 'Create account'}
                </button>
              </p>
            </div>
          </div>
        </div>

        <div className="relative hidden overflow-hidden bg-muted/20 lg:block lg:w-[56%]">
          <img src={heroEquipment} alt="Creative equipment visual" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/35 via-emerald-900/10 to-slate-950/45" />

          <button
            type="button"
            className="absolute left-5 top-5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm"
            aria-label="Audio"
          >
            <Volume2 className="h-3.5 w-3.5" />
          </button>

          <div className="absolute inset-x-0 bottom-7 flex justify-center px-8">
            <div className="w-full max-w-[520px] rounded-2xl border border-border/60 bg-background/95 p-4 shadow-2xl backdrop-blur">
              <p className="text-sm leading-relaxed text-foreground">
                Describe your task and 5th Avenue suggests the closest equipment match instantly.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Button size="icon" variant="outline" className="h-8 w-8 rounded-full">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="h-8 rounded-full px-3 text-xs">
                  <Sparkles className="mr-1 h-3.5 w-3.5 text-accent" />
                  Inspiration
                </Button>
                <span className="text-xs font-medium text-muted-foreground">Assistant 2.0</span>
                <div className="ml-auto flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Button size="icon" className="h-8 w-8 rounded-full">
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">Try 5th Avenue Assistant</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
