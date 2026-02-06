import React, { useState } from 'react';

function UserManagement({ user, setUser, setStep }) {
  const [form, setForm] = useState({ name: user.name || '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!form.name) newErrors.name = 'Name is required';
    if (form.password && form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (form.password && form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords don't match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const requestData = { userEmail: user.email };
      if (form.name !== user.name) requestData.name = form.name;
      if (form.password) requestData.password = form.password;

      const response = await fetch(`http://localhost:8080/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      const data = await response.json();
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setErrors({ submit: 'User updated successfully' });
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to update user' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:8080/users/${user._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: user.email })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      localStorage.removeItem('user');
      setUser(null);
      setStep('login');
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to delete user' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginBottom: 24, color: '#333' }}>Manage Account</h2>
      <form onSubmit={handleUpdate}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, color: '#333' }}>Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your name"
            style={{
              width: '100%',
              padding: 10,
              border: errors.name ? '1px solid #f44336' : '1px solid #ccc',
              borderRadius: 4,
              color: '#333',
              backgroundColor: '#f9f9f9'
            }}
          />
          {errors.name && <p style={{ color: '#f44336', margin: '4px 0 0', fontSize: 14 }}>{errors.name}</p>}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, color: '#333' }}>New Password (optional)</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter new password"
            style={{
              width: '100%',
              padding: 10,
              border: errors.password ? '1px solid #f44336' : '1px solid #ccc',
              borderRadius: 4,
              color: '#333',
              backgroundColor: '#f9f9f9'
            }}
          />
          {errors.password && <p style={{ color: '#f44336', margin: '4px 0 0', fontSize: 14 }}>{errors.password}</p>}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, color: '#333' }}>Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm new password"
            style={{
              width: '100%',
              padding: 10,
              border: errors.confirmPassword ? '1px solid #f44336' : '1px solid #ccc',
              borderRadius: 4,
              color: '#333',
              backgroundColor: '#f9f9f9'
            }}
          />
          {errors.confirmPassword && <p style={{ color: '#f44336', margin: '4px 0 0', fontSize: 14 }}>{errors.confirmPassword}</p>}
        </div>

        {errors.submit && <p style={{ color: errors.submit.includes('successfully') ? '#4caf50' : '#f44336', margin: '4px 0 16px', fontSize: 14 }}>{errors.submit}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: 12,
            background: '#ff9800',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            marginBottom: 16
          }}
        >
          {loading ? 'Processing...' : 'Update Account'}
        </button>
      </form>

      <button
        onClick={handleDelete}
        disabled={loading}
        style={{
          width: '100%',
          padding: 12,
          background: '#f44336',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? 'Processing...' : 'Delete Account'}
      </button>
    </div>
  );
}

export default UserManagement;