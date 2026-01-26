import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Để gửi cookie (refreshToken) đi kèm
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        // Bạn có thể thêm logic lấy access token từ memory/localStorage và gắn vào header ở đây nếu cần
        // Tuy nhiên với mô hình HttpOnly Cookie cho Refresh Token và Access Token (nếu lưu memory), 
        // ta thường sẽ xử lý việc attach token ở đây.
        // Ví dụ: const token = useAuthStore.getState().accessToken;
        // if (token) { config.headers.Authorization = `Bearer ${token}`; }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
