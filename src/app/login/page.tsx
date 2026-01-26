'use client';

import { useState } from 'react';
import { login, register } from '@/services/authService';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true); // State để kiểm soát đang ở form nào
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    // State chung cho cả 2 form
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        phoneNumber: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                // Xử lý Login
                const data = await login(formData.username, formData.password);
                localStorage.setItem('accessToken', data.accessToken);
                router.push('/');
            } else {
                // Xử lý Register
                if (formData.password !== formData.confirmPassword) {
                    throw new Error('Mật khẩu xác nhận không khớp!');
                }

                await register({
                    fullName: formData.fullName,
                    username: formData.username,
                    password: formData.password,
                    email: formData.email,
                    phoneNumber: formData.phoneNumber
                });

                alert('Đăng ký thành công! Vui lòng đăng nhập.');
                setIsLogin(true); // Chuyển về tab đăng nhập
                setFormData(prev => ({ ...prev, password: '', confirmPassword: '' })); // Xóa mật khẩu
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4 py-12">
            <div className="w-full max-w-md p-8 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 transition-all duration-300">
                <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    {isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản'}
                </h1>

                {/* Tab Switcher */}
                <div className="flex bg-gray-700/50 rounded-xl p-1 mb-8">
                    <button
                        className={`flex-1 py-2 rounded-lg font-medium transition-all ${isLogin ? 'bg-gray-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                        onClick={() => { setIsLogin(true); setError(''); }}
                    >
                        Đăng nhập
                    </button>
                    <button
                        className={`flex-1 py-2 rounded-lg font-medium transition-all ${!isLogin ? 'bg-gray-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                        onClick={() => { setIsLogin(false); setError(''); }}
                    >
                        Đăng ký
                    </button>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-6 text-sm text-center animate-pulse">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Các trường chỉ dành cho Register */}
                    {!isLogin && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Họ và tên</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    required={!isLogin}
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Nguyễn Văn A"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    required={!isLogin}
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="email@example.com"
                                />
                            </div>
                        </div>
                    )}

                    {/* Username (Dùng chung) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Tên đăng nhập</label>
                        <input
                            type="text"
                            name="username"
                            required
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="username123"
                        />
                    </div>

                    {/* Password (Dùng chung) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Mật khẩu</label>
                        <input
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    {/* Confirm Password (Chỉ Register) */}
                    {!isLogin && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="block text-sm font-medium text-gray-400 mb-1">Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                required={!isLogin}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="••••••••"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-bold transition-all transform active:scale-95 disabled:opacity-50 mt-4 shadow-lg shadow-blue-500/20"
                    >
                        {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng Nhập' : 'Đăng Ký')}
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-500 text-sm">
                    {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
                    <button
                        className="text-blue-400 hover:underline font-medium"
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                    >
                        {isLogin ? 'Đăng ký ngay' : 'Đăng nhập ngay'}
                    </button>
                </p>
            </div>
        </div>
    );
}
