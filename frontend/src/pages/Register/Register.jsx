import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Register.module.css';
//frontend/src/services/api.js
import createApi from '../../services/api';

const Register=({ setAuth })=> {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
  //  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const [loading, setLoading] = useState(false);
    const api = createApi(username,password);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Basic validation
        if (!username || !password || !confirmPassword) {
            setError('All fields are required.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true); 
        try {

                // const response = await fetch(`${API_BASE_URL}/auth/register`, {
                // method: 'POST',
                // headers: {
                //     'Content-Type': 'application/json',
                // },
                // body: JSON.stringify({ username, password }),
            //});
            const response = await api.post('/auth/register', { username, password });
            const data = await response.data;

            if (response.status === 201) {
                setSuccess('Registration successful!');
                //navigate('/', { state: { message: 'Registration Successfull .Redirected to home page.......' } });
                setAuth({ username, password });
                navigate('/');
            } else {
                setError(data.message || 'Registration failed.');
            }
            console.log(response);
        } catch (err) {
            setError('An error occurred during registration.');
            console.error(err);
        }  finally {
            setLoading(false); 
        }
    };

    return (
        <div className={styles.container}>
            {/* <h2 className={styles.heading}>Register</h2> */}

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
                <div className={styles.formGroup}>
                    <label className={styles.label}>Confirm Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className={styles.input}
                        disabled={loading}
                    />
                </div>
                <button type="submit" className={styles.button} disabled={loading}>
                    {loading ? 'Loading...' : 'Register'}
                </button>
            </form>
            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>{success}</p>}
            <div className={styles.loginLink}>
                <p>
                    Already have an account? <Link to="/login">Login here</Link>.
                </p>
            </div>
        </div>
    );
}

export default Register;
