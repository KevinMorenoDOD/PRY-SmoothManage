import { AuthLayout } from '../components/AuthLayout';
import { useEffect } from 'react';

export function ForgotPasswordPage() {
  useEffect(() => {
    window.history.pushState({}, '', '/forgot-password');
  }, []);

  return <AuthLayout />;
}