import React, { useState } from 'react';
import { X, GraduationCap, Send, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CRApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CRApplicationModal: React.FC<CRApplicationModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, applyForCR } = useApp();
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyForCR(reason.trim() || 'Desires to represent and coordinate class announcements.');
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Apply for Class Representative</h3>
              <p className="text-[11px] text-slate-500">Student leadership application</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="text-base font-bold text-slate-900">Application Submitted!</h4>
            <p className="text-xs text-slate-500">
              Your application has been routed to Faculty/Admin. Once approved, your CR dashboard will activate.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Applicant details */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Student:</span>
                <span className="font-bold text-slate-900">{currentUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="font-semibold text-slate-800">{currentUser.departmentName || 'Information Technology'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Class Section:</span>
                <span className="font-bold text-blue-600">{currentUser.className || 'IT-A'} (Sem {currentUser.semester || 3})</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason / Application Statement (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="State why you would like to represent your class and help with faculty notice coordination..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit to Faculty</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
