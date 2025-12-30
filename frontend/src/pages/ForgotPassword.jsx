import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [serverCode, setServerCode] = useState(""); // store code from backend
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const navigate = useNavigate();

  // Send email code
  const handleSendCode = async () => {
    if (!email.trim()) return toast.error("Email is required");
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setServerCode(code);
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/auth/send-email-code/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code }),
      });
      const data = await response.json();
      console.log(data);
      if (response.ok && data.success) {
        toast.success("Reset code sent! Check your email.");
         // store code locally for frontend verification
        setStep(2);
      } else {
        toast.error(data.error || "Failed to send code.");
      }
    } catch (err) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Verify code locally
  const handleVerifyCode = () => {
    if (!code.trim()) return toast.error("Code is required");
    if (code === serverCode) {
      toast.success("Code verified!");
      setStep(3);
    } else {
      toast.error("Invalid code.");
    }
  };

  // Reset password (send request to backend)
  const handleResetPassword = async () => {
    if (!password || !confirmPassword) return toast.error("Fill all fields");
    if (password !== confirmPassword) return toast.error("Passwords do not match");

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/auth/reset-password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirm_password: confirmPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Password changed!");
        navigate("/login");
      } else {
        toast.error(data.error || "Failed to reset password.");
      }
    } catch (err) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-clay">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        {/* Step 1: Enter email */}
        {step === 1 && (
          <>
            <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full mb-4 p-2 border rounded"
            />
            <button
              onClick={handleSendCode}
              disabled={loading}
              className="w-full py-2 bg-teal text-white rounded"
            >
              {loading ? "Sending..." : "Send Code"}
            </button>
          </>
        )}

        {/* Step 2: Enter code */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-bold mb-4">Enter Verification Code</h2>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code"
              className="w-full mb-4 p-2 border rounded"
            />
            <button
              onClick={handleVerifyCode}
              disabled={loading}
              className="w-full py-2 bg-teal text-white rounded"
            >
              Verify Code
            </button>
          </>
        )}

        {/* Step 3: Reset password */}
        {step === 3 && (
          <>
            <h2 className="text-xl font-bold mb-4">Reset Password</h2>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="w-full mb-4 p-2 border rounded"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full mb-4 p-2 border rounded"
            />
            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full py-2 bg-teal text-white rounded"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
