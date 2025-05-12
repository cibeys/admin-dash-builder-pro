
import React from 'react';
import { AdminChatPanel } from '../components/AdminChatPanel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const ChatAdminPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Chat Admin</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manajemen Chat Pengguna</CardTitle>
          <CardDescription>Kelola dan jawab pertanyaan dari pengguna aplikasi</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <AdminChatPanel />
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatAdminPage;
