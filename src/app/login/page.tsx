
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, initiatePasswordReset } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';
import Link from 'next/link';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { Eye, EyeOff, AlertCircle, User, Mail, Lock, Home, KeyRound, Briefcase, Paintbrush2, CheckCircle2, Building2, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';
import { Logo } from '@/components/shared/logo';
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
} from "@/components/ui/alert-dialog";

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

const roles = [
    { id: 'user', name: 'Buyer/Tenant', icon: Home },
    { id: 'listing-property', name: 'Property Owner', icon: KeyRound },
    { id: 'real-estate-agent', name: 'Real Estate Agent', icon: Briefcase },
    { id: 'interior-designer', name: 'Interior Designer', icon: Paintbrush2 },
    { id: 'vendor', name: 'Vendor/Supplier', icon: Wrench },
];


export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  
  // Vendor specific fields
  const [companyName, setCompanyName] = useState('');
  const [servicesProvided, setServicesProvided] = useState('');
  const [bio, setBio] = useState('');

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
          errorMessage = 'An account already exists with this email.';
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
  
  const generateUsername = (name: string, email: string) => {
    const namePart = name.toLowerCase().replace(/\s+/g, '').substring(0, 8);
    const emailPart = email.split('@')[0].toLowerCase().substring(0, 4);
    const randomPart = Math.floor(100 + Math.random() * 900);
    return `${namePart}${emailPart}${randomPart}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth) return;

    if (isLogin) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${user.displayName}!`,
          variant: 'success',
        });
        router.push('/');
      } catch (error) {
        handleAuthError(error);
      }
    } else { // Sign up
      if (!fullName || !phone) {
        toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill out all required fields.' });
        return;
      }
       if (category === 'vendor' && (!companyName || !servicesProvided || !bio)) {
        toast({ variant: 'destructive', title: 'Missing Vendor Information', description: 'Please fill out all company details.' });
        return;
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: fullName });

        const userDocRef = doc(firestore, 'users', user.uid);
        
        const username = generateUsername(fullName, user.email || '');

        const userData: any = {
            id: user.uid,
            fullName: fullName,
            username: username,
            email: user.email,
            phone: phone,
            category: category,
            dateJoined: serverTimestamp(),
            photoURL: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
            wishlist: [],
            orders: [],
            listingCredits: 1,
        };
        
        if (category === 'vendor') {
          userData.companyName = companyName;
          userData.servicesProvided = servicesProvided.split(',').map(s => s.trim()).filter(s => s);
          userData.bio = bio;
        }

        await setDoc(userDocRef, userData);
        
        toast({
          title: 'Sign Up Successful!',
          description: 'Welcome to Falcon Axe Homes! You have received 1 free listing credit.',
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
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const username = generateUsername(user.displayName || '', user.email || '');
        await setDoc(userDocRef, {
          id: user.uid,
          fullName: user.displayName,
          username: username,
          email: user.email,
          phone: user.phoneNumber || '',
          category: 'user',
          dateJoined: serverTimestamp(),
          photoURL: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
          wishlist: [],
          orders: [],
          listingCredits: 1,
        });
         toast({
          title: 'Sign Up Successful!',
          description: 'Welcome to Falcon Axe Homes! You have received 1 free listing credit.',
          variant: 'success',
        });
      } else {
        toast({
            title: 'Login Successful',
            description: `Welcome back, ${user.displayName}!`,
            variant: 'success',
        });
      }
      
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
    <div className="bg-background-light dark:bg-background-dark text-[#111418] dark:text-white flex-grow w-full flex">
      <div className="hidden lg:flex w-1/2 relative flex-col justify-center p-12">
        <Image 
          src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=2874&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Modern minimalist living room"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20"></div>

        <div className="relative z-10 text-white max-w-lg self-center">
          <p className="text-5xl font-bold leading-tight mb-6 drop-shadow-lg">Discover a place you'll love to live.</p>
          <p className="text-lg text-gray-100 font-light leading-relaxed max-w-md drop-shadow-md">Join our community of homeowners and interior design enthusiasts. Find your dream home or the inspiration to build it.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 min-h-screen flex flex-col overflow-y-auto bg-white dark:bg-background-dark relative">
        <h1 className="sr-only">Login or Sign Up</h1>
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 md:p-16">
          <div className="w-full max-w-[480px] flex flex-col gap-6">
            <div className="flex flex-col gap-2 text-center sm:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-[#111418] dark:text-white">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
              <p className="text-[#617589] dark:text-gray-400 text-base">{isLogin ? 'Enter your credentials to access your account' : 'Choose your role and enter your details to join.'}</p>
            </div>
            <div className="w-full bg-[#f3f4f6] dark:bg-gray-800 p-1.5 rounded-xl flex">
              <button onClick={() => setIsLogin(true)} className={cn("flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all text-center", isLogin ? "shadow-sm bg-white dark:bg-gray-700 text-primary dark:text-white ring-1 ring-black/5 dark:ring-white/10" : "bg-transparent text-[#6b7280] dark:text-gray-400 hover:text-[#111418] dark:hover:text-white")}>
                Sign In
              </button>
              <button onClick={() => setIsLogin(false)} className={cn("flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all text-center", !isLogin ? "shadow-sm bg-white dark:bg-gray-700 text-primary dark:text-white ring-1 ring-black/5 dark:ring-white/10" : "bg-transparent text-[#6b7280] dark:text-gray-400 hover:text-[#111418] dark:hover:text-white")}>
                Sign Up
              </button>
            </div>
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {roles.map((role) => (
                    <label key={role.id} className="cursor-pointer relative group">
                      <input 
                        className="peer sr-only" 
                        name="role" 
                        type="radio" 
                        value={role.id}
                        checked={category === role.id}
                        onChange={(e) => setCategory(e.target.value)}
                      />
                      <div className="h-full p-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary/50 dark:hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary dark:peer-checked:bg-primary/20 text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center gap-2 transition-all duration-200 text-center">
                        <role.icon className="text-xl group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-semibold">{role.name}</span>
                      </div>
                      <div className="absolute top-2 right-2 text-primary opacity-0 peer-checked:opacity-100 transition-opacity duration-200 scale-0 peer-checked:scale-100">
                        <CheckCircle2 className="text-lg" />
                      </div>
                    </label>
                  ))}
                </div>
              )}
               {!isLogin && (
                <>
                <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-semibold text-[#374151] dark:text-gray-300" htmlFor="name">Full Name</Label>
                    <div className="relative group">
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full h-11 rounded-xl border border-[#e5e7eb] dark:border-gray-700 bg-white dark:bg-gray-800 px-4 pl-11 text-base text-[#111418] dark:text-white placeholder-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-200" id="name" placeholder="John Doe" type="text"/>
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-200">
                        <User className="h-[22px] w-[22px]" />
                    </div>
                    </div>
                </div>
                 <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-semibold text-[#374151] dark:text-gray-300" htmlFor="phone">Phone Number</Label>
                    <div className="relative group">
                        <Input value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full h-11 rounded-xl border border-[#e5e7eb] dark:border-gray-700 bg-white dark:bg-gray-800 px-4 pl-11 text-base text-[#111418] dark:text-white placeholder-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-200" id="phone" placeholder="9876543210" type="tel"/>
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-200">
                            <User className="h-[22px] w-[22px]" />
                        </div>
                    </div>
                </div>
                </>
              )}
              
              {!isLogin && category === 'vendor' && (
                <>
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-sm font-semibold text-[#374151] dark:text-gray-300" htmlFor="companyName">Company Name</Label>
                        <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="h-11" id="companyName" placeholder="e.g., ABC Materials Co." type="text"/>
                    </div>
                     <div className="flex flex-col gap-1.5">
                        <Label className="text-sm font-semibold text-[#374151] dark:text-gray-300" htmlFor="servicesProvided">Services/Products Provided</Label>
                        <Input value={servicesProvided} onChange={(e) => setServicesProvided(e.target.value)} required className="h-11" id="servicesProvided" placeholder="e.g., Plumbing, Electrical Supplies, Tiles" type="text"/>
                        <p className="text-xs text-muted-foreground">Enter a comma-separated list.</p>
                    </div>
                     <div className="flex flex-col gap-1.5">
                        <Label className="text-sm font-semibold text-[#374151] dark:text-gray-300" htmlFor="bio">About Your Company</Label>
                        <Textarea value={bio} onChange={(e) => setBio(e.target.value)} required className="h-24" id="bio" placeholder="Describe your business in a few sentences."/>
                    </div>
                </>
              )}

              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-semibold text-[#374151] dark:text-gray-300" htmlFor="email">Email Address</Label>
                <div className="relative group">
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full h-11 rounded-xl border border-[#e5e7eb] dark:border-gray-700 bg-white dark:bg-gray-800 px-4 pl-11 text-base text-[#111418] dark:text-white placeholder-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-200" id="email" placeholder="name@example.com" type="email"/>
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-200">
                    <Mail className="h-[22px] w-[22px]" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-[#374151] dark:text-gray-300" htmlFor="password">Password</Label>
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
                <div className="relative group">
                  <Input value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full h-11 rounded-xl border border-[#e5e7eb] dark:border-gray-700 bg-white dark:bg-gray-800 px-4 pl-11 text-base text-[#111418] dark:text-white placeholder-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-200" id="password" placeholder={isLogin ? "Enter your password" : "Create a password"} type={showPassword ? 'text' : 'password'}/>
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-200">
                    <Lock className="h-[22px] w-[22px]" />
                  </div>
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#111418] dark:hover:text-white transition-colors" type="button">
                    {showPassword ? <EyeOff className="h-[22px] w-[22px]" /> : <Eye className="h-[22px] w-[22px]" />}
                  </button>
                </div>
              </div>

              <Button className="w-full h-12 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 mt-2" type="submit">
                {isLogin ? 'Sign In' : 'Sign Up'}
              </Button>
            </form>
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#e5e7eb] dark:border-gray-700"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-sm font-medium">Or</span>
              <div className="flex-grow border-t border-[#e5e7eb] dark:border-gray-700"></div>
            </div>
            <Button onClick={handleGoogleSignIn} className="w-full h-12 bg-white dark:bg-gray-800 border border-[#e5e7eb] dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 text-[#374151] dark:text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-sm hover:shadow-md" type="button">
              <GoogleIcon className="w-5 h-5" />
              {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-2 leading-relaxed px-4">
              By clicking "{isLogin ? 'Sign In' : 'Sign Up'}" or "{isLogin ? 'Sign in with Google' : 'Sign up with Google'}", you agree to our 
              <a className="text-primary hover:text-primary-dark hover:underline font-medium transition-colors" href="#"> Terms of Service</a> and 
              <a className="text-primary hover:text-primary-dark hover:underline font-medium transition-colors" href="#"> Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
    

    
