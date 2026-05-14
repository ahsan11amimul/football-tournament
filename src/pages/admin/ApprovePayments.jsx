import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, doc, updateDoc, increment, runTransaction } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Card, CardHeader } from '../../components/Card';
import { Button } from '../../components/Button';
import { toast } from 'react-hot-toast';
import { Check, X, Clock, DollarSign, User } from 'lucide-react';
import { format } from 'date-fns';

export default function ApprovePayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'payments'), where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPayments(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAction = async (payment, status) => {
    try {
      await runTransaction(db, async (transaction) => {
        const paymentRef = doc(db, 'payments', payment.id);
        const userRef = doc(db, 'users', payment.playerId);
        
        // Update payment status
        transaction.update(paymentRef, { status });

        // If approved, update user's total paid amount
        if (status === 'approved') {
          transaction.update(userRef, {
            paidAmount: increment(payment.amount)
          });
        }
      });
      
      toast.success(`Payment ${status === 'approved' ? 'Approved' : 'Rejected'}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update payment');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-color)' }}>Pending Payments</h1>
          <p className="text-slate-500 mt-1 font-medium">Review and approve player payment requests</p>
        </div>
        <div className="bg-orange-500/10 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-xl border border-orange-500/20 font-black text-xs uppercase tracking-widest">
          {payments.length} Pending
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {payments.length === 0 ? (
          <div className="text-center py-24 glass-card shadow-xl shadow-black/5 dark:shadow-black/20 border-slate-200 dark:border-white/5">
            <Check className="w-16 h-16 text-green-500/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>All caught up!</h3>
            <p className="text-slate-500 mt-2 font-medium">No pending payment requests to review.</p>
          </div>
        ) : (
          payments.map((payment) => (
            <Card key={payment.id} className="hover:border-primary/20 transition-all border-slate-200 dark:border-white/5 shadow-lg shadow-black/5 dark:shadow-black/20">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: 'var(--text-color)' }}>{payment.playerName}</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ref: {payment.reference}</p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col md:flex-row md:items-center justify-around gap-4">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Amount</p>
                    <p className="text-2xl font-black text-green-600 dark:text-green-400">৳{payment.amount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Date Submitted</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-color)' }}>
                      {payment.date ? format(new Date(payment.date), 'MMM dd, yyyy') : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button 
                    onClick={() => handleAction(payment, 'rejected')}
                    variant="outline" 
                    className="border-red-500/20 text-red-500 hover:bg-red-500/10"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </Button>
                  <Button 
                    onClick={() => handleAction(payment, 'approved')}
                    variant="primary"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </Button>
                </div>
              </div>
              {payment.note && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 text-sm text-slate-500 italic">
                  Note: "{payment.note}"
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
