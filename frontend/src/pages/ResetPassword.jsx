import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [form, setForm] = useState({
    username: '',
    code: '',
    new_password: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isPasswordStrong = (pwd) => {
    return (
      pwd.length >= 8 &&
      /[A-Z]/.test(pwd) &&
      /[a-z]/.test(pwd) &&
      /\d/.test(pwd) &&
      /[@$!%*?&]/.test(pwd)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordStrong(form.new_password)) {
      toast.error('Password must be strong: 8+ chars, upper, lower, number, special.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/reset-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Password reset successful!');
        navigate('/login');
      } else {
        toast.error(data.error || 'Reset failed.');
      }
    } catch (err) {
      console.error('Reset error:', err);
      toast.error('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-clay flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-xl font-bold text-teal mb-6 text-center">
          Reset Password
        </h2>

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring focus:border-teal"
          required
        />

        <input
          type="text"
          name="code"
          placeholder="Reset Code"
          value={form.code}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring focus:border-teal"
          required
        />

        <input
          type="password"
          name="new_password"
          placeholder="New Password"
          value={form.new_password}
          onChange={handleChange}
          className="w-full mb-6 px-4 py-2 border rounded focus:outline-none focus:ring focus:border-teal"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white transition ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-teal hover:bg-darkBlue'
          }`}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>

        <p className="text-center text-sm text-slate mt-4">
          Already reset?{' '}
          <span
            onClick={() => navigate('/login')}
            className="underline text-teal hover:text-darkBlue cursor-pointer"
          >
            Log in
          </span>
        </p>
      </form>
    </div>
  );
};

export default ResetPassword;