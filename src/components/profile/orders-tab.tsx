
'use client';

import { useUser, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User, Order } from '@/types';
import { Loader2, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { formatPrice } from '@/lib/utils';
import { Button } from '../ui/button';
import Link from 'next/link';

export function OrdersTab() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<User>(userDocRef);

  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const orders = userProfile?.orders || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag />
          Order History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.sort((a, b) => b.date.toMillis() - a.date.toMillis()).map((order: Order, index: number) => (
                  <TableRow key={order.paymentId || index}>
                    <TableCell className="font-mono text-xs">{order.paymentId}</TableCell>
                    <TableCell>
                      {order.date?.toDate ? format(order.date.toDate(), 'PPP p') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatPrice(order.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-2xl font-semibold">No Orders Found</h3>
            <p className="text-muted-foreground mt-2">You haven't purchased any listings yet.</p>
             <Button asChild className="mt-6">
                <Link href="/properties">Browse Properties</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
