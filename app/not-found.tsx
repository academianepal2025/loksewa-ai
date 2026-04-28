'use client';

import Link from 'next/link';
import { Home, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-8"
      >
        <div className="relative inline-block">
          <div className="h-24 w-24 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-6">
            <AlertCircle className="h-12 w-12" />
          </div>
          <div className="absolute -top-2 -right-2 bg-orange-600 text-background text-[10px] font-bold px-2 py-1 rounded-lg">
            404
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Intelligence Lost</h1>
          <p className="text-sm font-medium text-subtle leading-relaxed">
            The mission parameters you're looking for don't exist in our current database. 
            The coordinates might have been corrupted or moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button 
            onClick={() => window.history.back()}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-surface border border-border-subtle rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-background transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </button>
          <Link 
            href="/dashboard"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-orange-600 text-background rounded-xl text-[10px] font-bold uppercase tracking-wider hover:opacity-90 transition-all"
          >
            <Home className="h-4 w-4" /> Workspace
          </Link>
        </div>

        <div className="pt-12">
          <p className="text-[10px] font-bold text-subtle uppercase tracking-widest opacity-50">Loksewa AI System Diagnostic</p>
        </div>
      </motion.div>
    </div>
  );
}
