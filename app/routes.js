const express = require("express"),
    ModuleController = require("../app/controller/moduleController"),
    AssignmentController = require("../app/controller/assignmentController");

const router = express.Router();

// Module management
router.post("/modules", ModuleController.createModule);
router.put("/modules/:moduleId", ModuleController.updateModule);
router.get("/modules", ModuleController.listModules);
router.get("/modules/:moduleId", ModuleController.getModule);

// Assignment management
router.post("/assignments", AssignmentController.assignModule);
router.get("/assignments", AssignmentController.listAssignments);
router.patch("/assignments/:assignmentId", AssignmentController.updateAssignment);

module.exports = router;

