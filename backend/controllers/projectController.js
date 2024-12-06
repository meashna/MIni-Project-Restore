const { validationResult } = require('express-validator'); 
const Project = require('../models/Project');
const Todo = require('../models/Todo');
const { createGist } = require('../services/githubService');
const fs = require('fs');
const path = require('path');
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

exports.createProject = async (req, res) => {
    console.log('Create Project endpoint called');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await authenticate(req);
        if (!user) {
            console.log('Unauthorized access attempt');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { title } = req.body;
        console.log(`Creating project with title: ${title} for user: ${user.username}`);

        const project = new Project({ title, user: user._id });
        await project.save();

        console.log('Project created successfully:', project);
        res.status(201).json(project);
    } catch (err) {
        console.error('Error creating project:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getAllProjects = async (req, res) => {
    console.log('Get All Projects endpoint called');
    try {
        const user = await authenticate(req);
        if (!user) {
            console.log('Unauthorized access attempt');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        console.log(`Fetching all projects for user: ${user.username}`);
        //const projects = await Project.find({ user: user._id }).populate('todos');
        const projects = await Project.find({ user: user._id }).populate({
            path: 'todos',
            match: { deleted: false }
        });
        console.log(`Retrieved ${projects.length} projects`);
        res.status(200).json(projects);
    } catch (err) {
        console.error('Error retrieving projects:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getProjectById = async (req, res) => {
    console.log('Get Project By ID endpoint called');
    try {
        const user = await authenticate(req);
        if (!user) {
            console.log('Unauthorized access attempt');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        console.log(`Fetching project with ID: ${req.params.id}`);
        const project = await Project.findOne({ _id: req.params.id, user: user._id }).populate({
            path: 'todos',
            match: { deleted: false }
        });
        if (!project) {
            console.log('Project not found');
            return res.status(404).json({ message: 'Project not found' });
        }

        console.log('Project retrieved successfully:', project);
        res.status(200).json(project);
    } catch (err) {
        console.error('Error retrieving project:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateProjectTitle = async (req, res) => {
    console.log('Update Project Title endpoint called');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await authenticate(req);
        if (!user) {
            console.log('Unauthorized access attempt');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { title } = req.body;
        console.log(`Updating project ID: ${req.params.id} with new title: ${title}`);

        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, user: user._id },
            { title },
            { new: true }
        ).populate('todos');

        if (!project) {
            console.log('Project not found');
            return res.status(404).json({ message: 'Project not found' });
        }

        console.log('Project updated successfully:', project);
        res.status(200).json(project);
    } catch (err) {
        console.error('Error updating project title:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteProject = async (req, res) => {
    console.log('Delete Project endpoint called');
    try {
        const user = await authenticate(req);
        if (!user) {
            console.log('Unauthorized access attempt');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        console.log(`Deleting project with ID: ${req.params.id}`);
        const project = await Project.findOneAndDelete({ _id: req.params.id, user: user._id });

        if (!project) {
            console.log('Project not found');
            return res.status(404).json({ message: 'Project not found' });
        }

        console.log('Deleting associated todos...');
        await Todo.deleteMany({ _id: { $in: project.todos } });
        console.log('Todos deleted successfully');

        console.log('Project deleted successfully');
        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (err) {
        console.error('Error deleting project:', err);
        res.status(500).json({ error: err.message });
    }
};


// Get all deleted todos for a project
exports.getDeletedTodos = async (req, res) => {
    console.log('Get Deleted Todos endpoint called');
    try {
        const user = await authenticate(req);
        if (!user) {
            console.log('Unauthorized access attempt');
            return res.status(401).json({ message: 'Unauthorized' });
        }
        
        const projectId = req.params.id;
        console.log(`Fetching deleted todos for project ID: ${projectId} for user: ${user.username}`);
        
        // Find the project
        const project = await Project.findOne({ _id: projectId, user: user._id });
        if (!project) {
            console.log('Project not found');
            return res.status(404).json({ message: 'Project not found' });
        }
        
        // Find deleted todos with more detailed selection
        const deletedTodos = await Todo.find({ 
            project: projectId, 
            deleted: true 
        }).sort({ updatedDate: -1 }); // Optional: sort by most recently deleted
        
        console.log(`Retrieved ${deletedTodos.length} deleted todos`);
        res.status(200).json(deletedTodos);
    } catch (err) {
        console.error('Error retrieving deleted todos:', err);
        res.status(500).json({ error: err.message });
    }
};



exports.exportProjectSummary = async (req, res) => {
    try {
        const user = await authenticate(req);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const projectId = req.params.id;

        const project = await Project.findOne({ _id: projectId, user: user._id }).populate('todos');
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const totalTodos = project.todos.length;
        const completedTodos = project.todos.filter(todo => todo.status === 'Completed').length;
        const pendingTodos = project.todos.filter(todo => todo.status === 'Pending');

        // Generate Markdown Content
        let markdown = `# ${project.title}\n\n`;
        markdown += `**Summary:** ${completedTodos} / ${totalTodos} completed.\n\n`;

        markdown += `## Pending\n`;
        pendingTodos.forEach(todo => {
            markdown += `- [ ] ${todo.description} (Created: ${new Date(todo.createdDate).toDateString()})\n`;
        });

        markdown += `\n## Completed \n`;
        project.todos
            .filter(todo => todo.status === 'Completed')
            .forEach(todo => {
                markdown += `- [x] ${todo.description} (Completed: ${new Date(todo.updatedDate).toDateString()})\n`;
            });

        const fileName = `${project.title.replace(/\s+/g, '_')}.md`;

        if (process.env.NODE_ENV !== 'production') {
            const filePath = path.join(__dirname, '..', 'exports', fileName);

            try {
                fs.mkdirSync(path.dirname(filePath), { recursive: true });
                fs.writeFileSync(filePath, markdown, 'utf8');
                console.log(`Exported project "${project.title}" to local file: ${filePath}`);
            } catch (fileErr) {
                console.error('Failed to write Markdown file locally:', fileErr);
            }
        }


        const gist = await createGist(
            `Project Summary: ${project.title}`,
            {
                [fileName]: {
                    content: markdown,
                },
            },
            false // false for secret gist
        );

        res.status(200).json({ message: 'Gist created successfully', gistUrl: gist.html_url });
    } catch (err) {
        console.error('Error exporting project summary:', err);
        res.status(500).json({ error: err.message });
    }
};

