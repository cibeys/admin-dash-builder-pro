
import React from 'react';
import RegisterForm from './components/RegisterForm';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/common/context/AuthContext';

const RegisterPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <RegisterForm />;
};

export default RegisterPage;
