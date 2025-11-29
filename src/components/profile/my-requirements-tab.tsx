
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFirestore, useUser, addDocumentNonBlocking, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, serverTimestamp, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Send, FileText } from 'lucide-react';
import type { Requirement } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const requirementSchema = z.object({
  text: z.string().min(20, { message: 'Requirement must be at least 20 characters long.' }).max(500, { message: "Requirement cannot exceed 500 characters."}),
});

type RequirementFormValues = z.infer<typeof requirementSchema>;

export function MyRequirementsTab() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const form = useForm<RequirementFormValues>({
    resolver: zodResolver(requirementSchema),
    defaultValues: { text: '' },
  });

  const userRequirementsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
        collection(firestore, 'requirements'), 
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
    );
  }, [firestore, user]);

  const { data: requirements, isLoading } = useCollection<Requirement>(userRequirementsQuery);

  async function onSubmit(data: RequirementFormValues) {
    if (!user || !firestore) {
      toast({ title: 'You must be logged in to post a requirement.', variant: 'destructive' });
      return;
    }

    const requirementData = {
      userId: user.uid,
      text: data.text,
      createdAt: serverTimestamp(),
    };
    
    await addDocumentNonBlocking(collection(firestore, 'requirements'), requirementData);
    
    toast({
      title: 'Requirement Posted!',
      description: 'Professionals will now be able to see your requirement.',
      variant: 'success',
    });
    form.reset();
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Post a New Requirement</CardTitle>
          <CardDescription>Let professionals know what you're looking for. Be as detailed as possible.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Requirement</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'Looking for a 3BHK apartment for rent in South Delhi, preferably near a metro station. Budget is around 50k per month. Semi-furnished is a plus.'"
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Post Requirement
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-bold mb-4">Your Posted Requirements</h2>
        {isLoading ? (
          <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : requirements && requirements.length > 0 ? (
          <div className="space-y-4">
            {requirements.map(req => (
              <Card key={req.id} className="bg-muted/50">
                <CardContent className="p-4">
                  <p className="text-muted-foreground whitespace-pre-wrap">{req.text}</p>
                  <p className="text-xs text-muted-foreground mt-4">
                    Posted {formatDistanceToNow(req.createdAt.toDate(), { addSuffix: true })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">You haven't posted any requirements yet.</h3>
            <p className="text-muted-foreground mt-1">Use the form above to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

    