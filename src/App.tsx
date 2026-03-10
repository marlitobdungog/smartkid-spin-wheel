/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Settings, Maximize, RotateCcw, ArrowDown } from 'lucide-react';
import { motion, useAnimation } from 'motion/react';
import confetti from 'canvas-confetti';

interface Student {
  id: string;
  name: string;
  color: string;
}

const INITIAL_STUDENTS: Student[] = [
  { id: '1', name: 'Alice Smith', color: '#6366f1' },
  { id: '2', name: 'Ben Johnson', color: '#10b981' },
  { id: '3', name: 'Charlie Davis', color: '#f59e0b' },
  { id: '4', name: 'Daisy Miller', color: '#ef4444' },
  { id: '5', name: 'Ethan Hunt', color: '#3b82f6' },
  { id: '6', name: 'Fiona Gallagher', color: '#8b5cf6' },
  { id: '7', name: 'George Brown', color: '#ec4899' },
  { id: '8', name: 'Hannah Wilson', color: '#f97316' },
  { id: '9', name: 'Isaac Newton', color: '#22c55e' },
  { id: '10', name: 'Jade West', color: '#a855f7' },
  { id: '11', name: 'Kyle Reese', color: '#2563eb' },
  { id: '12', name: 'Luna Lovegood', color: '#14b8a6' },
];

export default function App() {
  const [students] = useState<Student[]>(INITIAL_STUDENTS);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentTurn, setCurrentTurn] = useState<string | null>(null);
  const [lastWinner, setLastWinner] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const controls = useAnimation();
  const wheelRef = useRef<HTMLDivElement>(null);

  const spin = async () => {
    if (isSpinning) return;

    setIsSpinning(true);
    const extraSpins = 5 + Math.random() * 5;
    const newRotation = rotation + extraSpins * 360 + Math.random() * 360;
    
    await controls.start({
      rotate: newRotation,
      transition: { duration: 4, ease: [0.15, 0, 0.15, 1] }
    });

    setRotation(newRotation);
    setIsSpinning(false);

    // Calculate winner
    const normalizedRotation = newRotation % 360;
    const sliceSize = 360 / students.length;
    // Since SVG is rotated -90, slice 0 starts at the top (12 o'clock)
    // As the wheel rotates clockwise, the arrow points to slices further back
    const winningIndex = Math.floor((360 - (normalizedRotation % 360)) % 360 / sliceSize);
    const winner = students[winningIndex];
    
    setCurrentTurn(winner.name);
    setLastWinner(winner.name);

    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: [winner.color, '#ffffff']
    });
  };

  const resetGame = () => {
    setCurrentTurn(null);
    setLastWinner(null);
    setRotation(0);
    controls.set({ rotate: 0 });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center justify-between bg-white border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Quiz Spinner</h1>
            <p className="text-sm text-slate-500 font-medium">Class 5-B • Science Review</p>
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-12">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
            <p className="text-xs uppercase tracking-widest font-bold text-amber-600 mb-1">Current Challenge</p>
            <p className="text-lg font-serif italic font-semibold text-amber-900">
              {currentTurn ? `It's ${currentTurn}'s turn! Answer the question.` : '"Press spin to select the next student and question!"'}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-1">Current Turn</p>
          <p className="text-2xl font-mono font-bold text-indigo-600">
            {currentTurn || '--'}
          </p>
        </div>
      </header>

      <main className="flex-1 flex p-8 gap-8 overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col flex-1">
            <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <h2 className="font-bold text-slate-700">Participating Students</h2>
              <span className="text-xs font-bold bg-slate-200 px-2 py-1 rounded-full text-slate-600">
                {students.length} Total
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {students.map((student) => (
                <div 
                  key={student.id} 
                  className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${currentTurn === student.name ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                    style={{ backgroundColor: student.color }}
                  >
                    {student.name.charAt(0)}
                  </div>
                  <span className={`text-sm font-medium ${currentTurn === student.name ? 'text-indigo-700 font-bold' : 'text-slate-600'}`}>
                    {student.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200">
            <p className="text-xs uppercase tracking-widest font-bold opacity-70 mb-2">Last Winner</p>
            <p className="text-2xl font-bold truncate">
              {lastWinner || '--'}
            </p>
          </div>
        </div>

        {/* Spinner Area */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <div className="relative w-[500px] h-[500px]">
            {/* Arrow Indicator */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 text-red-500 drop-shadow-md">
              <div className="bg-white rounded-full p-1 shadow-lg">
                <ArrowDown size={32} strokeWidth={3} />
              </div>
            </div>

            {/* The Wheel */}
            <motion.div 
              animate={controls}
              className="w-full h-full relative rounded-full shadow-[0_0_60px_rgba(0,0,0,0.1)] border-[12px] border-white"
              style={{ rotate: rotation }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {students.map((student, index) => {
                  const sliceAngle = 360 / students.length;
                  const halfAngle = sliceAngle / 2;
                  
                  // Calculate a single slice centered at 0 degrees
                  const x1 = 50 + 50 * Math.cos((Math.PI * -halfAngle) / 180);
                  const y1 = 50 + 50 * Math.sin((Math.PI * -halfAngle) / 180);
                  const x2 = 50 + 50 * Math.cos((Math.PI * halfAngle) / 180);
                  const y2 = 50 + 50 * Math.sin((Math.PI * halfAngle) / 180);
                  
                  const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                  return (
                    <g key={student.id} transform={`rotate(${index * sliceAngle}, 50, 50)`}>
                      <path d={pathData} fill={student.color} />
                      <text
                        x="92"
                        y="50"
                        fill="white"
                        fontSize="2.8"
                        fontWeight="bold"
                        textAnchor="end"
                        dominantBaseline="middle"
                        className="pointer-events-none"
                      >
                        {student.name}
                      </text>
                    </g>
                  );
                })}
                {/* Center Circle */}
                <circle cx="50" cy="50" r="4" fill="white" />
                <circle cx="50" cy="50" r="2" fill="#6366f1" />
              </svg>
            </motion.div>
          </div>

          <button
            onClick={spin}
            disabled={isSpinning}
            className={`mt-12 px-16 py-5 rounded-full text-xl font-black uppercase tracking-widest text-white shadow-2xl transition-all active:scale-95 ${
              isSpinning 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-300 shadow-indigo-200'
            }`}
          >
            {isSpinning ? 'Spinning...' : 'Spin Now!'}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 flex items-center justify-between text-slate-400 text-sm border-t border-slate-100 bg-white">
        <p>© 2026 Classroom Fun Interactive. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
            <Settings size={16} />
            <span>Settings</span>
          </button>
          <button className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
            <Maximize size={16} />
            <span>Full Screen</span>
          </button>
          <button 
            onClick={resetGame}
            className="flex items-center gap-2 hover:text-red-600 transition-colors"
          >
            <RotateCcw size={16} />
            <span>Reset Game</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
