import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'seeker',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // step 1: email, step 2: code, step 3: rest of form
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [usernameValid, setUsernameValid] = useState(true);
  const [emailValid, setEmailValid] = useState(true);
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    notContainingUsername: false,
  });

  const navigate = useNavigate();

  const validateUsername = (username) => /^[a-zA-Z0-9_]{3,}$/.test(username);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const updatePasswordRules = (password, username = form.username) => {
    const uname = username.trim().toLowerCase();
    const pwd = password.trim();

    setPasswordRules({
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password),
      notContainingUsername: uname.length > 0 && pwd.length > 0 ? !pwd.toLowerCase().includes(uname) : false,
    });
  };

  const isPasswordValid = () => Object.values(passwordRules).every((rule) => rule === true);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'username') {
      setUsernameValid(validateUsername(value));
      updatePasswordRules(form.password, value); // use latest username
    }
    if (name === 'email') {
      setEmailValid(validateEmail(value));
    }
    if (name === 'password') {
      updatePasswordRules(value);
    }
  };

  const sendEmailCode = async () => {
    setError('');
    setLoading(true);

    if (!validateEmail(form.email.trim())) {
      setError('Invalid email address.');
      setLoading(false);
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);

    try {
      const response = await fetch('http://localhost:8000/auth/send-email-code/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim(), code }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep(2);
      } else {
        console.log('Backend error:', data);
        // show first serializer error
        if (typeof data === 'object') {
          const firstKey = Object.keys(data)[0];
          setError(`${firstKey}: ${data[firstKey]}`);
        } else {
          setError('Failed to send email.');
        }
      }
    } catch (err) {
      console.error('Email send error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = () => {
    if (verificationCode === generatedCode) {
      setVerifiedEmail(form.email.trim());
      setStep(3);
      setError('');
    } else {
      setError('Incorrect verification code.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const trimmedForm = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      username: form.username.trim(),
      password: form.password,
      confirm_password: form.confirm_password,
      role: form.role,
    };

    if (!validateUsername(trimmedForm.username)) {
      setError('Invalid username.');
      setLoading(false);
      return;
    }

    if (!isPasswordValid()) {
      setError('Password does not meet all criteria.');
      setLoading(false);
      return;
    }

    if (trimmedForm.password !== trimmedForm.confirm_password) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (!verifiedEmail) {
      setError('Please verify your email first.');
      setLoading(false);
      return;
    }

    const payload = {
      ...trimmedForm,
      email: verifiedEmail,
    };

    try {
      const response = await fetch('http://localhost:8000/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/login');
      } else {
        console.log('Backend error:', data);
        if (typeof data === 'object') {
          const firstKey = Object.keys(data)[0];
          setError(`${firstKey}: ${data[firstKey]}`);
        } else {
          setError('Signup failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-clay flex items-center justify-center px-4">
      <form className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold text-teal mb-6 text-center">Create Account</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        {step === 1 && (
          <>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring focus:border-teal"
            />
            <button
              type="button"
              onClick={sendEmailCode}
              disabled={loading}
              className={`w-full py-2 rounded text-white transition ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal hover:bg-darkBlue'}`}
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              type="text"
              name="verificationCode"
              placeholder="Enter verification code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring focus:border-teal"
            />
            <button
              type="button"
              onClick={verifyCode}
              disabled={loading}
              className={`w-full py-2 rounded text-white transition ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal hover:bg-darkBlue'}`}
            >
              Verify Code
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <input type="text" name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} required className="w-full mb-3 px-4 py-2 border rounded focus:outline-none focus:ring focus:border-teal" />
            <input type="text" name="last_name" placeholder="Last Name" value={form.last_name} onChange={handleChange} required className="w-full mb-3 px-4 py-2 border rounded focus:outline-none focus:ring focus:border-teal" />
            <input type="text" name="username" placeholder="Username" value={form.username} onChange={handleChange} required className="w-full mb-3 px-4 py-2 border rounded focus:outline-none focus:ring focus:border-teal" />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              onFocus={() => setPasswordTouched(true)}
              required
              className={`w-full mb-1 px-4 py-2 border rounded focus:outline-none focus:ring ${passwordTouched ? (isPasswordValid() ? 'border-green-500' : 'border-red-500') : 'border-gray-300'}`}
            />
            {passwordTouched && (
              <ul className="text-xs mb-3 list-none space-y-1">
                {[
                  { label: 'At least 8 characters', key: 'length' },
                  { label: 'One uppercase letter (A–Z)', key: 'uppercase' },
                  { label: 'One lowercase letter (a–z)', key: 'lowercase' },
                  { label: 'One number (0–9)', key: 'number' },
                  { label: 'One special character (@$!%*?&)', key: 'special' },
                  { label: 'Should not contain your username', key: 'notContainingUsername' },
                ].map((rule) => (
                  <li key={rule.key} className={`flex items-center gap-2 ${passwordRules[rule.key] ? 'text-green-600' : 'text-slate-600'}`}>
                    <span className={`inline-block w-3 h-3 rounded-full ${passwordRules[rule.key] ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    {rule.label}
                  </li>
                ))}
              </ul>
            )}

            <input type="password" name="confirm_password" placeholder="Confirm Password" value={form.confirm_password} onChange={handleChange} required className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring focus:border-teal" />
            <select name="role" value={form.role} onChange={handleChange} className="w-full mb-6 px-4 py-2 border rounded bg-white focus:outline-none focus:ring focus:border-teal">
              <option value="seeker">House Seeker</option>
              <option value="landlord">Landlord</option>
            </select>
            <button type="button" onClick={handleSubmit} disabled={loading || !verifiedEmail} className={`w-full py-2 rounded text-white transition ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal hover:bg-darkBlue'}`}>
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default SignUp;
