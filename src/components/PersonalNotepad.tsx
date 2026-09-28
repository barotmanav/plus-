import React, { useState } from 'react';
import { Plus, Pin, Trash2, Edit3, Lock, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PersonalNote } from '../types';

export const PersonalNotepad: React.FC = () => {
  const { currentUser, personalNotes, addNote, editNote, deleteNote, togglePinNote } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitleText, setEditTitleText] = useState('');
  const [editContentText, setEditContentText] = useState('');

  if (!currentUser) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addNote(newTitle.trim(), newContent.trim());
    setNewTitle('');
    setNewContent('');
    setIsAdding(false);
  };

  const handleStartEdit = (note: PersonalNote) => {
    setEditingId(note.id);
    setEditTitleText(note.title);
    setEditContentText(note.content);
  };

  const handleSaveEdit = (id: string) => {
    editNote(id, editTitleText.trim(), editContentText.trim());
    setEditingId(null);
  };

  const pinned = personalNotes.filter((n) => n.isPinned);
  const others = personalNotes.filter((n) => !n.isPinned);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">My Notes</h2>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" />
              Private to You
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Personal study notes, viva questions, and task reminders. Never shared with college or faculty.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Note</span>
        </button>
      </div>

      {/* Add Note Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-blue-200 p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900">New Personal Note</h3>
          <input
            type="text"
            required
            placeholder="Note title (e.g. DBMS Viva)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
          />
          <textarea
            rows={3}
            placeholder="Note content (e.g. Revise normalization and SQL joins before Monday...)"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Save Note
            </button>
          </div>
        </form>
      )}

      {/* Notes Grid */}
      <div className="space-y-4">
        {personalNotes.length === 0 && !isAdding ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <p className="text-sm font-bold text-slate-800">Your notepad is empty</p>
            <p className="text-xs text-slate-400 mt-1">Keep track of personal study points, deadlines, and questions.</p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-3 text-xs font-semibold text-blue-600 hover:underline"
            >
              + Create your first note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[...pinned, ...others].map((note) => (
              <div
                key={note.id}
                className={`bg-white rounded-2xl border p-4 shadow-xs flex flex-col justify-between transition-all ${
                  note.isPinned ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {editingId === note.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editTitleText}
                      onChange={(e) => setEditTitleText(e.target.value)}
                      className="w-full px-2 py-1 text-xs font-bold border border-slate-300 rounded"
                    />
                    <textarea
                      rows={4}
                      value={editContentText}
                      onChange={(e) => setEditContentText(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2 py-1 text-[11px] text-slate-500 hover:underline"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(note.id)}
                        className="px-3 py-1 text-[11px] font-semibold text-white bg-blue-600 rounded"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">{note.title}</h4>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => togglePinNote(note.id)}
                          title={note.isPinned ? 'Unpin' : 'Pin to top'}
                          className="p-1 text-slate-400 hover:text-amber-500 transition-colors"
                        >
                          <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-amber-500 text-amber-500' : ''}`} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {note.content}
                    </p>
                  </div>
                )}

                {editingId !== note.id && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{new Date(note.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(note)}
                        className="p-1 hover:text-blue-600 rounded"
                        title="Edit Note"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-1 hover:text-red-600 rounded"
                        title="Delete Note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
