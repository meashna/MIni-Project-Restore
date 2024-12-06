// server.js
require('dotenv').config(); // Load environment variables from .env

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import CORS
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const todoRoutes = require('./routes/todo');

const app = express();


app.use(express.json());


const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
    origin: corsOrigin, // Frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));


app.get('/', (req, res) => {
    res.send('Server is running!');
});
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/todos', todoRoutes);

// Database Connection and Server Initialization
if (process.env.NODE_ENV !== 'test') {
    mongoose
        .connect(process.env.MONGO_URI)
        .then(() => {
            console.log('Connected to MongoDB');
            const PORT = process.env.PORT || 3000;
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        })
        .catch((err) => {
            console.error('MongoDB connection error:', err);
        });
}

module.exports = app; // Exporting for testing purposes
