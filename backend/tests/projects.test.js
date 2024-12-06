const request = require("supertest");
const setup = require("./setup");
const app = require("../server");
const Project = require("../models/Project");
const User = require("../models/User");

describe("Project Controller", () => {
  let user;
  let authHeader;
  let project;

  beforeAll(async () => {
    await setup.connect();
  });

  beforeEach(async () => {
    user = new User({ username: "testuser", password: "testpassword" });
    await user.save();

    authHeader =
      "Basic " + Buffer.from("testuser:testpassword").toString("base64");

    project = new Project({ title: "Test Project", user: user._id, todos: [] });
    await project.save();
  });

  afterEach(async () => {
    await setup.clearDatabase();
  });

  afterAll(async () => {
    await setup.closeDatabase();
  });

  describe("POST /api/projects", () => {
    it("should create a new project", async () => {
      const res = await request(app)
        .post("/api/projects")
        .set("Authorization", authHeader)
        .send({ title: "New Project" });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("_id");
      expect(res.body.title).toBe("New Project");
      expect(res.body.user).toBe(user._id.toString());
    });

    it("should fail to create a project without a title", async () => {
      const res = await request(app)
        .post("/api/projects")
        .set("Authorization", authHeader)
        .send({}); // Missing title

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("errors");
      expect(res.body.errors[0].msg).toBe("Title is required");
    });
  });

  describe("GET /api/projects", () => {
    it("should retrieve all projects for the authenticated user", async () => {
      const projectsData = [
        { title: "Project One", user: user._id },
        { title: "Project Two", user: user._id },
      ];

      await Project.insertMany(projectsData);

      const res = await request(app)
        .get("/api/projects")
        .set("Authorization", authHeader);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(3);
      expect(res.body[0]).toHaveProperty("title", "Test Project");
      expect(res.body[1]).toHaveProperty("title", "Project One");
      expect(res.body[2]).toHaveProperty("title", "Project Two");
    });

    it("should return an empty array if no projects exist", async () => {
      await Project.deleteMany({});

      const res = await request(app)
        .get("/api/projects")
        .set("Authorization", authHeader);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe("GET /api/projects/:id", () => {
    it("should retrieve a specific project by ID", async () => {
      const res = await request(app)
        .get(`/api/projects/${project._id}`)
        .set("Authorization", authHeader);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("title", "Test Project");
      expect(res.body.user).toBe(user._id.toString());
    });

    it("should return 404 if the project does not exist", async () => {
      const nonExistentId = new User()._id;

      const res = await request(app)
        .get(`/api/projects/${nonExistentId}`)
        .set("Authorization", authHeader);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "Project not found");
    });
  });

  describe("PUT /api/projects/:id", () => {
    it("should update the project title", async () => {
      const res = await request(app)
        .put(`/api/projects/${project._id}`)
        .set("Authorization", authHeader)
        .send({ title: "Updated Title" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("title", "Updated Title");
    });

    it("should fail to update the project without a title", async () => {
      const res = await request(app)
        .put(`/api/projects/${project._id}`)
        .set("Authorization", authHeader)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("errors");
      expect(res.body.errors[0].msg).toBe("Title is required");
    });

    it("should return 404 when updating a non-existent project", async () => {
      const nonExistentId = new User()._id;

      const res = await request(app)
        .put(`/api/projects/${nonExistentId}`)
        .set("Authorization", authHeader)
        .send({ title: "Non-existent Project" });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "Project not found");
    });
  });

  describe("DELETE /api/projects/:id", () => {
    it("should delete an existing project", async () => {
      const res = await request(app)
        .delete(`/api/projects/${project._id}`)
        .set("Authorization", authHeader);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty(
        "message",
        "Project deleted successfully"
      );

      const deletedProject = await Project.findById(project._id);
      expect(deletedProject).toBeNull();
    });

    it("should return 404 when deleting a non-existent project", async () => {
      const nonExistentId = new User()._id;

      const res = await request(app)
        .delete(`/api/projects/${nonExistentId}`)
        .set("Authorization", authHeader);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "Project not found");
    });
  });
});
