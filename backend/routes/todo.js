const express = require("express");
const { body } = require("express-validator");
const todoController = require("../controllers/todoController");

const router = express.Router();

router.post(
  "/:projectId",
  [
    body("description")
      .isString()
      .notEmpty()
      .withMessage("Description is required"),
  ],
  todoController.addTodo
);

router.put(
  "/:todoId",
  [
    body("description")
      .optional()
      .isString()
      .notEmpty()
      .withMessage("Description must be a string"),
    body("status")
      .optional()
      .isIn(["Pending", "Completed"])
      .withMessage("Status must be Pending or Completed"),
  ],
  todoController.updateTodo
);

router.delete("/:todoId", todoController.deleteTodo);
router.delete("/:todoId/permanent", todoController.deleteTodoPermanently);

router.post('/:todoId/restore', todoController.restoreTodo);


module.exports = router;
