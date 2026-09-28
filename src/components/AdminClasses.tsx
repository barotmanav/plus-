import React, { useState } from 'react';
import { Building, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AdminClasses: React.FC = () => {
  const { classes, departments, addClass, deleteClass } = useApp();

  const [className, setClassName] = useState('');
  const [deptId, setDeptId] = useState(departments[0]?.id || 'dept-it');
  const [semester, setSemester] = useState(3);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;
    addClass(className.trim().toUpperCase(), deptId, semester);
    setClassName('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">College Classes</h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage class sections for targeting notices (e.g. IT-A, IT-B, CE-A).
        </p>
      </div>

      {/* Add Class Form */}
      <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Class Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. IT-C"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
          <select
            value={deptId}
            onChange={(e) => setDeptId(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
          <select
            value={semester}
            onChange={(e) => setSemester(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>
        </div>

        <div>
          <button
            type="submit"
            className="w-full py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Class</span>
          </button>
        </div>
      </form>

      {/* Class List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
        {classes.map((cls) => (
          <div key={cls.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
            <div className="flex items-center gap-3">
              <Building className="w-4 h-4 text-indigo-600" />
              <div>
                <span className="text-xs font-bold text-slate-900">{cls.name}</span>
                <span className="text-[11px] text-slate-500 ml-2">
                  {cls.departmentName} · Semester {cls.semester}
                </span>
                {cls.crName && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 ml-2">
                    CR: {cls.crName}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => deleteClass(cls.id)}
              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
              title="Delete Class"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
