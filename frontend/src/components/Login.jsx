import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [codeInput, setCodeInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState('login'); // 'login' | 'verify'
  const [tempUser, setTempUser] = useState(null); // Store user until verified

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginRes = await fetch('http://localhost:8000/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        setError(loginData.detail || 'Invalid credentials. Try again.');
        setLoading(false);
        return;
      }

      // Store user temporarily, do not save yet
      setTempUser(loginData.user);

      // Generate code (you can also generate on backend)
      const code = Math.floor(100000 + Math.random() * 900000); // Example 6-digit code

      // Send email with code
      await fetch('http://localhost:8000/auth/send-email-code/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginData.user.email, code }),
      });

      // Save code in temp state (you might also verify backend-side)
      setTempUser({ ...loginData.user, access: loginData.access, refresh: loginData.refresh, code });

      setStep('verify'); // Move to code verification step
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    console.log(tempUser.code);
    if (codeInput.trim() !== String(tempUser.code)) {
      setError('Invalid code. Please check your email.');
      return;
    }

    // Code is correct, save user in context/localStorage
    const { access, refresh, ...user } = tempUser;

    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify({ ...user, isAuthenticated: true }));

    setUser({ ...user, isAuthenticated: true });

    // Redirect based on role
    if (user.role === 'landlord') {
      navigate('/dashboard/landlord');
    } else if (user.role === 'seeker') {
      navigate('/dashboard/seeker');
    } else {
      navigate('/');
    }
  };

  if (step === 'verify') {
    return (
      <div className="min-h-screen bg-clay flex items-center justify-center px-4">
        <form
          onSubmit={handleVerify}
          className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
        >
          <h2 className="text-xl font-bold text-teal mb-6 text-center">Verify Email</h2>

          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

          <input
            type="text"
            placeholder="Enter verification code"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring focus:border-teal"
            required
          />

          <button
            type="submit"
            className="w-full py-2 rounded bg-teal text-white hover:bg-darkBlue transition"
          >
            Verify
          </button>
        </form>
      </div>
    );
  }

  // Login step
  return (
    <div className="min-h-screen bg-clay flex items-center justify-center px-4">
      <form
        onSubmit={handleLogin}
        autoComplete="off"
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-xl font-bold text-teal mb-6 text-center">Login</h2>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          autoComplete="new-username"
          className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring focus:border-teal"
          required
        />

        <div className="relative mb-6">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-teal pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2 text-gray-500 hover:text-teal focus:outline-none"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded transition ${
            loading
              ? 'bg-gray-400 cursor-not-allowed opacity-70'
              : 'bg-teal text-white hover:bg-darkBlue'
          }`}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        <div className="text-center text-sm text-slate mt-4 space-y-2">
          <p>
            <Link to="/forgot-password" className="underline text-teal hover:text-darkBlue">
              Forgot Password?
            </Link>
          </p>
          <p>
            Don’t have an account?{' '}
            <Link to="/signup" className="underline text-teal hover:text-darkBlue">
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
