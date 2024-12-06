import React, { useState } from 'react';
import createApi from '../../services/api';
import styles from './TodoItem.module.css';
import Swal from 'sweetalert2';
import { FaPen, FaTrash } from "react-icons/fa";

const TodoItem=({ todo, auth, refreshTodos, deleteTodo })=> {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(todo.description);
  const [status, setStatus] = useState(todo.status);
  const [completedDate, setCompletedDate] = useState(todo.completedDate); 
  const api = createApi(auth.username, auth.password);

  const handleUpdate = async () => {
    if (!description) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Description cannot be empty!',
        confirmButtonText: 'Okay',
      });
      return;
    }
    try {
      const response = await api.put(`/todos/${todo._id}`, { description, status });
      refreshTodos(response.data); 
      setIsEditing(false);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update the todo. Please try again later.',
        confirmButtonText: 'Close',
      });
      console.error(err);
    }
  };

  const handleDelete = async () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action will delete  to do temp.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/todos/${todo._id}`);
          deleteTodo(todo._id); // Update parent state
          Swal.fire({
            icon: 'success',
            title: 'Deleted',
            text: 'Todo deleted successfully.',
            confirmButtonText: 'Okay',
          });
        } catch (err) {
          console.error('Failed to delete todo:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to delete the todo. Please try again later.',
            confirmButtonText: 'Close',
          });
        }
      }
    });
  };
  

  const toggleStatus = async () => {
    const newStatus = status === 'Pending' ? 'Completed' : 'Pending';
    const newCompletedDate = newStatus === 'Completed' ? new Date().toISOString() : null; // Update completedDate based on status

    try {
      const response = await api.put(`/todos/${todo._id}`, {
        status: newStatus,
        completedDate: newCompletedDate, // Send completedDate to backend
      });

      refreshTodos(response.data); // Update the parent state
      setStatus(newStatus);
      setCompletedDate(newCompletedDate); // Update local state
    } catch (err) {
      console.error('Failed to update status.', err);
    }
  };

  return (
    <div className={styles.container}>
      <li className={styles.todoItem}>
        {isEditing ? (
          <div className={styles.editingContainer}>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.input}
            />
            <button onClick={handleUpdate} className={`${styles.button} ${styles.editButton}`}>
              Save
            </button>
            <button onClick={() => setIsEditing(false)} className={`${styles.button} ${styles.deleteButton}`}>
              Cancel
            </button>
          </div>
        ) : (
          <div className={styles.viewContainer}>
            <span
              className={`${styles.description} ${status === 'Completed' ? styles.completed : ''}`}
            >
              {todo.description}
            </span>
            <div className={styles.metadata}>
              <div>
                <strong>Status:</strong> {todo.status}
              </div>
              <div>
                <strong>Created:</strong> {new Date(todo.createdDate).toISOString().split('T')[0]}
              </div>
              {completedDate && (
                <div>
                  <strong>Completed:</strong> {new Date(completedDate).toISOString().split('T')[0]}
                </div>
              )}
            </div>

            <div className={styles.actions}>
              <input
                type="checkbox"
                checked={status === 'Completed'}
                onChange={toggleStatus}
                className={styles.checkbox}
              />
              <FaPen
                onClick={() => status !== 'Completed' && setIsEditing(true)} // Disable edit if completed
                className={`${styles.editIcon} ${status === 'Completed' ? styles.disabled : ''}`}
              />
              <FaTrash
                onClick={() => status !== 'Completed' && handleDelete()} // Disable delete if completed
                className={`${styles.deleteIcon} ${status === 'Completed' ? styles.disabled : ''}`}
              />
            </div>
          </div>
        )}
      </li>
    </div>
  );
}

export default TodoItem;
