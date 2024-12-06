const express = require("express");
const { body } = require("express-validator");
const projectController = require("../controllers/projectController");

const router = express.Router();

router.post(
  "/",
  [
    body("title")
      .notEmpty()
      .withMessage("Title is required")
      .isString()
      .withMessage("Title must be a string"),
  ],
  projectController.createProject
);

router.get("/", projectController.getAllProjects);

router.get("/:id", projectController.getProjectById);

router.put(
  "/:id",
  [
    body("title")
      .notEmpty()
      .withMessage("Title is required")
      .isString()
      .withMessage("Title must be a string"),
  ],
  projectController.updateProjectTitle
);

router.delete("/:id", projectController.deleteProject);

router.post("/:id/export", projectController.exportProjectSummary);

router.get('/:id/todos/deleted', projectController.getDeletedTodos);

module.exports = router;
