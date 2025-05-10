
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/common/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FiMail, FiLock, FiUser, FiGithub } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('admin@example.com'); // Demo default
  const [password, setPassword] = useState('password123'); // Demo default
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      await login(email, password);
      toast.success('Login berhasil!');
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Login gagal. Silahkan coba lagi.');
      toast.error('Login gagal. Silahkan coba lagi.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <Card className="shadow-lg border-opacity-50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Selamat Datang Kembali</CardTitle>
          <CardDescription className="text-center">
            Masuk ke akun Anda untuk melanjutkan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4"
            >
              {error}
            </motion.div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <FiMail className="text-muted-foreground" />
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email Anda"
                className="focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <FiLock className="text-muted-foreground" />
                  Password
                </Label>
                <Link
                  to="/auth/reset-password"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Lupa password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full hover:scale-105 transition-transform"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-t-2 border-b-2 border-primary-foreground rounded-full animate-spin"></div>
              ) : (
                'Masuk'
              )}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-background text-muted-foreground">
                  Atau lanjutkan dengan
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <Button variant="outline" type="button" className="flex items-center gap-2 hover:scale-105 transition-transform">
                <FcGoogle className="w-5 h-5" />
                Google
              </Button>
              <Button variant="outline" type="button" className="flex items-center gap-2 hover:scale-105 transition-transform">
                <FiGithub className="w-5 h-5" />
                GitHub
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Belum punya akun?{' '}
              <Link
                to="/auth/register"
                className="font-medium text-primary hover:underline"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
          
          <div className="text-center text-xs text-muted-foreground mt-4">
            <p>Data login demo:</p>
            <p className="font-mono">Email: admin@example.com | Password: password123</p>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default LoginForm;
