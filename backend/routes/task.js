const router = require("express").Router();
const Task = require("../models/Task");
const {auth} = require("../middleware/auth");

// Create task
router.post("/", auth, async (req, res) => {
  try {
    // 🔒 Only admin can create task
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Only admin can create tasks" });
    }

    const task = await Task.create(req.body);
    res.json(task);

  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all tasks
router.get("/", auth, async (req,res)=>{
  const tasks = await Task.find().populate("assignedTo");
  res.json(tasks);
});

// Update
router.put("/:id", auth, async (req,res)=>{
  const task = await Task.findByIdAndUpdate(
  req.params.id,
  req.body,
  { returnDocument: "after" }
);
  res.json(task);
});
router.put("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    // 🔒 Only admin OR assigned user
    if (
      req.user.role !== "admin" &&
      task.assignedTo.toString() !== req.user.id
    ) {
      return res.status(403).json({ msg: "Not allowed" });
    }

    task.status = req.body.status;
    await task.save();

    res.json(task);

  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;