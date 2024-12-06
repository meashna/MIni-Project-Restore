
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const createApi = (username, password) => {
    const token = btoa(`${username}:${password}`);
    return axios.create({
        baseURL: API_BASE_URL,
        headers: {
            'Authorization': `Basic ${token}`,
            'Content-Type': 'application/json',
        },
    });
};

export default createApi;



