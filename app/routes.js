const express = require("express"),
    UserController = require("./controller/userController"),
    PollController = require("./controller/pollController");

const router = express.Router();
router.post("/poll/create", PollController.createPoll);
router.get("/poll/get", PollController.getPollDetails);
router.get("/poll/list", PollController.getPollList);
router.put("/poll/deactivate", PollController.deactivatePoll);
router.delete("/poll/delete", PollController.deletePoll);
router.get("/poll/deactivate", PollController.getDeactivatedPoll);
router.post("/poll/update", PollController.updatePoll);

module.exports = router;

