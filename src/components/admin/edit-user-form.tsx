
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
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/types';
import { Loader2, Camera } from 'lucide-react';
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import ImageKit from 'imagekit-javascript';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getAuth, updateProfile } from 'firebase/auth';

const editUserFormSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  phone: z.string().regex(/^[6-9]\d{9}$/, { message: 'Must be a valid 10-digit Indian mobile number.' }),
  bio: z.string().optional(),
});

type EditUserFormValues = z.infer<typeof editUserFormSchema>;

interface EditUserFormProps {
  user: User;
  onSuccess?: () => void;
}

export function EditUserForm({ user, onSuccess }: EditUserFormProps) {
  const firestore = useFirestore();
  const auth = getAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(user.photoURL || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: {
      fullName: user.fullName || '',
      phone: user.phone || '',
      bio: user.bio || '',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: 'Image too large',
          description: 'Please select an image smaller than 2MB.',
          variant: 'destructive',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(data: EditUserFormValues) {
    if (!firestore) return;
    setIsSubmitting(true);

    const userRef = doc(firestore, 'users', user.id);
    let newPhotoURL = user.photoURL;

    const file = fileInputRef.current?.files?.[0];
    if (file && imagePreview && imagePreview.startsWith('data:')) {
      try {
        const authRes = await fetch('/api/imagekit/auth');
        const authBody = await authRes.json();
        if (!authRes.ok) {
          throw new Error(authBody.message || 'ImageKit authentication failed.');
        }

        const imagekit = new ImageKit({
          publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
          urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
          authenticationEndpoint: `${process.env.NEXT_PUBLIC_APP_URL}/api/imagekit/auth`
        });

        const uploadResult = await imagekit.upload({
          file,
          fileName: `${user.id}_avatar_${Date.now()}`,
          folder: "/delhi-estate-luxe/avatars",
          ...authBody,
        });
        newPhotoURL = uploadResult.url;
      } catch (error: any) {
        toast({
          title: 'Image Upload Failed',
          description: error.message || 'Could not upload new profile picture.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
    }

    const updateData = {
      ...data,
      photoURL: newPhotoURL,
    };
    
    updateDocumentNonBlocking(userRef, updateData);

    toast({
      title: 'User Updated',
      description: `${data.fullName}'s profile has been successfully updated.`,
      variant: 'success',
    });
    
    setIsSubmitting(false);
    if (onSuccess) {
      onSuccess();
    }
  }
  
  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={imagePreview ?? undefined} alt={user.fullName} />
                    <AvatarFallback className="text-3xl">{getInitials(user.fullName)}</AvatarFallback>
                </Avatar>
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                    <Camera className="h-8 w-8 text-white" />
                </button>
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/png, image/jpeg, image/gif"
                />
            </div>
        </div>
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
                <Textarea placeholder="A short bio about the user..." {...field} />
              </FormControl>
              <FormDescription>
                This will be displayed on the professional's public profile page.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onSuccess}>
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

