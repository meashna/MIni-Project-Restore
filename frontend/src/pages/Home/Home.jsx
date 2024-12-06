// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import createApi from '../../services/api';
import styles from './Home.module.css';
import ProjectList from '../../components/ProjectList/ProjectList';
import Swal from 'sweetalert2';

//function Home({ auth }) {
    const Home = ({ auth}) => {    
    const [projects, setProjects] = useState([]);
    const [title, setTitle] = useState('');
    const [error, setError] = useState('');
    const api = createApi(auth.username, auth.password);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects');
            const sortedProjects = response.data.sort(
                (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
            );
            setProjects(sortedProjects);
        } catch (err) {
            setError('Failed to fetch projects.');
            console.error(err);
        }
    };
    

    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!title) {
            setError('Project title cannot be empty.');
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Project title cannot be empty!',
                confirmButtonText: 'Okay',
            });
            return;
        }
        try {
            const response = await api.post('/projects', { title });
        setProjects([response.data, ...projects]);
            setTitle('');
            setError('');
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Project created successfully.',
                confirmButtonText: 'Continue!',
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create project.');
            console.error(err);
        }
    };

    if (!projects) return <p className={styles.loading}>Loading...</p>;

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>Projects</h2>
            {/* {error && <p className={styles.error}>{error}</p>} */}
            <form onSubmit={handleCreateProject} className={styles.form}>
                <input
                    type="text"
                    placeholder="Enter your project title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={styles.input}
                />
                <button type="submit" className={styles.button}>
                    Create Project
                </button>
            </form>
            <div className={styles.projectList}>
                <ProjectList projects={projects} refreshProjects={fetchProjects} auth={auth} />
            </div>
        </div>
    );
}

export default Home;
