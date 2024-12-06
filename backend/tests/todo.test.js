
const request = require('supertest');
const setup = require('./setup'); 
const app = require('../server');
const Todo = require('../models/Todo');
const Project = require('../models/Project');
const User = require('../models/User');

describe('Todo Controller', () => {
    let user;
    let project;

    beforeAll(async () => {
        await setup.connect();
    });


    beforeEach(async () => {

        user = new User({ username: 'testuser', password: 'testpassword' });
        await user.save();


        project = new Project({ title: 'Test Project', user: user._id, todos: [] });
        await project.save();
    });


    afterEach(async () => {
        await setup.clearDatabase();
    });


    afterAll(async () => {
        await setup.closeDatabase();
    });

    it('should add a new todo to a project', async () => {
        const res = await request(app)
            .post(`/api/todos/${project._id}`)
            .set('Authorization', 'Basic ' + Buffer.from('testuser:testpassword').toString('base64'))
            .send({ description: 'Test Todo' });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.description).toBe('Test Todo');
    });

    it('should update an existing todo', async () => {

        const newTodo = new Todo({ description: 'Initial Todo', project: project._id });
        await newTodo.save();
        project.todos.push(newTodo._id);
        await project.save();

        const res = await request(app)
            .put(`/api/todos/${newTodo._id}`)
            .set('Authorization', 'Basic ' + Buffer.from('testuser:testpassword').toString('base64'))
            .send({ description: 'Updated Todo', status: 'Completed' });

        expect(res.statusCode).toBe(200);
        expect(res.body.description).toBe('Updated Todo');
        expect(res.body.status).toBe('Completed');
    });

    it('should delete an existing todo', async () => {

        const newTodo = new Todo({ description: 'To Delete Todo', project: project._id });
        await newTodo.save();
        project.todos.push(newTodo._id);
        await project.save();

        const res = await request(app)
            .delete(`/api/todos/${newTodo._id}`)
            .set('Authorization', 'Basic ' + Buffer.from('testuser:testpassword').toString('base64'));

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Todo deleted successfully');

        const deletedTodo = await Todo.findById(newTodo._id);
        expect(deletedTodo).toBeNull();
    });
});
