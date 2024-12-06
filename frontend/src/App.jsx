import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Home from './pages/Home/Home';
import ProjectDetail from './pages/ProjectDetails/ProjectDetail';
import Header from './components/Header/Header';

function App() {
    const [auth, setAuth] = useState(() => {
        // Initialize auth state from localStorage
        const storedAuth = localStorage.getItem('auth');
        return storedAuth ? JSON.parse(storedAuth) : { username: '', password: '' };
    });

    const isAuthenticated = auth.username !== '' && auth.password !== '';

    useEffect(() => {
        // Save auth state to localStorage whenever it changes
        localStorage.setItem('auth', JSON.stringify(auth));
    }, [auth]);

    return (
        <Router>
            {isAuthenticated && <Header setAuth={setAuth} auth={auth} />}
            <Routes>
                <Route path="/login" element={<Login setAuth={setAuth} />} />
                <Route path="/register" element={<Register setAuth={setAuth} />} />
                <Route
                    path="/"
                    element={
                        isAuthenticated ? <Home auth={auth} /> : <Navigate to="/login" />
                    }
                />
                <Route
                    path="/projects/:id"
                    element={
                        isAuthenticated ? <ProjectDetail auth={auth} /> : <Navigate to="/login" />
                    }
                />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;
