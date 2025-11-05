const validate = require("validate.js");
const mongoose = require("mongoose");

const ARTIFACT_TYPES = ['document', 'video', 'link', 'quiz', 'other'];
const ASSIGNMENT_STATUSES = ['assigned', 'in_progress', 'completed', 'overdue'];
const ARTIFACT_STATUSES = ['pending', 'in_progress', 'completed'];

const constraints = {
    userRegistration: {
        name: {
            presence: true
        },
        age: {
            presence: true
        },
        address: {
            presence: true
        },
        email: {
            presence: true,
            email: {
                message: "Not a valid email"
            }
        },
        role: {
            presence: true,
            inclusion: {
                within: ["admin", "employee"],
                message: "^Role must be either admin or employee"
            }
        },
        department: {
            length: {
                maximum: 120
            }
        },
        designation: {
            length: {
                maximum: 120
            }
        }
    },
    login: {
        email: {
            presence: true,
            length: {
                maximum: 75
            },
            email: {
                message: "Not a valid email"
            }
        },
        password: {
            presence: true
        }
    },
    forgotPasswordValidator: {
        email: {
            presence: true,
            length: {
                maximum: 75
            }
        }
    },
    verifyOtpValidator: {
        email: {
            presence: true,
            length: {
                maximum: 75
            }
        },
        otp: {
            presence: true,
            length: {
                maximum: 8
            }
        },
        newPassword: {
            presence: true
        },
        confirmPassword: {
            presence: true,
            equality: "newPassword"
        }
    },
    createModule: {
        title: {
            presence: true,
            length: {
                maximum: 150
            }
        },
        description: {
            length: {
                maximum: 2000
            }
        },
        artifacts: {
            presence: true
        }
    },
    updateModule: {
        moduleId: {
            presence: true
        },
        title: {
            length: {
                maximum: 150
            }
        },
        description: {
            length: {
                maximum: 2000
            }
        }
    },
    getModule: {
        moduleId: {
            presence: true
        }
    },
    assignModule: {
        moduleId: {
            presence: true
        },
        userId: {
            presence: true
        },
        notes: {
            length: {
                maximum: 500
            }
        }
    },
    updateAssignment: {
        assignmentId: {
            presence: true
        },
        notes: {
            length: {
                maximum: 500
            }
        }
    }
};

function assertObjectId(value, fieldName) {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        throw `${fieldName} is invalid`;
    }
}

function validateArtifacts(artifacts) {
    if (!Array.isArray(artifacts) || artifacts.length === 0) {
        throw "At least one artifact is required";
    }

    artifacts.forEach((artifact, index) => {
        if (!artifact || typeof artifact !== 'object') {
            throw `Artifact at position ${index + 1} is invalid`;
        }
        if (!artifact.title || artifact.title.trim() === "") {
            throw `Artifact at position ${index + 1} is missing title`;
        }
        if (artifact.type && !ARTIFACT_TYPES.includes(artifact.type)) {
            throw `Artifact type at position ${index + 1} is invalid`;
        }
        if ((!artifact.url || artifact.url.trim() === "") && (!artifact.content || artifact.content.trim() === "")) {
            throw `Artifact at position ${index + 1} must include either url or content`;
        }
    });
}

module.exports.userRegValidate = function (body) {
    return validate.async(body, constraints.userRegistration);
};

module.exports.loginValidator = function (body) {
    return validate.async(body, constraints.login);
};

module.exports.forgotPasswordValidator = function (body) {
    return validate.async(body, constraints.forgotPasswordValidator);
};

module.exports.verifyOtpValidator = function (body) {
    return validate.async(body, constraints.verifyOtpValidator);
};

module.exports.createModuleValidate = function (body) {
    return validate.async(body, constraints.createModule).then(() => {
        validateArtifacts(body.artifacts);
        return body;
    });
};

module.exports.updateModuleValidate = function (body) {
    return validate.async(body, constraints.updateModule).then(() => {
        assertObjectId(body.moduleId, 'moduleId');
        if (body.artifacts) {
            validateArtifacts(body.artifacts);
        }
        return body;
    });
};

module.exports.getModuleValidate = function (body) {
    return validate.async(body, constraints.getModule).then(() => {
        assertObjectId(body.moduleId, 'moduleId');
        return body;
    });
};

module.exports.assignModuleValidate = function (body) {
    return validate.async(body, constraints.assignModule).then(() => {
        assertObjectId(body.moduleId, 'moduleId');
        assertObjectId(body.userId, 'userId');
        if (body.dueDate && isNaN(new Date(body.dueDate).getTime())) {
            throw 'dueDate must be a valid date';
        }
        return body;
    });
};

module.exports.updateAssignmentValidate = function (body) {
    return validate.async(body, constraints.updateAssignment).then(() => {
        assertObjectId(body.assignmentId, 'assignmentId');
        if (body.status && !ASSIGNMENT_STATUSES.includes(body.status)) {
            throw 'Invalid assignment status';
        }
        if (body.artifactId) {
            assertObjectId(body.artifactId, 'artifactId');
            if (!body.artifactStatus) {
                throw 'artifactStatus is required when artifactId is provided';
            }
            if (!ARTIFACT_STATUSES.includes(body.artifactStatus)) {
                throw 'Invalid artifact status';
            }
        }
        if (body.dueDate && isNaN(new Date(body.dueDate).getTime())) {
            throw 'dueDate must be a valid date';
        }
        return body;
    });
};
