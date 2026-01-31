let accessToken: string | null = null;

const tokenManager = {
    setToken: (token: string | null) => {
        accessToken = token;
    },
    getToken: (): string | null => {
        return accessToken;
    }
};

export default tokenManager;
