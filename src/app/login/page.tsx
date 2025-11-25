
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, initiatePasswordReset } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';
import { Logo } from '@/components/shared/logo';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        width="24px"
        height="24px"
        {...props}
      >
        <path
          fill="#FFC107"
          d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
        />
        <path
          fill="#FF3D00"
          d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
        />
        <path
          fill="#4CAF50"
          d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.612-3.28-11.28-7.914l-6.522,5.023C9.505,39.556,16.227,44,24,44z"
        />
        <path
          fill="#1976D2"
          d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.999,35.536,44,30.169,44,24C44,22.659,43.862,21.35,43.611,20.083z"
        />
      </svg>
    );
  }

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const auth = useAuth();
  const firestore = getFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleAuthError = (error: unknown) => {
    console.error(error);
    let errorMessage = 'An unexpected error occurred.';
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password.';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'An account already exists with this email. Please login.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. It must be at least 6 characters long.';
          break;
        default:
          errorMessage = 'Authentication failed. Please try again.';
      }
    }
    toast({
      variant: 'destructive',
      title: 'Authentication Error',
      description: errorMessage,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth) return;

    if (isLogin) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: 'Login Successful!',
          description: 'Welcome back!',
          variant: 'success',
        });
        router.push('/');
      } catch (error) {
        handleAuthError(error);
      }
    } else {
      if (password !== confirmPassword) {
        toast({
          variant: 'destructive',
          title: 'Passwords do not match',
        });
        return;
      }
      if (!fullName || !phone || !category) {
        toast({
            variant: 'destructive',
            title: 'Missing Information',
            description: 'Please fill out all fields.',
        });
        return;
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update Firebase Auth profile
        await updateProfile(user, { displayName: fullName });

        // Create user document in Firestore
        const userDocRef = doc(firestore, 'users', user.uid);
        await setDoc(userDocRef, {
            id: user.uid,
            fullName: fullName,
            email: user.email,
            phone: phone,
            category: category,
            dateJoined: serverTimestamp(),
        });
        
        toast({
          title: 'Sign Up Successful!',
          description: 'Welcome to Farhaz Homes!',
          variant: 'success',
        });
        router.push('/');
      } catch (error) {
        handleAuthError(error);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        toast({
            title: 'Login Successful!',
            description: 'Welcome back!',
            variant: 'success',
        });
        router.push('/');
    } catch (error: unknown) {
        handleAuthError(error);
    }
  };

  const handlePasswordReset = async () => {
    if (!auth || !resetEmail) return;

    try {
        await initiatePasswordReset(auth, resetEmail);
        toast({
            title: 'Password Reset Email Sent',
            description: 'Please check your inbox for instructions to reset your password.',
        });
    } catch (error: unknown) {
        console.error(error);
        let errorMessage = "Could not send password reset email. Please try again.";
        if (error instanceof FirebaseError) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
                errorMessage = "No user found with this email address.";
            }
        }
        toast({
            variant: 'destructive',
            title: 'Reset Failed',
            description: errorMessage,
        });
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <Logo />
            </div>
          <CardTitle className="text-2xl">{isLogin ? 'Welcome Back' : 'Create an Account'}</CardTitle>
          <CardDescription>
            {isLogin
              ? "Enter your credentials to access your account."
              : 'Fill in the details below to create a new account.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="e.g., John Doe"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="e.g., 9999988888"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                     {isLogin && (
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="link" type="button" className="p-0 h-auto text-xs">Forgot Password?</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Reset Your Password</AlertDialogTitle>
                            <AlertDialogDescription>
                                Enter your email address and we'll send you a link to reset your password.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-2">
                                <Label htmlFor="reset-email">Email</Label>
                                <Input
                                    id="reset-email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                />
                            </div>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handlePasswordReset}>Send Reset Link</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {!isLogin && (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">You are a...</Label>
                        <Select onValueChange={setCategory} value={category}>
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="listing-property">Property Owner / Lister</SelectItem>
                                <SelectItem value="real-estate-agent">Real Estate Agent</SelectItem>
                                <SelectItem value="interior-designer">Interior Designer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </>
              )}
              <Button type="submit" className="w-full">
                {isLogin ? 'Login' : 'Sign Up'}
              </Button>
            </form>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                <GoogleIcon className="mr-2 h-4 w-4" />
                Continue with Google
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button variant="link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
          </Button>
            <Button variant="link" asChild className="text-sm text-muted-foreground">
                <Link href="/">Back to Home</Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
