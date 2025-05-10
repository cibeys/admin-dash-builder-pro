
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/common/context/AuthContext';
import { Link } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - branding & image */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary">
        <div className="w-full flex flex-col justify-between p-12">
          <div>
            <Link to="/" className="text-3xl font-bold text-white">
              TanoeLuis
            </Link>
            <p className="text-primary-foreground/80 mt-2">
              Your complete admin dashboard solution
            </p>
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <div className="max-w-md text-white">
              <h2 className="text-3xl font-bold mb-6">
                Take control of your data with our powerful admin dashboard.
              </h2>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Comprehensive analytics & reporting</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>User management with custom roles</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Blog & template management system</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="text-primary-foreground/60 text-sm">
            &copy; {new Date().getFullYear()} TanoeLuis. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right side - auth forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
