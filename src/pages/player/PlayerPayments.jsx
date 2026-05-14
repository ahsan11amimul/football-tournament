import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import useAuthStore from '../../store/useAuthStore';
import { Card, CardHeader } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { toast } from 'react-hot-toast';
import { DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function PlayerPayments() {
  const { profile } = useAuthStore();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (!profile?.uid) return;

    const q = query(
      collection(db, 'payments'),
      where('playerId', '==', profile.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPayments(docs);
    });

    return () => unsubscribe();
  }, [profile?.uid]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'payments'), {
        playerId: profile.uid,
        playerName: profile.fullName,
        amount: parseFloat(data.amount),
        date: data.date,
        reference: data.reference,
        note: data.note || '',
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      toast.success('Payment request submitted! Waiting for admin approval.');
      reset();
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20"><CheckCircle className="w-3 h-3" /> Approved</span>;
      case 'rejected':
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20"><XCircle className="w-3 h-3" /> Rejected</span>;
      default:
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold border border-orange-500/20"><Clock className="w-3 h-3" /> Pending</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Submit Payment Form */}
      <div className="lg:col-span-1">
        <Card className="sticky top-24">
          <CardHeader 
            title="Submit Payment" 
            subtitle="Request approval for your tournament fee"
          />
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Amount (BDT)"
              type="number"
              placeholder="500"
              error={errors.amount?.message}
              {...register('amount', { required: 'Amount is required' })}
            />
            <Input
              label="Payment Date"
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              error={errors.date?.message}
              {...register('date', { required: 'Date is required' })}
            />
            <Input
              label="Reference / Paid To"
              placeholder="Admin Name or BKash Ref"
              error={errors.reference?.message}
              {...register('reference', { required: 'Reference is required' })}
            />
            <Input
              label="Optional Note"
              placeholder="Any additional details"
              {...register('note')}
            />
            <Button 
              type="submit" 
              className="w-full" 
              loading={loading}
            >
              Submit Request
            </Button>
          </form>
          
          <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-primary shrink-0" />
              <p className="text-xs text-slate-400 leading-relaxed">
                Your payment will be verified by the admin within 24 hours. Make sure to provide a valid reference.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Payment History */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader title="Payment History" subtitle="List of all your payment requests" />
          
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-500">No payment records found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="pb-4 font-semibold text-slate-400 text-sm">Date</th>
                    <th className="pb-4 font-semibold text-slate-400 text-sm">Amount</th>
                    <th className="pb-4 font-semibold text-slate-400 text-sm">Reference</th>
                    <th className="pb-4 font-semibold text-slate-400 text-sm text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="group">
                      <td className="py-4">
                        <p className="text-white font-medium">
                          {payment.date ? format(new Date(payment.date), 'MMM dd, yyyy') : 'N/A'}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {payment.createdAt ? format(new Date(payment.createdAt), 'hh:mm a') : 'N/A'}
                        </p>
                      </td>
                      <td className="py-4 font-bold text-white">৳{payment.amount}</td>
                      <td className="py-4 text-slate-400 text-sm">{payment.reference}</td>
                      <td className="py-4 text-right">{getStatusBadge(payment.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
