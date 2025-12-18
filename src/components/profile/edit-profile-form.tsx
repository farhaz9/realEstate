'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore, useUser, useAuth, updateProfileNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { User as UserType } from '@/types';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';

const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  phone: z.string().regex(/^[6-9]\d{9}$/, { message: 'Must be a valid 10-digit Indian mobile number.' }),
  bio: z.string().max(200, 'Bio must be 200 characters or less.').optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface EditProfileFormProps {
  userProfile: UserType;
  onSuccess?: () => void;
}

export function EditProfileForm({ userProfile, onSuccess }: EditProfileFormProps) {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: userProfile.fullName || '',
      phone: userProfile.phone || '',
      bio: userProfile.bio || '',
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    if (!user || !auth || !firestore) return;
    setIsSubmitting(true);

    const userDocRef = doc(firestore, 'users', user.uid);
    
    // Update Firestore document
    updateDocumentNonBlocking(userDocRef, data);

    // Update Firebase Auth profile if full name changed
    if (data.fullName !== user.displayName) {
        if(auth.currentUser) {
            updateProfileNonBlocking(auth.currentUser, { displayName: data.fullName });
        }
    }

    toast({
      title: 'Profile Updated',
      description: 'Your changes have been saved successfully.',
      variant: 'success',
    });
    
    setIsSubmitting(false);
    if (onSuccess) {
      onSuccess();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input type="tel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea placeholder="Tell us a little bit about yourself" {...field} />
              </FormControl>
              <FormDescription>
                This will be displayed on your public profile if you are a professional.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onSuccess} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
        </div>
      </form>
    </Form>
  );
}
