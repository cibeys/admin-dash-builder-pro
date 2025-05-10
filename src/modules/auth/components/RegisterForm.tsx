
import React, { useState } from 'react';
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

const RegisterForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { signUp, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Password tidak cocok');
      toast.error('Password tidak cocok');
      return;
    }

    try {
      await signUp(email, password, name);
      toast.success('Pendaftaran berhasil!');
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Pendaftaran gagal. Silakan coba lagi.');
      toast.error('Pendaftaran gagal. Silakan coba lagi.');
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
          <CardTitle className="text-2xl font-bold text-center">Buat Akun Baru</CardTitle>
          <CardDescription className="text-center">
            Daftar untuk mengakses semua fitur kami
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
              <Label htmlFor="name" className="flex items-center gap-2">
                <FiUser className="text-muted-foreground" />
                Nama Lengkap
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap Anda"
                className="focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <FiMail className="text-muted-foreground" />
                Email
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
              <Label htmlFor="password" className="flex items-center gap-2">
                <FiLock className="text-muted-foreground" />
                Password
              </Label>
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                <FiLock className="text-muted-foreground" />
                Konfirmasi Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                'Daftar'
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
                  Atau daftar dengan
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

        <CardFooter>
          <div className="text-center w-full">
            <p className="text-sm text-muted-foreground">
              Sudah punya akun?{' '}
              <Link
                to="/auth/login"
                className="font-medium text-primary hover:underline"
              >
                Masuk
              </Link>
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Dengan mendaftar, Anda menyetujui{' '}
              <Link to="/terms" className="text-primary hover:underline">
                Syarat & Ketentuan
              </Link>{' '}
              dan{' '}
              <Link to="/privacy" className="text-primary hover:underline">
                Kebijakan Privasi
              </Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default RegisterForm;
