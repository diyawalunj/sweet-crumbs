/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  PlusCircle, 
  MinusCircle, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Trash2, 
  Cake, 
  Cookie, 
  Coffee, 
  Utensils,
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
  PieChart as PieChartIcon,
  Sparkles,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
} from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Transaction, TransactionType, CATEGORIES } from './types';

const PASTRIES = [
  {
    name: "Classic Butter Croissant",
    image: "https://epiceriecorner.co.uk/cdn/shop/articles/croissant_2048x2048.webp?v=1768317074",
    desc: "Flaky, buttery layers of perfection."
  },
  {
    name: "Rainbow Macarons",
    image: "https://www.cadburydessertscorner.com/hubfs/dc-website-2022/web-stories/chocolate-dipped-rainbow-macarons-a-crisp-chewy-treat-with-a-splash-of-color/chocolate-dipped-rainbow-macarons-a-crisp-chewy-treat-with-a-splash-of-color-feature.webp",
    desc: "Delicate almond shells with creamy ganache."
  },
  {
    name: "Chocolate Éclair",
    image: "https://www.wisdomlib.org/uploads/recipes/1024x768_crop/chocolate-eclair-dessert-539.jpg",
    desc: "Choux pastry filled with rich chocolate cream."
  },
  {
    name: "Fresh Fruit Tart",
    image: "https://hips.hearstapps.com/hmg-prod/images/fruit-tart-recipe-3-1650464619.jpg?crop=0.8888888888888888xw:1xh;center,top&resize=1200:*",
    desc: "Seasonal fruits on a crisp pastry base."
  },
  {
    name: "Savory Pasteries",
    image: "https://www.thespruceeats.com/thmb/xsDWj5mP57U9zx1laXcBWeScPL8=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/SES-puff-pastry-and-mushroom-ricotta-tarts-recipe-7557041-hero-A-4db204654e0a4b2daf33810f4f78b8c1.jpg",
    desc: "Golden flaky pastry."
  }
];

