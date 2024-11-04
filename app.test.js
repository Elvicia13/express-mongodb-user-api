const request = require('supertest');
const { app, connectDB } = require('./app');
const mongoose = require('mongoose');

// Ensure database connection is established before running tests
beforeAll(async () => {
    await connectDB(); // Connect to MongoDB
});

// Clear the database after each test to avoid data carryover
afterEach(async () => {
    if (mongoose.connection.readyState === 1) { // Check if connection is established
        await mongoose.connection.db.collection('users').deleteMany({});
    }
});

// Close database connection after all tests
afterAll(async () => {
    if (mongoose.connection.readyState === 1) { // Check if connection is still open
        await mongoose.connection.db.dropDatabase(); // Drop the test database
        await mongoose.connection.close(); // Close the connection
    }
});

describe('User API', () => {
    let userId;

    it('should create a user', async () => {
        const res = await request(app)
            .post('/users')
            .send({ name: 'Elvicia Pinto', email: 'elviciampinto@gmail.com' });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body).toHaveProperty('name', 'Elvicia Pinto');
        userId = res.body._id;
    });

    it('should update a user', async () => {
        const createRes = await request(app)
            .post('/users')
            .send({ name: 'Elston Pinto', email: 'elstonpinto@gmail.com' });
        userId = createRes.body._id;

        const res = await request(app)
            .put(`/users/${userId}`)
            .send({ name: 'Elston Pinto' });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('name', 'Elston Pinto');
    });

    it('should get list of users', async () => {
        await request(app)
            .post('/users')
            .send({ name: 'Anisha Dsouza', email: 'anishadsz@gmail.com' });

        const res = await request(app).get('/users');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBe(1); // Only one user should be present
    });
});
