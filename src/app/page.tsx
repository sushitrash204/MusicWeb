'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/services/authService';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Kiểm tra xem đã đăng nhập chưa
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
    } else {
      // Trong thực tế, bạn sẽ gọi API lấy profile user ở đây
      setUser({ username: 'User Default' });
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('accessToken');
      router.push('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  if (!user) return <div className="bg-gray-900 min-h-screen text-white flex items-center justify-center">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Âm Nhạc Cho Bạn
          </h1>
          <p className="text-gray-400 mt-2">Chào mừng trở lại, {user.username}!</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-gray-800 hover:bg-red-600/20 hover:text-red-500 border border-gray-700 hover:border-red-500/50 rounded-lg transition-all"
        >
          Đăng xuất
        </button>
      </header>

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
