const express = require("express"),
    UserController = require("../app/controller/userController");
    PollController = require("../app/controller/pollController");

const router = express.Router();
router.post("/poll/create", PollController.createPoll);
router.get("/poll/get", PollController.getPollDetails);
router.get("/poll/list", PollController.getPollList);
router.put("/poll/deactivate", PollController.deactivatePoll);
router.delete("/poll/delete", PollController.delatePoll);
router.get("/poll/deactivate", PollController.getDeactivatedPoll);
router.post("/poll/update", PollController.updatePoll);

module.exports = router;

