import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Send, ShieldCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/authHooks.js';
import { forgotPasswordThunk } from '../Redux/slices/authSlice.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';

const ForgotPassword = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setFieldError('Email is required');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setFieldError('Enter a valid email address');
      return;
    }

    setFieldError('');
    const result = await dispatch(forgotPasswordThunk(normalizedEmail));
    if (forgotPasswordThunk.fulfilled.match(result)) {
      navigate('/reset-password', { state: { email: normalizedEmail } });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 mb-4">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Forgot your password?</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Enter your email and we&apos;ll send you a one-time reset code.
        </p>
      </div>

      {error && <div className="mb-4 rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          icon={<Mail size={18} />}
          value={email}
          onChange={(event) => { setEmail(event.target.value); setFieldError(''); }}
          error={Boolean(fieldError)}
          helperText={fieldError}
          autoComplete="email"
          disabled={isLoading}
          required
        />
        <Button type="submit" fullWidth size="lg" loading={isLoading} icon={<Send size={18} />} iconPosition="left" disabled={isLoading}>
          Send reset code
        </Button>
      </form>

      {isLoading && <div className="mt-6"><LoadingSpinner size="sm" text="Sending reset code..." /></div>}

      <Link to="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-primary hover:underline">
        <ArrowLeft size={16} /> Back to sign in
      </Link>
    </div>
  );
};

export default ForgotPassword;