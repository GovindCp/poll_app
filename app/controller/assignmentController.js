const AssignmentModel = require('../model/assignment');
const ModuleModel = require('../model/module');
const UserModel = require('../model/user');
const validator = require('../../validators/reqValidator');

function ensureAdmin(user) {
  return user && user.role === 'admin';
}

function assignModule(req, res) {
  if (!ensureAdmin(req.currentUser)) {
    return res.status(403).send({ success: false, message: 'Only admins can assign modules' });
  }

  const payload = Object.assign({}, req.body);
  if (payload.dueDate) {
    payload.dueDate = new Date(payload.dueDate);
  }

  validator.assignModuleValidate(payload).then(() => {
    return Promise.all([
      ModuleModel.findById(payload.moduleId),
      UserModel.findById(payload.userId)
    ]);
  }).then(([moduleDoc, userDoc]) => {
    if (!moduleDoc || !moduleDoc.isActive) {
      throw 'Module not found or inactive';
    }
    if (!userDoc || !userDoc.isActive) {
      throw 'User not found or inactive';
    }

    return AssignmentModel.findOne({
      module: moduleDoc._id,
      user: userDoc._id,
      status: { $in: ['assigned', 'in_progress'] }
    }).then((existingAssignment) => {
      if (existingAssignment) {
        throw 'An active assignment already exists for this user and module';
      }

      const artifactProgress = moduleDoc.artifacts.map((artifact) => ({
        artifactId: artifact._id,
        status: 'pending'
      }));

      const assignment = new AssignmentModel({
        module: moduleDoc._id,
        user: userDoc._id,
        assignedBy: req.currentUser._id,
        dueDate: payload.dueDate || null,
        notes: payload.notes,
        artifactProgress,
        progressSnapshot: {
          completedArtifacts: 0,
          totalArtifacts: artifactProgress.length
        }
      });

      return assignment.save();
    });
  }).then((assignmentDoc) => {
    return res.status(201).send({ success: true, data: assignmentDoc });
  }).catch((err) => {
    return res.status(400).send({ success: false, message: err.message || err.errmsg || err });
  });
}

function listAssignments(req, res) {
  const query = {};

  if (ensureAdmin(req.currentUser)) {
    if (req.query.userId) {
      query.user = req.query.userId;
    }
    if (req.query.moduleId) {
      query.module = req.query.moduleId;
    }
    if (req.query.status) {
      query.status = req.query.status;
    }
  } else {
    query.user = req.currentUser._id;
    if (req.query.status) {
      query.status = req.query.status;
    }
  }

  AssignmentModel.find(query)
    .populate('module')
    .populate('user', 'name email role department designation')
    .populate('assignedBy', 'name email')
    .sort({ createdAt: -1 })
    .then((assignments) => {
      return res.status(200).send({ success: true, data: assignments });
    }).catch((err) => {
      return res.status(400).send({ success: false, message: err.message || err.errmsg || err });
    });
}

function updateAssignment(req, res) {
  const assignmentId = req.params.assignmentId;
  const payload = Object.assign({}, req.body, { assignmentId });

  if (payload.dueDate) {
    payload.dueDate = new Date(payload.dueDate);
  }

  validator.updateAssignmentValidate(payload).then(() => {
    return AssignmentModel.findById(assignmentId).populate('module');
  }).then((assignment) => {
    if (!assignment) {
      return res.status(404).send({ success: false, message: 'Assignment not found' });
    }

    const isAdmin = ensureAdmin(req.currentUser);
    const currentUserId = req.currentUser && req.currentUser._id ? req.currentUser._id.toString() : '';
    const isOwner = assignment.user.toString() === currentUserId;

    if (!isAdmin && !isOwner) {
      return res.status(403).send({ success: false, message: 'You are not allowed to update this assignment' });
    }

    if (isAdmin && typeof req.body.dueDate !== 'undefined') {
      assignment.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
    }

    if (isAdmin && typeof req.body.status === 'string') {
      assignment.status = req.body.status;
      if (req.body.status === 'completed') {
        assignment.completedAt = assignment.completedAt || new Date();
      } else if (req.body.status !== 'completed') {
        assignment.completedAt = null;
      }
    }

    if (req.body.artifactId && typeof req.body.artifactStatus === 'string') {
      if (!isOwner && !isAdmin) {
        return res.status(403).send({ success: false, message: 'You are not allowed to update artifact progress' });
      }

      const artifactEntry = assignment.artifactProgress.find((artifact) => artifact.artifactId.toString() === req.body.artifactId);
      if (!artifactEntry) {
        return res.status(400).send({ success: false, message: 'Artifact not part of this assignment' });
      }
      const allowedStatuses = ['pending', 'in_progress', 'completed'];
      if (!allowedStatuses.includes(req.body.artifactStatus)) {
        return res.status(400).send({ success: false, message: 'Invalid artifact status' });
      }

      artifactEntry.status = req.body.artifactStatus;
      artifactEntry.completedAt = req.body.artifactStatus === 'completed' ? new Date() : null;
    }

    const stats = assignment.artifactProgress.reduce((acc, artifact) => {
      if (artifact.status === 'completed') {
        acc.completed += 1;
      } else if (artifact.status === 'in_progress') {
        acc.inProgress += 1;
      }
      return acc;
    }, { completed: 0, inProgress: 0 });

    assignment.progressSnapshot.totalArtifacts = assignment.artifactProgress.length;
    assignment.progressSnapshot.completedArtifacts = stats.completed;

    if (!isAdmin || !req.body.status) {
      if (stats.completed === assignment.artifactProgress.length && assignment.artifactProgress.length > 0) {
        assignment.status = 'completed';
        assignment.completedAt = assignment.completedAt || new Date();
      } else if (stats.inProgress > 0 || stats.completed > 0) {
        assignment.status = 'in_progress';
        assignment.completedAt = null;
      } else {
        assignment.status = 'assigned';
        assignment.completedAt = null;
      }
    }

    return assignment.save();
  }).then((updatedAssignment) => {
    if (!updatedAssignment) {
      return; // response already sent in branch above
    }
    return res.status(200).send({ success: true, data: updatedAssignment });
  }).catch((err) => {
    if (res.headersSent) {
      return;
    }
    return res.status(400).send({ success: false, message: err.message || err.errmsg || err });
  });
}

module.exports = {
  assignModule,
  listAssignments,
  updateAssignment
};
