import axios from 'axios';

const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
const apiPort = import.meta.env.VITE_API_PORT || '8080';
const fallbackBaseUrl = `${protocol}//${hostname}:${apiPort}`;

export default axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || fallbackBaseUrl,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

