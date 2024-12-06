import React, { useState, useEffect } from "react";
import styles from "./TodoList.module.css";
import TodoItem from "../TodoItem/TodoItem";
import createApi from "../../services/api";
import Swal from "sweetalert2";

const TodoList = ({ project, auth }) => {
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [todos, setTodos] = useState(project.todos);
  const [deletedTodos, setDeletedTodos] = useState([]);
  const api = createApi(auth.username, auth.password);

  // Fetch deleted todos when the component mounts
  useEffect(() => {
    fetchDeletedTodos();
  }, []);

  const fetchDeletedTodos = async () => {
    try {
      const response = await api.get(`/projects/${project._id}/todos/deleted`);
      setDeletedTodos(response.data);
    } catch (err) {
      console.error("Failed to fetch deleted todos:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch deleted todos.",
        confirmButtonText: "Close",
      });
    }
  };

  const handleRestoreTodo = async (todoId) => {
    try {
      const response = await api.post(`/todos/${todoId}/restore`);
      const restoredTodo = response.data.todo; // Adjust based on API response

      // Remove the restored todo from deletedTodos
      setDeletedTodos((prevDeleted) =>
        prevDeleted.filter((todo) => todo._id !== todoId)
      );

      // Add the restored todo to the active todos list
      setTodos((prevTodos) => [restoredTodo, ...prevTodos]);

      Swal.fire({
        icon: "success",
        title: "Restored",
        text: "Todo restored successfully.",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to restore the todo. Please try again later.",
      });
      console.error(err);
    }
  };
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!description) {
      setError("Description cannot be empty.");
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Description cannot be empty!",
        confirmButtonText: "Okay",
      });
      return;
    }
    try {
      const response = await api.post(`/todos/${project._id}`, { description });
      const newTodo = response.data;
      setTodos((prevTodos) => [newTodo, ...prevTodos]);
      setDescription("");
      setError("");
    } catch (err) {
      console.error("Failed to add todo:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add the new todo. Please try again later.",
        confirmButtonText: "Close",
      });
    }
  };

  const deleteTodo = (todoId) => {
    // Find the deleted todo in the active list
    const deletedTodo = todos.find((todo) => todo._id === todoId);
    if (deletedTodo) {
      // Remove from active todos
      setTodos((prevTodos) => prevTodos.filter((todo) => todo._id !== todoId));
      // Add to deleted todos
      setDeletedTodos((prevDeletedTodos) => [deletedTodo, ...prevDeletedTodos]);
    }
  };

  const handlePermanentDelete = async (todoId) => {
    try {
      await api.delete(`/todos/${todoId}/permanent`);
      // Remove the todo from the deleted list
      setDeletedTodos((prevDeletedTodos) =>
        prevDeletedTodos.filter((todo) => todo._id !== todoId)
      );
      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Todo permanently deleted successfully.",
      });
    } catch (err) {
      console.error("Failed to permanently delete todo:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to permanently delete the todo. Please try again later.",
        confirmButtonText: "Close",
      });
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleAddTodo} className={styles.form}>
        <input
          type="text"
          placeholder="Describe what you need to do..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          Add Todo
        </button>
      </form>
      {todos.length === 0 ? (
        <p className={styles.noTodos}>No todos found.</p>
      ) : (
        <ul className={styles.todoList}>
          {todos.map((todo) => (
            <TodoItem
              key={todo._id}
              todo={todo}
              auth={auth}
              refreshTodos={(updatedTodo) =>
                setTodos((prevTodos) =>
                  prevTodos.map((t) =>
                    t._id === updatedTodo._id ? updatedTodo : t
                  )
                )
              }
              deleteTodo={deleteTodo} // Pass deleteTodo function
            />
          ))}
        </ul>
      )}
      <ul className={styles.deletedTodoList}>
        {deletedTodos.map((todo) => (
          <li key={todo._id} className={styles.deletedTodoItem}>
            <span className={styles.deletedDescription}>
              {todo.description}
            </span>
            <button
              onClick={() => handleRestoreTodo(todo._id)}
              className={styles.restoreButton}
              title="Restore Todo"
            >
              Restore
            </button>
            <button
              onClick={() => handlePermanentDelete(todo._id)}
              className={styles.permanentDeleteButton}
              title="Permanently Delete Todo"
            >
              Delete Permanently
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
