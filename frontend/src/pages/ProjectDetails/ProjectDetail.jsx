
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { BsUpload } from 'react-icons/bs';
import createApi from '../../services/api';
import TodoList from '../../components/TodoList/TodoList';
import styles from './ProjectDetails.module.css';
import Swal from 'sweetalert2';

function ProjectDetail({ auth }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const api = createApi(auth.username, auth.password);
    const [project, setProject] = useState(null);
    const [title, setTitle] = useState('');
    const [editing, setEditing] = useState(false);
    const [gistUrl, setGistUrl] = useState('');

    useEffect(() => {
        fetchProject();
    }, []);

    const fetchProject = async () => {
        try {
            const response = await api.get(`/projects/${id}`);
            setProject(response.data);
            setTitle(response.data.title);
        } catch (err) {
            console.error('Failed to fetch project:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch the project details.',
                confirmButtonText: 'Close',
            });
        }
    };

    const handleUpdateTitle = async () => {
        if (!title || title === project.title) {
            setEditing(false);
            return;
        }

        try {
            const response = await api.put(`/projects/${id}`, { title });
            Swal.fire({
                icon: 'success',
                title: 'Title Updated',
                text: 'Project title has been successfully updated.',
                confirmButtonText: 'Great!',
            });
            setProject(response.data);
            setEditing(false);
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to update the project title. Please try again later.',
                confirmButtonText: 'Close',
            });
            console.error(err);
        }
    };

    const handleDeleteProject = async () => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You won’t be able to recover this project!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/projects/${id}`);
                    Swal.fire('Deleted!', 'Your project has been deleted.', 'success');
                    navigate('/');
                } catch (err) {
                    console.error('Failed to delete project:', err);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to delete the project. Please try again later.',
                        confirmButtonText: 'Close',
                    });
                }
            }
        });
    };

    const handleExportGist = async () => {
        try {
            const response = await api.post(`/projects/${id}/export`);
            setGistUrl(response.data.gistUrl);
            Swal.fire({
                icon: 'success',
                title: 'Gist Exported',
                text: 'Project exported successfully as a Gist.',
                confirmButtonText: 'View Gist',
            });
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to export the project as a Gist.',
                confirmButtonText: 'Close',
            });
            console.error(err);
        }
    };

    if (!project) return <p className={styles.loading}>Loading...</p>;

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>
                {editing ? (
                    <div className={styles.editContainer}>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={styles.input}
                            autoFocus
                        />
                        <button
                            onClick={handleUpdateTitle}
                            className={styles.updateButton}
                            title="Update Title"
                        >
                            Update
                        </button>
                    </div>
                ) : (
                    <span onClick={() => setEditing(true)} className={styles.title}>
                        {project.title} <FaEdit className={styles.editIcon} />
                    </span>
                )}
            </h2>
            <div className={styles.actions}>
                <button
                    onClick={handleDeleteProject}
                    className={`${styles.iconButton} ${styles.deleteButton}`}
                    title="Delete Project"
                >
                    <FaTrashAlt />
                </button>
                <button
                    onClick={handleExportGist}
                    className={`${styles.iconButton} ${styles.exportButton}`}
                    title="Export Project Summary as Gist"
                >
                    <BsUpload />
                </button>
            </div>
            {gistUrl && (
                <p className={styles.gistUrl}>
                    Gist Created:{' '}
                    <a href={gistUrl} target="_blank" rel="noopener noreferrer">
                        {gistUrl}
                    </a>
                </p>
            )}
            <TodoList project={project} auth={auth} refreshProject={fetchProject} />
        </div>
    );
}

export default ProjectDetail;