const Sprinkle = ({ color, style }: { color: string, style: React.CSSProperties, key?: React.Key }) => (
  <div 
    className="sprinkle" 
    style={{ 
      backgroundColor: color, 
      ...style,
      transform: `rotate(${Math.random() * 360}deg)`
    }} 
  />
);

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('sweet_crumbs_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [showForm, setShowForm] = useState(false);
  const [filterMonth, setFilterMonth] = useState(new Date());
  const [currentPastryIdx, setCurrentPastryIdx] = useState(0);

  // Form State
  const [type, setType] = useState<TransactionType>('income');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES.income[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  useEffect(() => {
    localStorage.setItem('sweet_crumbs_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPastryIdx((prev) => (prev + 1) % PASTRIES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const filteredTransactions = useMemo(() => {
    const start = startOfMonth(filterMonth);
    const end = endOfMonth(filterMonth);
    return transactions.filter(t => 
      isWithinInterval(parseISO(t.date), { start, end })
    ).sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, filterMonth]);

  const stats = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    return {
      income,
      expenses,
      balance: income - expenses
    };
  }, [filteredTransactions]);

  const chartData = useMemo(() => {
    const data: Record<string, number> = {};
    filteredTransactions.forEach(t => {
      data[t.category] = (data[t.category] || 0) + t.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);

  const COLORS = ['#FFD1DC', '#B2E2F2', '#C1E1C1', '#FDFD96', '#E0BBE4', '#FFDAB9', '#FFB7CE'];

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      type,
      amount: Number(amount),
      category,
      description,
      date
    };

    setTransactions([newTransaction, ...transactions]);
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setCategory(type === 'income' ? CATEGORIES.income[0] : CATEGORIES.expense[0]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(filterMonth);
    newDate.setMonth(newDate.getMonth() + offset);
    setFilterMonth(newDate);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto font-sans relative overflow-hidden">
      {/* Sprinkles Background Decoration */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
        {[...Array(20)].map((_, i) => (
          <Sprinkle 
            key={i} 
            color={COLORS[i % COLORS.length]} 
            style={{ 
              top: `${Math.random() * 100}%`, 
              left: `${Math.random() * 100}%` 
            }} 
          />
        ))}
      </div>

      {/* Header */}
      <header className="text-center mb-12 relative z-10">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-block"
        >
          <div className="flex items-center justify-center gap-4 mb-2">
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <Cake size={48} className="text-pink-400" />
            </motion.div>
            <h1 className="font-display text-6xl md:text-8xl text-pink-500 drop-shadow-[4px_4px_0px_#4A4A4A]">
              Sweet Crumbs
            </h1>
            <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}>
              <Cookie size={48} className="text-orange-400" />
            </motion.div>
          </div>
          <p className="text-purple-500 font-bold text-xl tracking-widest uppercase flex items-center justify-center gap-2">
            <Sparkles size={20} />
            Artisanal Pastry Ledger
            <Sparkles size={20} />
          </p>
        </motion.div>
      </header>

      {/* Pastry Slideshow */}
      <section className="mb-12 relative z-10">
        <div className="bg-white rounded-[2rem] funky-border overflow-hidden relative h-64 md:h-80 group">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={currentPastryIdx}
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ 
                x: { type: "spring", stiffness: 200, damping: 25 },
                opacity: { duration: 0.4 }
              }}
              className="absolute inset-0"
            >
              <motion.div 
                className="w-full h-full overflow-hidden"
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 6, ease: "easeOut" }}
              >
                <img 
                  src={PASTRIES[currentPastryIdx].image} 
                  alt={PASTRIES[currentPastryIdx].name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-10 text-white">
                <motion.h3 
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="font-display text-4xl md:text-5xl mb-2 drop-shadow-md"
                >
                  {PASTRIES[currentPastryIdx].name}
                </motion.h3>
                <motion.p 
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="text-pink-200 font-bold text-lg italic drop-shadow-sm"
                >
                  {PASTRIES[currentPastryIdx].desc}
                </motion.p>
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Slideshow Controls */}
          <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => setCurrentPastryIdx((prev) => (prev - 1 + PASTRIES.length) % PASTRIES.length)}
              className="bg-white/80 p-2 rounded-full funky-border hover:bg-white transition-colors"
            >
              <ChevronLeft />
            </button>
            <button 
              onClick={() => setCurrentPastryIdx((prev) => (prev + 1) % PASTRIES.length)}
              className="bg-white/80 p-2 rounded-full funky-border hover:bg-white transition-colors"
            >
              <ChevronRight />
            </button>
          </div>

          {/* Indicators */}
          <div className="absolute top-6 right-8 flex gap-2">
            {PASTRIES.map((_, i) => (
              <div 
                key={i} 
                className={`w-3 h-3 rounded-full border-2 border-white transition-all ${i === currentPastryIdx ? 'bg-pink-400 scale-125' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Month Selector */}
      <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-3xl funky-border relative z-10">
        <button 
          onClick={() => changeMonth(-1)}
          className="p-3 bg-pastel-pink rounded-2xl funky-border funky-button"
        >
          <ChevronLeft />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-display text-gray-700 flex items-center justify-center gap-3">
            <CalendarIcon size={24} className="text-pink-400" />
            {format(filterMonth, 'MMMM yyyy')}
          </h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Reviewing your bake-off</p>
        </div>
        <button 
          onClick={() => changeMonth(1)}
          className="p-3 bg-pastel-pink rounded-2xl funky-border funky-button"
        >
          <ChevronRight />
        </button>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 relative z-10">
        {[
          { label: 'Income', val: stats.income, color: 'bg-pastel-green', icon: TrendingUp, text: 'text-green-700' },
          { label: 'Expenses', val: stats.expenses, color: 'bg-pastel-pink', icon: TrendingDown, text: 'text-pink-700' },
          { label: 'Balance', val: stats.balance, color: 'bg-pastel-blue', icon: Wallet, text: 'text-blue-700' }
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
            className={`${stat.color} p-8 rounded-[2rem] funky-border flex flex-col items-center justify-center text-center relative overflow-hidden`}
          >
            <div className="bg-white/50 p-4 rounded-2xl mb-4 funky-border">
              <stat.icon size={32} className={stat.text} />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest opacity-60 mb-1">{stat.label}</span>
            <span className={`text-4xl font-display ${stat.text}`}>₹{stat.val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            
            {/* Subtle background icon */}
            <stat.icon size={120} className={`absolute -bottom-8 -right-8 opacity-5 ${stat.text}`} />
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 relative z-10">
        {/* Transactions List */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-3xl font-display text-purple-600 flex items-center gap-3">
              <Utensils className="text-pink-400" />
              Recent Crumbs
            </h3>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-pastel-yellow px-6 py-3 rounded-2xl funky-border font-display text-lg flex items-center gap-2 funky-button"
            >
              <PlusCircle size={20} />
              Add New
            </button>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {filteredTransactions.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20 bg-white/50 rounded-3xl border-4 border-dashed border-pink-100 text-gray-400 flex flex-col items-center gap-4"
                >
                  <div className="bg-white p-4 rounded-full funky-border">
                    <Heart size={40} className="text-pink-200" />
                  </div>
                  <p className="font-bold text-lg italic">No crumbs found this month! Time to bake?</p>
                </motion.div>
              ) : (
                filteredTransactions.map((t) => (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`p-5 rounded-2xl funky-border bg-white flex items-center justify-between group hover:border-pink-300 transition-colors`}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`p-3 rounded-2xl funky-border ${t.type === 'income' ? 'bg-pastel-green' : 'bg-pastel-pink'}`}>
                        {t.type === 'income' ? <TrendingUp size={24} className="text-green-700" /> : <TrendingDown size={24} className="text-pink-700" />}
                      </div>
                      <div>
                        <p className="font-bold text-xl text-gray-800">{t.description || t.category}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-3 py-0.5 bg-pastel-purple/30 rounded-full text-xs font-bold text-purple-600 uppercase tracking-tighter">
                            {t.category}
                          </span>
                          <span className="text-xs text-gray-400 font-medium">
                            {format(parseISO(t.date), 'MMMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className={`font-display text-2xl ${t.type === 'income' ? 'text-green-600' : 'text-pink-600'}`}>
                        {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <button 
                        onClick={() => deleteTransaction(t.id)}
                        className="text-gray-200 hover:text-red-400 transition-colors p-2 hover:bg-red-50 rounded-xl"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Charts & Insights */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] funky-border h-[400px] flex flex-col">
            <h3 className="text-2xl font-display text-blue-600 mb-6 flex items-center gap-3">
              <PieChartIcon size={24} />
              Flavor Mix
            </h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="#4A4A4A"
                    strokeWidth={3}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '20px', 
                      border: '3px solid #4A4A4A',
                      fontFamily: 'Fredoka',
                      fontWeight: 'bold',
                      boxShadow: '4px 4px 0px #4A4A4A'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {chartData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {d.name}
                </div>
              ))}
            </div>
          </div>

          <motion.div 
            animate={{ rotate: [0, 1, -1, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="bg-pastel-purple p-8 rounded-[2rem] funky-border relative overflow-hidden"
          >
            <h3 className="text-2xl font-display text-purple-700 mb-3 flex items-center gap-2">
              Baker's Wisdom 🧁
            </h3>
            <p className="text-lg italic text-purple-900 leading-relaxed relative z-10">
              "A balanced budget is like a balanced dough—too much of one thing and it all falls flat. Keep kneading those numbers!"
            </p>
            <Sparkles className="absolute -bottom-4 -right-4 text-white opacity-30" size={100} />
          </motion.div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-pink-100/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotate: 5 }}
              className="bg-white w-full max-w-lg rounded-[3rem] funky-border p-10 relative"
            >
              <button 
                onClick={() => setShowForm(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-pink-500 transition-colors"
              >
                <MinusCircle size={32} />
              </button>

              <div className="text-center mb-8">
                <h2 className="font-display text-5xl text-pink-500 mb-2">New Crumb</h2>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Recording a sweet transaction</p>
              </div>

              <form onSubmit={handleAddTransaction} className="space-y-6">
                <div className="flex bg-gray-100 p-2 rounded-2xl funky-border">
                  <button
                    type="button"
                    onClick={() => {
                      setType('income');
                      setCategory(CATEGORIES.income[0]);
                    }}
                    className={`flex-1 py-3 rounded-xl font-display text-lg transition-all ${type === 'income' ? 'bg-pastel-green funky-border' : 'text-gray-400'}`}
                  >
                    Income
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setType('expense');
                      setCategory(CATEGORIES.expense[0]);
                    }}
                    className={`flex-1 py-3 rounded-xl font-display text-lg transition-all ${type === 'expense' ? 'bg-pastel-pink funky-border' : 'text-gray-400'}`}
                  >
                    Expense
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full p-4 rounded-2xl border-3 border-gray-100 focus:border-pink-300 outline-none transition-all font-display text-2xl text-pink-600"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1">
                      <Sparkles size={12} className="text-pink-300" />
                      Category
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                        className="w-full p-4 rounded-2xl border-3 border-gray-100 focus:border-pink-300 outline-none transition-all font-bold text-gray-700 bg-white flex items-center justify-between hover:bg-pink-50/30 text-left"
                      >
                        <span>{category}</span>
                        <ChevronRight size={20} className={`text-pink-300 transition-transform duration-300 ${showCategoryDropdown ? 'rotate-90' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                        {showCategoryDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 5, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute top-full left-0 right-0 z-50 bg-white rounded-2xl funky-border shadow-xl overflow-hidden"
                          >
                            <div className="max-h-48 overflow-y-auto custom-scrollbar">
                              {(type === 'income' ? CATEGORIES.income : CATEGORIES.expense).map((cat) => (
                                <button
                                  key={cat}
                                  type="button"
                                  onClick={() => {
                                    setCategory(cat);
                                    setShowCategoryDropdown(false);
                                  }}
                                  className={`w-full p-3 text-left font-bold text-sm transition-colors hover:bg-pink-50 ${
                                    category === cat ? 'text-pink-500 bg-pink-50/50' : 'text-gray-600'
                                  }`}
                                >
                                  {cat}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1">
                    <Heart size={12} className="text-pink-300" />
                    {type === 'income' ? 'Where did this sugar come from?' : 'What did we spend our dough on?'}
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-4 rounded-2xl border-3 border-gray-100 focus:border-pink-300 outline-none transition-all font-medium bg-white hover:bg-pink-50/30 pl-12"
                      placeholder={type === 'income' ? "e.g. Custom Wedding Cake" : "e.g. Flour delivery"}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-200 group-focus-within:text-pink-400 transition-colors">
                      {type === 'income' ? <PlusCircle size={20} /> : <MinusCircle size={20} />}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1">
                    <CalendarIcon size={12} className="text-pink-300" />
                    Bake Date
                  </label>
                  <div className="relative group/date">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full p-4 rounded-2xl border-3 border-gray-100 focus:border-pink-300 outline-none transition-all font-bold text-gray-600 bg-white cursor-pointer hover:bg-pink-50/30 pl-12 relative z-10"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300 group-hover/date:text-pink-500 transition-colors z-20 pointer-events-none">
                      <CalendarIcon size={20} />
                    </div>
                    {/* Decorative background for date */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
                      <Cake size={40} />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full py-5 rounded-[2rem] funky-border font-display text-2xl text-gray-700 funky-button mt-4 flex items-center justify-center gap-3 transition-all ${
                    type === 'income' ? 'bg-pastel-green hover:bg-green-200' : 'bg-pastel-pink hover:bg-pink-200'
                  }`}
                >
                  <Sparkles />
                  {type === 'income' ? 'Sweeten the Pot! 🍯' : 'Spend the Dough! 💸'}
                  <Sparkles />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="mt-20 pb-10 text-center relative z-10">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="h-px w-12 bg-pink-200" />
          <Heart className="text-pink-300 animate-pulse" />
          <div className="h-px w-12 bg-pink-200" />
        </div>
        <p className="font-bold text-gray-400 uppercase tracking-[0.3em] text-[10px] mb-2">
          Sweet Crumbs Bakery, Artisanal Pastry Heaven • Est. 2026
        </p>
        <p className="text-pink-400 font-display text-sm italic tracking-wider">
          Whisked to life with <Heart size={12} className="inline mx-1 mb-1" /> and code by Diya Walunj
        </p>
      </footer>
    </div>
  );
}
