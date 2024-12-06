const { validationResult } = require('express-validator');
const User = require('../models/User');

const parseBasicAuth = (authHeader) => {
    console.log(`Parsing Authorization Header: ${authHeader}`);
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        console.log('Authorization header is missing or does not start with "Basic "');
        return null;
    }
    const base64Credentials = authHeader.split(' ')[1];
    try {
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        console.log(`Decoded credentials: ${credentials}`);
        const [username, password] = credentials.split(':');
        if (!username || !password) {
            console.log('Username or password missing in decoded credentials');
            return null;
        }
        return { username, password };
    } catch (err) {
        console.error('Error decoding credentials:', err);
        return null;
    }
};

// Register a new user
exports.register = async (req, res) => {
    console.log('Register endpoint called');
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { username, password } = req.body;
        console.log(`Registering user with username: ${username}`);

        // Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log(`Username "${username}" already exists`);
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Create a new user
        const user = new User({ username, password });
        await user.save();
        console.log('User saved successfully:', user);

        // Generate Basic Auth token
        const base64Token = Buffer.from(`${username}:${password}`).toString('base64');
        const authHeader = `Basic ${base64Token}`;

        // Log the generated Authorization header
        console.log(`Generated Authorization Header: ${authHeader}`);

        // Respond with the Authorization header
        res.status(201).json({
            message: 'User registered successfully',
            authorization: authHeader, // Include Authorization header in response
        });
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ error: err.message });
    }
};

// Login an existing user using Basic Auth
exports.login = async (req, res) => {
    console.log('Login endpoint called');
    try {
        const authHeader = req.headers['authorization'];
        console.log(`Received Authorization Header: ${authHeader}`);
        const credentials = parseBasicAuth(authHeader);

        if (!credentials) {
            console.log('Invalid or missing Authorization header');
            return res.status(400).json({ message: 'Authorization header missing or malformed' });
        }

        const { username, password } = credentials;
        console.log(`Attempting to login user: ${username}`);

        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            console.log(`User with username "${username}" not found`);
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare passwords
        const isMatch = await user.comparePassword(password);
        console.log(`Password match status: ${isMatch}`);
        if (!isMatch) {
            console.log('Invalid credentials provided');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log(`User "${username}" logged in successfully`);
        res.status(200).json({ message: 'Logged in successfully' });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: err.message });
    }
};
