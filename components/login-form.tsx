'use client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import Icons from '@/components/ui/icons';
import { FcGoogle } from 'react-icons/fc';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [isLoadingG, setIsLoadingG] = useState<boolean>(false);

  const handleLoginGoogle = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    setIsLoadingG(true);

    try {
      const authUrl = `/api/auth`;
      window.location.href = authUrl;
      setTimeout(() => {
        setIsLoadingG(false);
      }, 10000);
    } catch (error) {
      console.error('Error during Google login:', error);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-10',
        className
      )}
      {...props}
    >
      <Card className="w-full max-w-5xl h-[50vh] flex  p-6 ">
        <CardContent className="flex flex-col md:flex-row gap-6 p-6 items-center">
          {/* Left Side: App Description */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold">Welcome to Pagers</h1>
            <p className="mt-3 text-base text-muted-foreground">
              Your exclusive community for projects.
            </p>
            <p className="mt-2 text-base text-muted-foreground">
              Showcase your projects, find like-minded collaborators, and evolve
              together.
            </p>
            <p className="mt-2 text-sm italic text-primary">
              &quot;Where ideas connect, and projects take flight&quot;
            </p>
          </div>

          {/* Separators */}
          <Separator orientation="horizontal" className="md:hidden" />
          <Separator orientation="vertical" className="hidden md:block" />

          {/* Right Side: Login Form */}
          <div className="flex-1">
            <CardTitle className="text-2xl font-bold text-center">
              Sign In
            </CardTitle>
            <CardDescription className="mt-2  text-center">
              Sign in with your Google account to get started
            </CardDescription>
            <form onSubmit={handleLoginGoogle} className="mt-20">
              <Button type="submit" variant="outline" className="w-full">
                {isLoadingG ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FcGoogle className="mr-4 text-xl" />
                )}
                Login with Google
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground">
        By clicking continue, you agree to our{' '}
        <a href="#" className="underline">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" className="underline">
          Privacy Policy
        </a>
        .
      </footer>
    </div>
  );
}
