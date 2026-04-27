import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { 
  CheckCircle2, 
  ArrowRight, 
  LayoutDashboard, 
  FileSearch,
  Calendar,
  Hash,
  Activity,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

export default function SubmissionSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const submissionData = location.state || {
    id: '#SUB-12345',
    serviceType: 'Deep Cleaning',
    date: 'Feb 12, 2026',
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        {/* Celebration Background Element */}
        <div className="relative mb-8 flex justify-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1 
            }}
            className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center relative z-10"
          >
            <CheckCircle2 className="w-14 h-14 text-emerald-500" />
          </motion.div>
          
          {/* Animated Sparkles */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Sparkles className="w-32 h-32 text-emerald-200 animate-pulse" />
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Submission Successful!</h1>
          <p className="text-slate-500 mb-10 px-4">
            Your inventory usage has been submitted for admin approval
          </p>

          <Card className="border-none shadow-[0_15px_40px_rgba(0,0,0,0.04)] bg-white rounded-3xl overflow-hidden mb-10">
            <CardContent className="p-8">
              <div className="space-y-6 text-left">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                      <Hash className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Submission ID</span>
                  </div>
                  <span className="text-slate-900 font-mono font-bold">{submissionData.id}</span>
                </div>

                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                      <Activity className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Service Type</span>
                  </div>
                  <span className="text-slate-900 font-bold">{submissionData.serviceType}</span>
                </div>

                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                      <Calendar className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Date</span>
                  </div>
                  <span className="text-slate-900 font-bold">{submissionData.date}</span>
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Status</span>
                  <Badge className="bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-50 px-3 py-1 font-bold rounded-lg flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Pending Approval
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Button 
              onClick={() => navigate('/staff')}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold h-14 rounded-2xl shadow-[0_10px_25px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 group transition-all"
            >
              <FileSearch className="w-5 h-5 group-hover:scale-110 transition-transform" />
              View Submission
            </Button>
            
            <Button 
              variant="ghost"
              onClick={() => navigate('/staff')}
              className="w-full text-slate-500 hover:text-slate-800 font-bold h-12 flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
