import { collection, addDoc, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';

const DUMMY_JERSEYS = [
  { name: 'Midnight Thunder', description: 'Deep blue with electric cyan accents.', imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800', voteCount: 15 },
  { name: 'Neon Striker', description: 'Vibrant purple with neon green patterns.', imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef03a94e78?auto=format&fit=crop&q=80&w=800', voteCount: 12 },
  { name: 'Crimson Fury', description: 'Matte black with blood red gradients.', imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800', voteCount: 8 },
];

const DUMMY_MATCHES = [
  { teamA: 'Warriors FC', teamB: 'Lightning United', date: '2026-05-12', time: '20:00', scoreA: 2, scoreB: 1, status: 'completed' },
  { teamA: 'Neon Ninjas', teamB: 'Shadow Strikers', date: '2026-05-13', time: '21:00', scoreA: 0, scoreB: 0, status: 'scheduled' },
  { teamA: 'Titans XI', teamB: 'Galaxy Stars', date: '2026-05-14', time: '19:30', scoreA: 3, scoreB: 2, status: 'completed' },
];

export const seedDatabase = async () => {
  try {
    const batch = writeBatch(db);

    // 1. Seed Jerseys
    for (const jersey of DUMMY_JERSEYS) {
      const ref = doc(collection(db, 'jerseys'));
      batch.set(ref, jersey);
    }

    // 2. Seed Matches
    for (const match of DUMMY_MATCHES) {
      const ref = doc(collection(db, 'matches'));
      batch.set(ref, match);
    }

    // 3. Seed some dummy transactions
    const transactions = [
      { type: 'income', amount: 5000, category: 'Registration', date: '2026-05-01', description: 'Early bird registration', createdAt: new Date().toISOString() },
      { type: 'expense', amount: 1200, category: 'Equipment', date: '2026-05-05', description: 'New footballs', createdAt: new Date().toISOString() },
    ];
    for (const t of transactions) {
      const ref = doc(collection(db, 'transactions'));
      batch.set(ref, t);
    }

    await batch.commit();
    console.log('Database seeded successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
};
