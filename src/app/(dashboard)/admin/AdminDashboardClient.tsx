'use client';

import { useMemo, useState } from 'react';
import { Check, Save, Trash2, UserCheck, X } from 'lucide-react';
import { toast } from 'sonner';

type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isApproved: boolean;
  createdAt: Date | string;
};

export function AdminDashboardClient({
  initialUsers,
  currentUserId,
}: {
  initialUsers: ManagedUser[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState(initialUsers);
  const pendingUsers = useMemo(
    () => users.filter((user) => !user.isApproved && user.role !== 'ADMIN'),
    [users]
  );

  const updateUser = (updatedUser: ManagedUser) => {
    setUsers((prev) => prev.map((user) => (user.id === updatedUser.id ? updatedUser : user)));
  };

  const handleApproval = async (user: ManagedUser, approve: boolean) => {
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, approve, role: user.role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');

      if (approve) {
        setUsers((prev) =>
          prev.map((item) => (item.id === user.id ? { ...item, isApproved: true } : item))
        );
        toast.success(`${user.name} approved`);
      } else {
        setUsers((prev) => prev.filter((item) => item.id !== user.id));
        toast.success(`${user.name} rejected`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to perform action');
    }
  };

  const handleRoleChange = (id: string, role: Role) => {
    setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, role } : user)));
  };

  const saveUser = async (user: ManagedUser) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, role: user.role, isApproved: user.isApproved }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');

      updateUser(data);
      toast.success(`${data.name}'s role updated`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update user');
    }
  };

  const setApproval = async (user: ManagedUser, isApproved: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, isApproved }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');

      updateUser(data);
      toast.success(`${data.name} ${isApproved ? 'approved' : 'suspended'}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update approval');
    }
  };

  const deleteUser = async (user: ManagedUser) => {
    const confirmed = window.confirm(`Delete ${user.name}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');

      setUsers((prev) => prev.filter((item) => item.id !== user.id));
      toast.success(`${user.name} deleted`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
    }
  };

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <StatCard label="Total Users" value={users.length} />
        <StatCard label="Pending Approval" value={pendingUsers.length} />
        <StatCard label="Teachers" value={users.filter((user) => user.role === 'TEACHER').length} />
        <StatCard label="Students" value={users.filter((user) => user.role === 'STUDENT').length} />
      </div>

      <section className="edu-card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#2D2B55', marginBottom: 16 }}>
          Pending User Approvals
        </h2>

        {pendingUsers.length === 0 ? (
          <p style={{ color: '#5A5880' }}>No pending users at the moment.</p>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {pendingUsers.map((user) => (
              <div key={user.id} style={rowStyle}>
                <UserSummary user={user} />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <RoleSelect value={user.role} onChange={(role) => handleRoleChange(user.id, role)} />
                  <button onClick={() => handleApproval(user, true)} className="btn-primary" style={buttonStyle}>
                    <Check size={16} />
                    Approve
                  </button>
                  <button onClick={() => handleApproval(user, false)} style={dangerButtonStyle}>
                    <X size={16} />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="edu-card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#2D2B55', marginBottom: 16 }}>
          Manage Users
        </h2>

        <div style={{ display: 'grid', gap: 12 }}>
          {users.map((user) => {
            const isSelf = user.id === currentUserId;

            return (
              <div key={user.id} style={rowStyle}>
                <UserSummary user={user} />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <RoleSelect
                    value={user.role}
                    onChange={(role) => handleRoleChange(user.id, role)}
                    disabled={isSelf}
                  />
                  <button onClick={() => saveUser(user)} disabled={isSelf} style={secondaryButtonStyle}>
                    <Save size={16} />
                    Save
                  </button>
                  {user.isApproved ? (
                    <button onClick={() => setApproval(user, false)} disabled={isSelf} style={warningButtonStyle}>
                      <X size={16} />
                      Suspend
                    </button>
                  ) : (
                    <button onClick={() => setApproval(user, true)} className="btn-primary" style={buttonStyle}>
                      <UserCheck size={16} />
                      Approve
                    </button>
                  )}
                  <button onClick={() => deleteUser(user)} disabled={isSelf} style={dangerButtonStyle}>
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="edu-card" style={{ padding: 20 }}>
      <p style={{ color: '#5A5880', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{label}</p>
      <p style={{ color: '#2D2B55', fontSize: 28, fontWeight: 700 }}>{value}</p>
    </div>
  );
}

function UserSummary({ user }: { user: ManagedUser }) {
  return (
    <div style={{ minWidth: 220 }}>
      <p style={{ fontWeight: 600, color: '#2D2B55', marginBottom: 4 }}>{user.name}</p>
      <p style={{ color: '#5A5880', fontSize: 14 }}>{user.email}</p>
      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        <span className={user.role === 'STUDENT' ? 'badge-student' : 'badge-teacher'}>{formatRole(user.role)}</span>
        <span style={user.isApproved ? approvedBadgeStyle : pendingBadgeStyle}>
          {user.isApproved ? 'Approved' : 'Pending'}
        </span>
      </div>
    </div>
  );
}

function RoleSelect({
  value,
  onChange,
  disabled = false,
}: {
  value: Role;
  onChange: (role: Role) => void;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as Role)}
      disabled={disabled}
      style={{
        minWidth: 120,
        padding: '8px 10px',
        borderRadius: 8,
        border: '1px solid rgba(108,99,255,0.15)',
        background: disabled ? '#F2F1FA' : '#FFFFFF',
        color: '#2D2B55',
        fontWeight: 500,
      }}
    >
      <option value="ADMIN">Admin</option>
      <option value="TEACHER">Teacher</option>
      <option value="STUDENT">Student</option>
    </select>
  );
}

function formatRole(role: Role) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  padding: 16,
  background: '#F8F7FF',
  borderRadius: 12,
  border: '1px solid rgba(108, 99, 255, 0.1)',
  flexWrap: 'wrap' as const,
};

const buttonStyle = {
  padding: '8px 12px',
  fontSize: 14,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
};

const secondaryButtonStyle = {
  ...buttonStyle,
  background: '#FFFFFF',
  color: '#6C63FF',
  border: '1px solid rgba(108,99,255,0.18)',
  borderRadius: 8,
  cursor: 'pointer',
  fontWeight: 500,
};

const warningButtonStyle = {
  ...buttonStyle,
  background: '#FFF8E8',
  color: '#B86B00',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontWeight: 500,
};

const dangerButtonStyle = {
  ...buttonStyle,
  background: '#FFF0F3',
  color: '#FF4757',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontWeight: 500,
};

const approvedBadgeStyle = {
  padding: '4px 10px',
  borderRadius: 999,
  background: 'rgba(67,232,216,0.12)',
  color: '#0CA89A',
  fontSize: 12,
  fontWeight: 600,
};

const pendingBadgeStyle = {
  ...approvedBadgeStyle,
  background: 'rgba(255,179,71,0.16)',
  color: '#B86B00',
};
