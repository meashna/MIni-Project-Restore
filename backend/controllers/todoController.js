const Todo = require('../models/Todo');
const Project = require('../models/Project');
const User = require('../models/User');

const authenticate = async (req) => {
    console.log('Authenticating user...');
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        console.log('Authorization header missing or invalid');
        return null;
    }
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    console.log(`Authenticating username: ${username}`);

    const user = await User.findOne({ username });
    if (!user) {
        console.log('User not found');
        return null;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        console.log('Password mismatch');
        return null;
    }

    console.log('User authenticated successfully');
    return user;
};

// Add a new todo to a project
exports.addTodo = async (req, res) => {
    console.log('Add Todo endpoint called');
    try {
        const user = await authenticate(req);
        if (!user) {
            console.log('Unauthorized access attempt');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { description } = req.body;
        const projectId = req.params.projectId;
        console.log(`Adding todo to project ID: ${projectId} for user: ${user.username}`);

        // Find the project
        const project = await Project.findOne({ _id: projectId, user: user._id });
        if (!project) {
            console.log('Project not found');
            return res.status(404).json({ message: 'Project not found' });
        }

        // Create a new todo with the 'project' field
        const todo = new Todo({ description, project: projectId ,deleted: false});
        await todo.save();
        console.log('Todo created successfully:', todo);

        // Add todo to the project's todos list
        project.todos.push(todo._id);
        await project.save();
        console.log('Todo added to project successfully');

        res.status(201).json(todo);
    } catch (err) {
        console.error('Error adding todo:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateTodo = async (req, res) => {
    console.log('Update Todo endpoint called');
    try {
        const user = await authenticate(req);
        if (!user) {
            console.log('Unauthorized access attempt');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { description, status } = req.body;
        const todoId = req.params.todoId;
        console.log(`Updating todo ID: ${todoId} for user: ${user.username}`);

        // Find the project that contains this todo and belongs to the user
        const project = await Project.findOne({ user: user._id, todos: todoId });
        if (!project) {
            console.log('Todo not found in user projects');
            return res.status(404).json({ message: 'Todo not found in your projects' });
        }

        // Set completedDate based on status
        const completedDate = status === 'Completed' ? new Date() : null;

        // Update the todo
        const updatedTodo = await Todo.findByIdAndUpdate(
            todoId,
            { description, status, completedDate, updatedDate: Date.now() },
            { new: true }
        );

        if (!updatedTodo) {
            console.log('Todo not found');
            return res.status(404).json({ message: 'Todo not found' });
        }

        console.log('Todo updated successfully:', updatedTodo);
        res.status(200).json(updatedTodo);
    } catch (err) {
        console.error('Error updating todo:', err);
        res.status(500).json({ error: err.message });
    }
};


// Delete a todo
exports.deleteTodoPermanently = async (req, res) => {
    console.log('Delete Todo endpoint called');
    try {
        const user = await authenticate(req);
        if (!user) {
            console.log('Unauthorized access attempt');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const todoId = req.params.todoId;
        console.log(`Deleting todo ID: ${todoId} for user: ${user.username}`);

        // Find the project that contains this todo and belongs to the user
        const project = await Project.findOne({ user: user._id, todos: todoId });
        if (!project) {
            console.log('Todo not found in user projects');
            return res.status(404).json({ message: 'Todo not found in your projects' });
        }

        // Remove the todo from the project's todos array
        project.todos = project.todos.filter(id => id.toString() !== todoId);
        await project.save();
        console.log('Todo removed from project successfully');

        // Delete the todo
        const deletedTodo = await Todo.findByIdAndDelete(todoId);
        if (!deletedTodo) {
            console.log('Todo not found');
            return res.status(404).json({ message: 'Todo not found' });
        }

        console.log('Todo deleted successfully');
        res.status(200).json({ message: 'Todo deleted successfully' });
    } catch (err) {
        console.error('Error deleting todo:', err);
        res.status(500).json({ error: err.message });
    }
};
// Delete a todo
exports.deleteTodo = async (req, res) => {
    console.log('Delete Todo endpoint called');
    try {
        const user = await authenticate(req);
        if (!user) {
            console.log('Unauthorized access attempt');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const todoId = req.params.todoId;
        console.log(`Deleting todo ID: ${todoId} for user: ${user.username}`);

        // Find the project that contains this todo and belongs to the user
        const project = await Project.findOne({ user: user._id, todos: todoId });
        if (!project) {
            console.log('Todo not found in user projects');
            return res.status(404).json({ message: 'Todo not found in your projects' });
        }
        const updatedTodo = await Todo.findOneAndUpdate(
            { _id: todoId, project: project._id },
            { deleted: true, updatedDate: Date.now() },
            { new: true }
        );

        if (!updatedTodo) {
            console.log('Todo not found');
            return res.status(404).json({ message: 'Todo not found' });
        }

        console.log('Todo deleted successfully');
        res.status(200).json({ message: 'Todo deleted successfully' });
    } catch (err) {
        console.error('Error deleting todo:', err);
        res.status(500).json({ error: err.message });
    }
};
// Restore a deleted todo
exports.restoreTodo = async (req, res) => {
    console.log('Restore Todo endpoint called');
    try {
        const user = await authenticate(req);
        if (!user) {
            console.log('Unauthorized access attempt');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const todoId = req.params.todoId;
        console.log(`Restoring todo ID: ${todoId} for user: ${user.username}`);

        // Find the todo and ensure it belongs to a project owned by the user
        // const todo = await Todo.findOne({ _id: todoId, deleted: true }).populate({
        //     path: 'project',
        //     match: { user: user._id, deleted: false }
        // });

        // if (!todo || !todo.project) {
        //     console.log('Todo not found or does not belong to the user\'s active projects');
        //     return res.status(404).json({ message: 'Todo not found or cannot be restored' });
        // }

        // Restore the todo
        const todo = await Todo.findById({ _id: todoId, deleted: true });
        if (!todo) {
            console.log('Todo not found');
            return res.status(404).json({ message: 'Todo not found' });
        }
        
        todo.deleted = false;
        todo.updatedDate = Date.now();
        await todo.save();
        console.log('Todo restored successfully:', todo);

        res.status(200).json({ message: 'Todo restored successfully', todo });
    } catch (err) {
        console.error('Error restoring todo:', err);
        res.status(500).json({ error: err.message });
    }
};


