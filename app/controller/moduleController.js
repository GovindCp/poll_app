const ModuleModel = require('../model/module');
const validator = require('../../validators/reqValidator');

function ensureAdmin(user) {
  return user && user.role === 'admin';
}

function buildArtifactPayload(artifacts = []) {
  return artifacts.map((artifact, index) => ({
    title: artifact.title,
    description: artifact.description,
    type: artifact.type || 'document',
    url: artifact.url,
    content: artifact.content,
    order: typeof artifact.order === 'number' ? artifact.order : index,
    estimatedDurationMins: artifact.estimatedDurationMins,
    metadata: artifact.metadata
  }));
}

function createModule(req, res) {
  if (!ensureAdmin(req.currentUser)) {
    return res.status(403).send({ success: false, message: 'Only admins can create modules' });
  }

  const payload = Object.assign({}, req.body);
  payload.createdBy = req.currentUser._id;

  validator.createModuleValidate(payload).then(() => {
    const moduleDoc = new ModuleModel({
      title: payload.title,
      description: payload.description,
      createdBy: req.currentUser._id,
      tags: Array.isArray(payload.tags) ? payload.tags : [],
      estimatedDurationMins: payload.estimatedDurationMins,
      artifacts: buildArtifactPayload(payload.artifacts)
    });
    return moduleDoc.save();
  }).then((moduleData) => {
    return res.status(201).send({ success: true, data: moduleData });
  }).catch((err) => {
    return res.status(400).send({ success: false, message: err.message || err.errmsg || err });
  });
}

function updateModule(req, res) {
  if (!ensureAdmin(req.currentUser)) {
    return res.status(403).send({ success: false, message: 'Only admins can update modules' });
  }

  const moduleId = req.params.moduleId;
  const payload = Object.assign({}, req.body, { moduleId });

  validator.updateModuleValidate(payload).then(() => {
    return ModuleModel.findById(moduleId);
  }).then((moduleDoc) => {
    if (!moduleDoc) {
      throw 'Module not found';
    }

    if (typeof req.body.title === 'string') {
      moduleDoc.title = req.body.title;
    }
    if (typeof req.body.description === 'string') {
      moduleDoc.description = req.body.description;
    }
    if (Array.isArray(req.body.tags)) {
      moduleDoc.tags = req.body.tags;
    }
    if (typeof req.body.estimatedDurationMins === 'number') {
      moduleDoc.estimatedDurationMins = req.body.estimatedDurationMins;
    }
    if (typeof req.body.isActive === 'boolean') {
      moduleDoc.isActive = req.body.isActive;
    }
    if (Array.isArray(req.body.artifacts)) {
      moduleDoc.artifacts = buildArtifactPayload(req.body.artifacts);
    }

    return moduleDoc.save();
  }).then((updatedModule) => {
    return res.status(200).send({ success: true, data: updatedModule });
  }).catch((err) => {
    return res.status(400).send({ success: false, message: err.message || err.errmsg || err });
  });
}

function getModule(req, res) {
  const moduleId = req.params.moduleId;

  validator.getModuleValidate({ moduleId }).then(() => {
    const query = { _id: moduleId };
    if (!ensureAdmin(req.currentUser)) {
      query.isActive = true;
    }
    return ModuleModel.findOne(query);
  }).then((moduleDoc) => {
    if (!moduleDoc) {
      return res.status(404).send({ success: false, message: 'Module not found' });
    }
    return res.status(200).send({ success: true, data: moduleDoc });
  }).catch((err) => {
    return res.status(400).send({ success: false, message: err.message || err.errmsg || err });
  });
}

function listModules(req, res) {
  const query = {};
  if (!ensureAdmin(req.currentUser)) {
    query.isActive = true;
  } else if (typeof req.query.isActive !== 'undefined') {
    query.isActive = req.query.isActive === 'true';
  }

  if (req.query.search) {
    query.title = new RegExp(req.query.search, 'i');
  }

  ModuleModel.find(query).sort({ createdAt: -1 }).then((modules) => {
    return res.status(200).send({ success: true, data: modules });
  }).catch((err) => {
    return res.status(400).send({ success: false, message: err.message || err.errmsg || err });
  });
}

module.exports = {
  createModule,
  updateModule,
  getModule,
  listModules
};
