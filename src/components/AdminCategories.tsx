import React, { useState } from 'react';
import { Tag, Plus, Power } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AdminCategories: React.FC = () => {
  const { categories, addCategory, toggleCategory } = useApp();
  const [newCatName, setNewCatName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory(newCatName.trim());
    setNewCatName('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Notice Categories</h2>
          <p className="text-xs text-slate-500 mt-1">
            Database-driven categories. Admin can add, enable, or disable notice categories.
          </p>
        </div>
      </div>

      {/* Add Category Form */}
      <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex gap-2">
        <input
          type="text"
          required
          placeholder="New Category Name (e.g. Scholarship or Workshop)"
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Category</span>
        </button>
      </form>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
        {categories.map((cat) => (
          <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <Tag className="w-4 h-4 text-blue-600" />
              <div>
                <span className="text-xs font-bold text-slate-900">{cat.name}</span>
                <span className="text-[11px] text-slate-400 font-mono ml-2">slug: {cat.slug}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  cat.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {cat.isActive ? 'Active' : 'Disabled'}
              </span>

              <button
                onClick={() => toggleCategory(cat.id)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
                title={cat.isActive ? 'Disable Category' : 'Enable Category'}
              >
                <Power className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
