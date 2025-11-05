# Onboarding Training Service

Node.js REST API that enables administrators to create onboarding modules, manage learning artifacts, and assign them to employees as part of an induction or training journey. Employees can view assignments and keep their module progress up to date.

## Getting Started
- `npm install`
- `npm run start`

The service uses MongoDB. Update the connection string in `config/env` if needed.

## Authentication

- `POST /api/prelogin/v1/register` – create a user (role `admin` or `employee`). If no password is supplied, a temporary one is generated and returned.
- `POST /api/prelogin/v1/login` – obtain a JWT (returned in `data.token`).
- Authenticated routes require an `X-Access-Token` header containing the JWT.

## Modules

- `POST /api/v1/modules` – **admin only**. Create a training module with one or more artifacts.
- `PUT /api/v1/modules/:moduleId` – **admin only**. Update metadata, artifacts, or activation status.
- `GET /api/v1/modules` – list modules. Non-admins only receive active modules.
- `GET /api/v1/modules/:moduleId` – fetch module details.

### Artifact payload example
```json
{
  "title": "Welcome to the Company",
  "description": "Overview presentation",
  "type": "document",
  "url": "https://example.com/welcome.pdf"
}
```

## Assignments

- `POST /api/v1/assignments` – **admin only**. Assign a module to an employee with optional due date and notes.
- `GET /api/v1/assignments` – admins can filter by `userId`, `moduleId`, or `status`. Employees receive only their assignments.
- `PATCH /api/v1/assignments/:assignmentId` – update assignment status. Employees can update artifact progress (`artifactId`, `artifactStatus`). Admins can adjust due dates or override the overall `status`.

### Assignment progress update example
```json
{
  "artifactId": "6572e0c5f95b640f63f695dd",
  "artifactStatus": "completed"
}
```

## Environment Variables

Configuration is defined under `config/env`. The default database is `OnboardingDB`.