// import bcrypt from 'bcryptjs';
// import { DatabaseService } from './db';
// import { User, TransactionType, Classification } from '../types';

// const SESSION_KEY = 'pem_session';

// export const authService = {
//   signUp: async (name: string, email: string, password: string): Promise<User> => {
//     const existing = DatabaseService.findUserByEmail(email);
//     if (existing) throw new Error('User already exists');

//     const salt = await bcrypt.genSalt(10);
//     const passwordHash = await bcrypt.compare(password, salt) ? password : await bcrypt.hash(password, salt);

//     const newUser: User = {
//       id: crypto.randomUUID(),
//       name,
//       email,
//       passwordHash,
//     };

//     DatabaseService.insert('users', newUser);

//     // Seed default classifications
//     const defaultClassifications = [
//       { name: 'Housing' },
//       { name: 'Income Sources' },
//       { name: 'Personal Care' },
//       { name: 'Transportation' },
//       { name: 'Food & Dining' }
//     ];

//     const seededClassifications: Record<string, string> = {};

//     defaultClassifications.forEach(c => {
//       const id = crypto.randomUUID();
//       DatabaseService.insert('classifications', {
//         id,
//         userId: newUser.id,
//         name: c.name
//       });
//       seededClassifications[c.name] = id;
//     });

//     // Seed default categories for new user
//     const defaultCategories = [
//       { name: 'Salary', type: TransactionType.INCOME, class: 'Income Sources' },
//       { name: 'Bonus', type: TransactionType.INCOME, class: 'Income Sources' },
//       { name: 'Rent', type: TransactionType.EXPENSE, class: 'Housing' },
//       { name: 'Water', type: TransactionType.EXPENSE, class: 'Housing' },
//       { name: 'Fuel', type: TransactionType.EXPENSE, class: 'Transportation' },
//       { name: 'Restaurant', type: TransactionType.EXPENSE, class: 'Food & Dining' },
//     ];

//     defaultCategories.forEach(cat => {
//       DatabaseService.insert('categories', {
//         id: crypto.randomUUID(),
//         userId: newUser.id,
//         name: cat.name,
//         type: cat.type,
//         classificationId: seededClassifications[cat.class]
//       });
//     });

//     return newUser;
//   },

//   login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
//     const user = DatabaseService.findUserByEmail(email);
//     if (!user) throw new Error('User not found');

//     const isValid = await bcrypt.compare(password, user.passwordHash);
//     if (!isValid) throw new Error('Invalid password');

//     const token = btoa(JSON.stringify({ id: user.id, exp: Date.now() + 86400000 })); // Simple mock JWT
//     localStorage.setItem(SESSION_KEY, token);

//     return { user, token };
//   },

//   logout: () => {
//     localStorage.removeItem(SESSION_KEY);
//   },

//   getCurrentUser: (): User | null => {
//     const token = localStorage.getItem(SESSION_KEY);
//     if (!token) return null;
//     try {
//       const payload = JSON.parse(atob(token));
//       if (payload.exp < Date.now()) {
//         localStorage.removeItem(SESSION_KEY);
//         return null;
//       }
//       const users = DatabaseService.getAll('users');
//       return users.find(u => u.id === payload.id) || null;
//     } catch {
//       return null;
//     }
//   }
// };
