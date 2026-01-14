const config = {
    API_URL: import.meta.env.VITE_API_URL as string,
    APP_NAME: import.meta.env.VITE_APP_NAME as string,
    ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT as string,
};

// Basic validation
const requiredKeys = ['API_URL', 'APP_NAME', 'ENVIRONMENT'] as const;
requiredKeys.forEach((key) => {
    if (!config[key]) {
        console.warn(`Missing environment variable: VITE_${key}`);
    }
});

export default config;
