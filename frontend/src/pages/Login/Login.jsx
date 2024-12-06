// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Login.module.css';
import createApi from '../../services/api';

// function Login({ setAuth }) {
const Login = ({setAuth}) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const api = createApi(username,password);


    

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            setError('Please enter both username and password.');
            return;
        }
        setLoading(true); 
        try {
            // const api=createApi();
            const response=await api.post('/auth/login',{username,password})


            if (response.status === 200) {
                setAuth({ username, password });
                navigate('/', { state: { message: 'Login Successfully .Redirected to home page.......' } });
            } else {
                const data = await response.json();
                setError(data.message || 'Login failed.');
            }
            console.log(response);
        } catch (err) {
            setError('An error occurred during login.');
            console.error(err);
        }
        finally {
            setLoading(false); 
        }
    };

    return (
        <div className={styles.container}>
            {/* <h2 className={styles.heading}>Login</h2> */}
            
            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className={styles.input}
                        disabled={loading}
                    />
                    
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={styles.input}
                        disabled={loading}
                    />
                </div>
                {location.state?.message && <p className={styles.success}>{location.state.message}</p>}
                <button type="submit" className={styles.button} disabled={loading}>
                    {loading ? 'Loading...' : 'Login'}
                </button>
            </form>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.registerLink}>
                <p>
                    Don't have an account? <Link to="/register">Register here</Link>.
                </p>
            </div>
        </div>
    );
}

export default Login;


// const response = await fetch(`${API_BASE_URL}/auth/login`, {
//     method: 'POST',
//     headers: {
//         'Authorization': 'Basic ' + btoa(`${username}:${password}`),
//     },
// });

//const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;