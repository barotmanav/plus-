import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AudienceScope, NoticePriority } from '../types';

interface CreateNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPriority?: NoticePriority;
}

export const CreateNoticeModal: React.FC<CreateNoticeModalProps> = ({
  isOpen,
  onClose,
  initialPriority = 'NORMAL',
}) => {
  const { currentUser, departments, classes, categories, createNotice } = useApp();

  if (!isOpen || !currentUser) return null;

  const isCR = currentUser.role === 'CR';
  const isStaff = currentUser.role === 'ADMIN' || currentUser.role === 'FACULTY';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[1]?.slug || 'academic');
  const [priority, setPriority] = useState<NoticePriority>(initialPriority);
  const [isPinned, setIsPinned] = useState(false);

  // Audience targeting: EVERYONE | DEPARTMENT | CLASS
  const [scope, setScope] = useState<AudienceScope>(isCR ? 'CLASS' : 'EVERYONE');
  const [selectedDeptId, setSelectedDeptId] = useState(currentUser.departmentId || departments[0]?.id || '');
  const [selectedClassId, setSelectedClassId] = useState(
    isCR ? currentUser.assignedClassId || '' : classes[0]?.id || ''
  );

  // Attachment
  const [attachmentName, setAttachmentName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const targetDept = departments.find((d) => d.id === selectedDeptId);
    const targetClass = classes.find(
      (c) => c.id === (isCR ? currentUser.assignedClassId : selectedClassId)
    );

    const finalPriority: NoticePriority = isCR && priority === 'EMERGENCY' ? 'NORMAL' : priority;

    createNotice({
      title: title.trim(),
      description: description.trim(),
      category,
      priority: finalPriority,
      isEmergency: finalPriority === 'EMERGENCY',
      isPinned,
      audience: {
        scope: isCR ? 'CLASS' : scope,
        departmentId: targetDept?.id,
        departmentName: targetDept?.name,
        classId: targetClass?.id,
        className: targetClass?.name,
      },
      authorId: currentUser.id,
      authorName: currentUser.name + (isCR ? ' (CR)' : ''),
      authorRole: currentUser.role,
      attachments: attachmentName.trim()
        ? [
            {
              id: 'att-' + Date.now(),
              fileName: attachmentName.trim(),
              fileType: 'pdf',
              fileSize: '450 KB',
            },
          ]
        : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {isCR ? 'Create Class Notice (Submitted for Approval)' : 'Create Official Campus Notice'}
            </h3>
            <p className="text-[11px] text-slate-500">
              {isCR
                ? `Posting as Class Representative for ${currentUser.assignedClassName || 'Class IT-A'}`
                : 'Notices are delivered immediately to targeted students via Web & Mobile Push'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* CR Workflow Notice Banner */}
          {isCR && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold">CR Approval Workflow: </span>
                Your notice will be submitted to Faculty/Admin for review. Once approved, it will be published to your class students.
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Unit Test Notice: Data Structures"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                {categories.filter((c) => c.isActive).map((cat) => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as NoticePriority)}
                className={`w-full px-3 py-1.5 text-xs border rounded-lg bg-white font-medium ${
                  priority === 'EMERGENCY' ? 'border-red-500 text-red-700' : 'border-slate-200 text-slate-700'
                }`}
              >
                <option value="NORMAL">Normal</option>
                <option value="IMPORTANT">Important</option>
                {isStaff && <option value="EMERGENCY">🚨 Emergency Alert</option>}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Content *</label>
            <textarea
              required
              rows={4}
              placeholder="Write the full notice instructions, date, venue, and details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Audience Targeting (Everyone | Department | Class) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="block text-xs font-bold text-slate-800">Target Audience</span>

            {isCR ? (
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs">
                <span className="text-slate-500">Locked to Assigned Class: </span>
                <span className="font-bold text-blue-700">{currentUser.assignedClassName || 'IT-A'}</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  {(['EVERYONE', 'DEPARTMENT', 'CLASS'] as AudienceScope[]).map((sc) => (
                    <button
                      key={sc}
                      type="button"
                      onClick={() => setScope(sc)}
                      className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-colors ${
                        scope === sc
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {sc === 'EVERYONE' ? 'Everyone' : sc === 'DEPARTMENT' ? 'Department' : 'Class'}
                    </button>
                  ))}
                </div>

                {scope === 'DEPARTMENT' && (
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Select Department</label>
                    <select
                      value={selectedDeptId}
                      onChange={(e) => setSelectedDeptId(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                      ))}
                    </select>
                  </div>
                )}

                {scope === 'CLASS' && (
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Select Class</label>
                    <select
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.departmentName})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Optional Attachment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Attachment (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Syllabus_Unit_Test.pdf"
              value={attachmentName}
              onChange={(e) => setAttachmentName(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
            />
          </div>

          {/* Pinned Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pinNoticeCheck"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <label htmlFor="pinNoticeCheck" className="text-xs text-slate-700 font-medium cursor-pointer">
              Pin notice to top
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-xs ${
                priority === 'EMERGENCY'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {priority === 'EMERGENCY' ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Send Emergency Alert</span>
                </>
              ) : isCR ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Submit for Approval</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Publish Notice</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
