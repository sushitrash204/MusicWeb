'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Removed redirect logic to allow guest access

  if (loading) return <div className="bg-gray-900 min-h-screen text-white flex items-center justify-center">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Âm Nhạc Cho Bạn
        </h1>
        <p className="text-gray-400 mt-2">
          {user ? `Chào mừng trở lại, ${user.fullName || user.username}!` : 'Chào mừng bạn đến với Music App!'}
        </p>
      </div>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Placeholder cho danh sách nhạc */}
        {[1, 2, 3, 4, 5, 6].map((it) => (
          <div key={it} className="group bg-gray-800/50 p-4 rounded-2xl border border-gray-700 hover:bg-gray-800 hover:scale-[1.02] transition-all cursor-pointer">
            <div className="w-full aspect-square bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl mb-4 flex items-center justify-center">
              <span className="text-4xl text-gray-600 group-hover:text-blue-400 transition-colors">🎵</span>
            </div>
            <h3 className="font-bold text-lg">Bài hát số {it}</h3>
            <p className="text-gray-400 text-sm">Nghệ sĩ Demo</p>
          </div>
        ))}
      </main>
    </div>
  );
}
