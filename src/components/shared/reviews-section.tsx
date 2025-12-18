
'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection, useUser, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import type { Review } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MessageCircle, Send, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ReviewsSectionProps {
  professionalId: string;
}

export function ReviewsSection({ professionalId }: ReviewsSectionProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reviewsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, `users/${professionalId}/reviews`), orderBy('date', 'desc'));
  }, [firestore, professionalId]);

  const { data: reviews, isLoading } = useCollection<Review>(reviewsQuery);
  
  const hasUserReviewed = useMemo(() => {
      return reviews?.some(review => review.reviewerId === user?.uid);
  }, [reviews, user]);

  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return total / reviews.length;
  }, [reviews]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please log in", description: "You must be logged in to leave a review.", variant: "destructive" });
      return;
    }
    if (rating === 0) {
      toast({ title: "Rating required", description: "Please select a star rating.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    
    const reviewData: {
        professionalId: string;
        reviewerId: string;
        reviewerName: string;
        reviewerPhotoURL: string;
        rating: number;
        comment?: string;
        date: any;
    } = {
        professionalId,
        reviewerId: user.uid,
        reviewerName: user.displayName || 'Anonymous',
        reviewerPhotoURL: user.photoURL || '',
        rating,
        date: serverTimestamp(),
    };
    
    if (comment.trim()) {
        reviewData.comment = comment;
    }

    const reviewsRef = collection(firestore, `users/${professionalId}/reviews`);
    await addDocumentNonBlocking(reviewsRef, reviewData);
    
    toast({ title: "Review Submitted!", description: "Thank you for your feedback.", variant: "success" });
    
    setRating(0);
    setComment('');
    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-primary" />
                Reviews ({reviews?.length || 0})
            </CardTitle>
             {reviews && reviews.length > 0 && (
                <div className="flex items-center gap-2 text-lg font-bold">
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    <span>{averageRating.toFixed(1)}</span>
                </div>
            )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading && <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}
        
        {!isLoading && reviews && reviews.length > 0 && (
          <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
            {reviews.map(review => (
              <div key={review.id} className="flex items-start gap-4">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={review.reviewerPhotoURL} />
                  <AvatarFallback>{review.reviewerName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex justify-between items-center">
                         <div>
                            <p className="font-semibold">{review.reviewerName}</p>
                            <p className="text-xs text-muted-foreground">
                                {review.date ? formatDistanceToNow(review.date.toDate(), { addSuffix: true }) : 'Just now'}
                            </p>
                        </div>
                        <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={cn("h-4 w-4", i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300")} />
                            ))}
                        </div>
                    </div>
                    {review.comment && <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
        
         {!isLoading && reviews?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
                <p>No reviews yet. Be the first to leave one!</p>
            </div>
         )}
        
        <div className="border-t pt-6">
          {user ? (
            hasUserReviewed ? (
                <p className="text-center text-sm text-muted-foreground">You have already submitted a review for this professional.</p>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <h4 className="font-semibold">Leave a Review</h4>
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">Your Rating:</p>
                        <div className="flex">
                            {[...Array(5)].map((_, i) => {
                            const starValue = i + 1;
                            return (
                                <Star
                                key={starValue}
                                className={cn(
                                    "h-6 w-6 cursor-pointer transition-colors",
                                    starValue <= (hoverRating || rating)
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                )}
                                onClick={() => setRating(starValue)}
                                onMouseEnter={() => setHoverRating(starValue)}
                                onMouseLeave={() => setHoverRating(0)}
                                />
                            );
                            })}
                        </div>
                    </div>
                    <Textarea 
                        placeholder="Share your experience... (optional)"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        disabled={isSubmitting}
                    />
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Submit Review
                    </Button>
                </form>
            )
          ) : (
            <p className="text-center text-sm">
              <Link href="/login" className="text-primary font-semibold hover:underline">Log in</Link> to leave a review.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
