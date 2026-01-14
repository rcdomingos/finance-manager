// import React, { useState } from 'react';
// import { Card, Button, Input } from '../../../components/UI';
// import { authService } from '../../../services/authService';
// import { LogIn, UserPlus, Wallet } from 'lucide-react';

// interface AuthPageProps {
//   onAuthSuccess: () => void;
// }

// export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
//   const [isLogin, setIsLogin] = useState(true);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [name, setName] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       if (isLogin) {
//         await authService.login(email, password);
//       } else {
//         await authService.signUp(name, email, password);
//         await authService.login(email, password);
//       }
//       onAuthSuccess();
//     } catch (err: any) {
//       setError(err.message || 'Authentication failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
//       <div className="w-full max-w-md space-y-8">
//         <div className="text-center">
//           <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white mb-4 shadow-lg shadow-blue-200">
//             <Wallet size={32} />
//           </div>
//           <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Expensify</h1>
//           <p className="text-slate-500 mt-2">Personal Expense Manager</p>
//         </div>

//         <Card className="p-8">
//           <div className="flex bg-slate-100 p-1 rounded-lg mb-8">
//             <button
//               onClick={() => setIsLogin(true)}
//               className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
//                 isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
//               }`}
//             >
//               <LogIn size={18} /> Login
//             </button>
//             <button
//               onClick={() => setIsLogin(false)}
//               className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
//                 !isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
//               }`}
//             >
//               <UserPlus size={18} /> Sign Up
//             </button>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             {!isLogin && (
//               <Input
//                 label="Full Name"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 placeholder="John Doe"
//                 required
//               />
//             )}
//             <Input
//               label="Email Address"
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="john@example.com"
//               required
//             />
//             <Input
//               label="Password"
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="••••••••"
//               required
//             />

//             {error && (
//               <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-lg border border-rose-100">
//                 {error}
//               </div>
//             )}

//             <Button type="submit" className="w-full py-3" disabled={loading}>
//               {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
//             </Button>
//           </form>
//         </Card>

//         <p className="text-center text-xs text-slate-400">
//           Securely managed and isolated data.
//         </p>
//       </div>
//     </div>
//   );
// };
