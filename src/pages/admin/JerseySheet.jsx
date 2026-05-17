import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  deleteDoc,
  updateDoc 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { 
  Search, 
  Trash2, 
  FileDown,
  Printer,
  Save,
  User,
  Phone,
  Hash,
  Activity,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { toast } from 'react-hot-toast';
import AddPlayerModal from './AddPlayerModal';

import useAuthStore from '../../store/useAuthStore';
import { translations } from '../../utils/translations';

const MySwal = withReactContent(Swal);

export default function JerseySheet() {
  const { profile, language } = useAuthStore();
  const t = translations[language];
  const isAdmin = profile?.role === 'admin';
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'jersey_orders'), orderBy('fullName', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter(u => 
    (u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.jerseyNumber?.toString().includes(searchTerm))
  );

  const handleEdit = (user) => {
    setEditingId(user.id);
    setEditValues({
      fullName: user.fullName || '',
      jerseySize: user.jerseySize || '',
      jerseyNumber: user.jerseyNumber || '',
      paidAmount: user.paidAmount || 0
    });
  };

  const handleSave = async (id) => {
    try {
      const userRef = doc(db, 'jersey_orders', id);
      await updateDoc(userRef, {
        ...editValues,
        jerseyNumber: parseInt(editValues.jerseyNumber) || 0,
        paidAmount: parseFloat(editValues.paidAmount) || 0
      });
      setEditingId(null);
      toast.success('Player data updated');
    } catch (error) {
      toast.error('Failed to update data');
    }
  };

  const handleDelete = async (id, name) => {
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: `You are removing ${name} from the system entirely.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Yes, delete!',
      background: 'var(--surface-color)',
      color: 'var(--text-color)'
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, 'jersey_orders', id));
        toast.success('Record deleted');
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const exportToExcel = () => {
    import('xlsx').then(XLSX => {
      const headers = ['Name', 'Jersey Size', 'Number', 'Paid Amount'];
      const rows = filteredUsers.map(u => [
        u.fullName || '',
        u.jerseySize || 'N/A',
        u.jerseyNumber || 'N/A',
        u.paidAmount || 0
      ]);

      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Jersey Order');
      
      XLSX.writeFile(workbook, `Jersey_Order_Sheet_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
    }).catch(err => {
      console.error('Failed to load xlsx package', err);
      toast.error('Failed to export to Excel');
    });
  };

  const printSheet = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header section - hidden on print */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3" style={{ color: 'var(--text-color)' }}>
            <Activity className="text-primary w-8 h-8" />
            {t.jerseySheetTitle}
          </h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">{t.excelManagement}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={printSheet} className="gap-2 border-slate-200 dark:border-white/5 bg-white dark:bg-white/5">
            <Printer className="w-4 h-4" />
            {t.printSheet}
          </Button>
          <Button variant="outline" onClick={exportToExcel} className="gap-2 border-slate-200 dark:border-white/5 bg-white dark:bg-white/5">
            <FileDown className="w-4 h-4" />
            {t.exportExcel}
          </Button>
          {isAdmin && (
            <Button variant="primary" onClick={() => setIsAddModalOpen(true)} className="gap-2 shadow-lg shadow-primary/30">
              <User size={16} />
              Add Order
            </Button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="p-0 overflow-hidden border-slate-200 dark:border-white/5 shadow-2xl shadow-black/10">
        <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] flex items-center gap-4 print:hidden">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder} 
              className="premium-input pl-10 w-full text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
            {filteredUsers.length} {t.recordsFound}
          </div>
        </div>

        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-200 dark:border-white/10">
                <th className="px-4 py-5 border-r border-slate-200 dark:border-white/5"><div className="flex items-center gap-2 text-xs"><User size={14}/> {t.fullName}</div></th>
                <th className="px-4 py-5 border-r border-slate-200 dark:border-white/5 w-28 text-center"><div className="flex items-center justify-center gap-2 text-xs"><Activity size={14}/> {t.jerseySize}</div></th>
                <th className="px-4 py-5 border-r border-slate-200 dark:border-white/5 w-28 text-center"><div className="flex items-center justify-center gap-2 text-xs"><Hash size={14}/> {t.jerseyNumber}</div></th>
                <th className="px-4 py-5 border-r border-slate-200 dark:border-white/5 w-40"><div className="flex items-center gap-2 text-xs"><CreditCard size={14}/> {t.amount}</div></th>
                <th className="px-4 py-5 text-right print:hidden text-xs">{t.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              <AnimatePresence mode="popLayout">
                {filteredUsers.map((user) => (
                  <motion.tr 
                    key={user.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`group transition-colors ${editingId === user.id ? 'bg-primary/5' : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]'}`}
                  >
                    <td className="px-4 py-4 border-r border-slate-200 dark:border-white/5">
                      {editingId === user.id ? (
                        <input 
                          className="w-full bg-transparent border-none focus:ring-0 font-black text-base p-0"
                          value={editValues.fullName}
                          onChange={(e) => setEditValues({...editValues, fullName: e.target.value})}
                        />
                      ) : (
                        <span className="font-black text-base block" style={{ color: 'var(--text-color)' }}>{user.fullName}</span>
                      )}
                    </td>
                    <td className="px-4 py-4 border-r border-slate-200 dark:border-white/5 text-center">
                      {editingId === user.id ? (
                        <select 
                          className="w-full bg-transparent border-none focus:ring-0 font-black text-base p-0 text-center uppercase"
                          value={editValues.jerseySize}
                          onChange={(e) => setEditValues({...editValues, jerseySize: e.target.value})}
                        >
                          <option value="">-</option>
                          <option value="S">S</option>
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                          <option value="XXL">XXL</option>
                        </select>
                      ) : (
                        <span className="text-sm font-black bg-slate-100 dark:bg-white/10 px-3 py-1.5 rounded uppercase tracking-widest">{user.jerseySize || '-'}</span>
                      )}
                    </td>
                    <td className="px-4 py-4 border-r border-slate-200 dark:border-white/5 text-center">
                      {editingId === user.id && isAdmin ? (
                        <input 
                          type="number"
                          className="w-full bg-transparent border-none focus:ring-0 font-black text-base p-0 text-center"
                          value={editValues.jerseyNumber}
                          onChange={(e) => setEditValues({...editValues, jerseyNumber: e.target.value})}
                        />
                      ) : (
                        <span className="font-black italic text-primary text-lg">{user.jerseyNumber || '00'}</span>
                      )}
                    </td>
                    <td className="px-4 py-4 border-r border-slate-200 dark:border-white/5">
                      {editingId === user.id && isAdmin ? (
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-black text-slate-400">৳</span>
                          <input 
                            type="number"
                            className="w-full bg-transparent border-none focus:ring-0 font-black text-base p-0"
                            value={editValues.paidAmount}
                            onChange={(e) => setEditValues({...editValues, paidAmount: e.target.value})}
                          />
                        </div>
                      ) : (
                        <span className="font-black text-base" style={{ color: 'var(--text-color)' }}>৳{user.paidAmount || 0}</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right print:hidden">
                      {isAdmin && (
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {editingId === user.id ? (
                            <button 
                              onClick={() => handleSave(user.id)}
                              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
                              title="Save Changes"
                            >
                              <Save size={14} />
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleEdit(user)}
                              className="p-2 bg-slate-100 dark:bg-white/10 rounded-lg hover:bg-primary hover:text-white transition-all"
                              title="Edit Record"
                            >
                              <Activity size={14} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(user.id, user.fullName)}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                            title="Delete Player"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && !loading && (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-4 shadow-inner">
              <Activity className="w-10 h-10 text-slate-300 dark:text-slate-800" />
            </div>
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">{t.noTransactions}</p>
          </div>
        )}
      </Card>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .premium-layout-content {
            padding: 0 !important;
          }
          table {
            width: 100% !important;
            border: 1px solid #e2e8f0 !important;
          }
          th, td {
            border: 1px solid #e2e8f0 !important;
            color: black !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>

      {/* Add Order Modal */}
      <AddPlayerModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}
