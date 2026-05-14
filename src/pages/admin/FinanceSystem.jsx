import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Card, CardHeader } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { format } from 'date-fns';

import useAuthStore from '../../store/useAuthStore';
import { translations } from '../../utils/translations';

export default function FinanceSystem() {
  const { language } = useAuthStore();
  const t = translations[language];
  
  const [transactions, setTransactions] = useState([]);
  const [type, setType] = useState('income');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'transactions'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(docs);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setLoading(true);
    try {
      await addDoc(collection(db, 'transactions'), {
        type,
        amount: parseFloat(formData.get('amount')),
        category: formData.get('category'),
        date: formData.get('date'),
        description: formData.get('description'),
        createdAt: new Date().toISOString()
      });
      toast.success('Transaction added');
      e.target.reset();
    } catch (error) {
      toast.error('Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure?')) {
      await deleteDoc(doc(db, 'transactions', id));
      toast.success('Transaction deleted');
    }
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const chartData = [
    { name: 'Income', value: totalIncome },
    { name: 'Expense', value: totalExpense },
  ];

  const COLORS = ['#10B981', '#EF4444'];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-color)' }}>{t.financeTitle}</h1>
        <div className="bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/5 flex items-center gap-3">
          <Wallet className="text-primary w-5 h-5" />
          <span className="text-slate-500 text-sm font-medium">{t.balance}:</span>
          <span className={`text-xl font-black ${balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>৳{balance}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200 dark:border-green-500/10 shadow-lg shadow-black/5 dark:shadow-black/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{t.totalIncome}</p>
              <p className="text-3xl font-black text-green-600 dark:text-green-400 mt-2">৳{totalIncome}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400 border border-green-500/20">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="border-slate-200 dark:border-red-500/10 shadow-lg shadow-black/5 dark:shadow-black/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{t.totalExpenses}</p>
              <p className="text-3xl font-black text-red-600 dark:text-red-400 mt-2">৳{totalExpense}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400 border border-red-500/20">
              <ArrowDownRight className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="border-slate-200 dark:border-primary/10 shadow-lg shadow-black/5 dark:shadow-black/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{t.profitMargin}</p>
              <p className="text-3xl font-black mt-2" style={{ color: 'var(--text-color)' }}>{totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0}%</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Transaction */}
        <Card className="h-fit border-slate-200 dark:border-white/5 shadow-xl">
          <CardHeader title={t.addEntry} subtitle={t.logTransaction} />
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${type === 'income' ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'text-slate-500'}`}
              >
                {t.income}
              </button>
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${type === 'expense' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'text-slate-500'}`}
              >
                {t.expense}
              </button>
            </div>
            
            <Input name="amount" label={`${t.amount} (৳)`} type="number" required placeholder="1000" />
            <Input name="category" label={t.category} required placeholder="Registration, Referee, etc." />
            <Input name="date" label={t.date} type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
            <Input name="description" label={t.description} placeholder="Optional details" />
            
            <Button type="submit" className="w-full" loading={loading}>
              <Plus className="w-4 h-4" /> {t.saveTransaction}
            </Button>
          </form>
        </Card>

        {/* Charts */}
        <Card className="lg:col-span-2 border-slate-200 dark:border-white/5 shadow-xl">
          <CardHeader title={t.financialDistribution} subtitle={t.distributionSubtitle} />
          <div className="h-[320px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" className="dark:stroke-white/5" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--surface-color)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ color: 'var(--text-color)', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Transaction List */}
      <Card className="border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
        <CardHeader title={t.recentTransactions} subtitle={t.historySubtitle} />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.date}</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.category}</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.status}</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.amount}</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {transactions.map((item) => (
                <tr key={item.id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">
                    {item.date ? format(new Date(item.date), 'MMM dd, yyyy') : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-sm" style={{ color: 'var(--text-color)' }}>{item.category}</p>
                    <p className="text-[10px] font-medium text-slate-500 mt-0.5">{item.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${item.type === 'income' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black text-sm" style={{ color: 'var(--text-color)' }}>৳{item.amount}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center">
              <TrendingDown className="w-12 h-12 text-slate-200 dark:text-slate-800 mb-2" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{t.noTransactions}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
