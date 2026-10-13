import { AuthLayout } from '../components/AuthLayout';
import { useEffect } from 'react';

export function RegisterPage() {
  useEffect(() => {
    window.history.pushState({}, '', '/register');
  }, []);

  return <AuthLayout />;
}