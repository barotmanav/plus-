import React, { useState } from 'react';
import { Users, Plus, ShieldCheck, UserCheck, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RoleType } from '../types';

export const AdminUsers: React.FC = () => {
  const { users, departments, classes, addUser, toggleUserStatus } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<RoleType>('FACULTY');
  const [deptId, setDeptId] = useState(departments[0]?.id || 'dept-it');
  const [classId, setClassId] = useState(classes[0]?.id || 'class-it-a');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    addUser(name.trim(), email.trim(), role, deptId, role === 'CR' || role === 'STUDENT' ? classId : undefined);
    setName('');
    setEmail('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">User Management</h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage system users across the 4 roles: Admin, Faculty, Class Representative (CR), and Student.
        </p>
      </div>

      {/* Add User Form */}
      <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Dr. Priya Rao"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
          <input
            type="email"
            required
            placeholder="e.g. priya@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as RoleType)}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
          >
            <option value="FACULTY">Faculty</option>
            <option value="ADMIN">Admin</option>
            <option value="CR">Class Rep (CR)</option>
            <option value="STUDENT">Student</option>
          </select>
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
          <button
            type="submit"
            className="w-full py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create User</span>
          </button>
        </div>
      </form>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
        {users.map((u) => (
          <div key={u.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                {u.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{u.name}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      u.role === 'ADMIN'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : u.role === 'FACULTY'
                        ? 'bg-teal-50 text-teal-700 border border-teal-200'
                        : u.role === 'CR'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {u.role}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {u.email} · {u.departmentName || 'Campus Wide'} {u.className ? `· ${u.className}` : ''}
                </p>
              </div>
            </div>

            {u.role !== 'ADMIN' && (
              <button
                onClick={() => toggleUserStatus(u.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                title="Remove User"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
