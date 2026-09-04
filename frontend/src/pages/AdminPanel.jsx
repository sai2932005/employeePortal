import { useEffect, useState } from 'react';

import api from '../services/api';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [tab, setTab] = useState('users');

  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });
  const [newRole, setNewRole] = useState({ name: '', permissionKeys: [] });

  function refreshAll() {
    api.get('/admin/users').then((res) => setUsers(res.data.users));
    api.get('/admin/roles').then((res) => setRoles(res.data.roles));
    api.get('/admin/permissions').then((res) => setPermissions(res.data.permissions));
    api.get('/admin/audit-logs').then((res) => setLogs(res.data.logs));
  }

  useEffect(refreshAll, []);

  async function assignRole(userId, roleId) {
    await api.post('/admin/assign-role', { userId, roleId });
    refreshAll();
  }

  async function deleteUser(userId) {
    if (!confirm('Delete this user?')) return;
    await api.delete(`/admin/users/${userId}`);
    refreshAll();
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    await api.post('/admin/users', newUser);
    setNewUser({ name: '', email: '', password: '' });
    refreshAll();
  }

  function togglePermission(key) {
    setNewRole((prev) => ({
      ...prev,
      permissionKeys: prev.permissionKeys.includes(key)
        ? prev.permissionKeys.filter((k) => k !== key)
        : [...prev.permissionKeys, key],
    }));
  }

  async function handleCreateRole(e) {
    e.preventDefault();
    await api.post('/admin/roles', newRole);
    setNewRole({ name: '', permissionKeys: [] });
    refreshAll();
  }

  return (
    <div>
     
      <div className="page-content">
        <h2>Admin Control Panel</h2>

        <div className="tabs">
          <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>Users</button>
          <button className={tab === 'roles' ? 'active' : ''} onClick={() => setTab('roles')}>Roles</button>
          <button className={tab === 'logs' ? 'active' : ''} onClick={() => setTab('logs')}>Audit Logs</button>
        </div>

        {tab === 'users' && (
          <>
            <h3>Create User</h3>
            <form onSubmit={handleCreateUser} style={{ maxWidth: 320 }}>
              <input placeholder="Name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} required />
              <input placeholder="Email" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required />
              <input placeholder="Password" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required />
              <button type="submit">Create User</button>
            </form>

            <h3>All Users</h3>
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Roles</th><th>Assign Role</th><th>Delete</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.roleIds?.map((r) => r.name).join(', ') || '—'}</td>
                    <td>
                      <select defaultValue="" onChange={(e) => e.target.value && assignRole(u._id, e.target.value)}>
                        <option value="" disabled>Add role…</option>
                        {roles.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
                      </select>
                    </td>
                    <td><button onClick={() => deleteUser(u._id)} style={{ background: '#c0392b' }}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {tab === 'roles' && (
          <>
            <h3>Create Role</h3>
            <form onSubmit={handleCreateRole} style={{ maxWidth: 400 }}>
              <input placeholder="Role name" value={newRole.name} onChange={(e) => setNewRole({ ...newRole, name: e.target.value })} required />
              <p style={{ fontWeight: 600, marginTop: 12 }}>Permissions:</p>
              {permissions.map((p) => (
                <label key={p._id} style={{ display: 'block', fontWeight: 400 }}>
                  <input
                    type="checkbox"
                    checked={newRole.permissionKeys.includes(p.key)}
                    onChange={() => togglePermission(p.key)}
                    style={{ width: 'auto', display: 'inline', marginRight: 8 }}
                  />
                  {p.label}
                </label>
              ))}
              <button type="submit" style={{ marginTop: 12 }}>Create Role</button>
            </form>

            <h3>Existing Roles</h3>
            <table>
              <thead><tr><th>Name</th><th>Permissions</th></tr></thead>
              <tbody>
                {roles.map((r) => (
                  <tr key={r._id}><td>{r.name}</td><td>{r.permissionKeys.join(', ')}</td></tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {tab === 'logs' && (
          <table>
            <thead><tr><th>Time</th><th>Action</th><th>Detail</th></tr></thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l._id}><td>{new Date(l.createdAt).toLocaleString()}</td><td>{l.action}</td><td>{l.details}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}