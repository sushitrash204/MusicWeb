'use client';

import { useState } from 'react';
import authService from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './AuthPage.module.css';

export default function AuthPage() {
    const { login, register } = useAuth();
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
                await login({ username: formData.username, password: formData.password });
                // localStorage and state are handled in AuthContext
                router.push('/');
            } else {
                // Xử lý Register
                if (formData.password !== formData.confirmPassword) {
                    throw new Error('Mật khẩu xác nhận không khớp!');
                }

                await authService.register({
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
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>
                    {isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản'}
                </h1>

                {/* Tab Switcher */}
                <div className={styles.tabContainer}>
                    <button
                        className={`${styles.tabButton} ${isLogin ? styles.activeTab : ''}`}
                        onClick={() => { setIsLogin(true); setError(''); }}
                    >
                        Đăng nhập
                    </button>
                    <button
                        className={`${styles.tabButton} ${!isLogin ? styles.activeTab : ''}`}
                        onClick={() => { setIsLogin(false); setError(''); }}
                    >
                        Đăng ký
                    </button>
                </div>

                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>

                    {/* Các trường chỉ dành cho Register */}
                    {!isLogin && (
                        <div className={`${styles.inputGroup} ${styles.animationContainer}`}>
                            <div>
                                <label className={styles.label}>Họ và tên</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    required={!isLogin}
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="Nguyễn Văn A"
                                />
                            </div>
                            <div>
                                <label className={styles.label}>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    required={!isLogin}
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="email@example.com"
                                />
                            </div>
                        </div>
                    )}

                    {/* Username (Dùng chung) */}
                    <div>
                        <label className={styles.label}>Tên đăng nhập</label>
                        <input
                            type="text"
                            name="username"
                            required
                            value={formData.username}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="username123"
                        />
                    </div>

                    {/* Password (Dùng chung) */}
                    <div>
                        <label className={styles.label}>Mật khẩu</label>
                        <input
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="••••••••"
                        />
                    </div>

                    {/* Confirm Password (Chỉ Register) */}
                    {!isLogin && (
                        <div className={styles.animationContainer}>
                            <label className={styles.label}>Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                required={!isLogin}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="••••••••"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={styles.submitButton}
                    >
                        {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng Nhập' : 'Đăng Ký')}
                    </button>
                </form>

                <p className={styles.footer}>
                    {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
                    <button
                        className={styles.linkButton}
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                    >
                        {isLogin ? 'Đăng ký ngay' : 'Đăng nhập ngay'}
                    </button>
                </p>
            </div>
        </div>
    );
}
