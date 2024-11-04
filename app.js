
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
require('dotenv').config(); // Load environment variables

const app = express();
app.use(morgan('dev'));
app.use(bodyParser.json());

const isTest = process.env.NODE_ENV === 'test'; // Check if running in test mode

// MongoDB connection helper
// MongoDB connection helper
const connectDB = async () => {
    const uri = isTest ? 'mongodb://localhost:27017/usersTestDB' : (process.env.MONGODB_URI || 'mongodb://localhost:27017/usersDB');
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');
    }
};

connectDB().catch(console.error);

// User Schema and Model
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }
});
const User = mongoose.model('User', userSchema);


// Routes
app.post('/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.put('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Server
if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
}

module.exports = { app, connectDB }; // Export app and connectDB for testing
