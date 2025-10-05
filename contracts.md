# API Contracts and Integration Plan

Scope v1
- Replace frontend mocks for the Contact form with real backend persistence
- Chunked file uploads for PDF attachments
- Serve CV via backend endpoint (temporary redirect to existing PDF). Content sections (About/Services/etc.) remain mocked for now

Base
- All routes are prefixed with /api
- Backend binds 0.0.0.0:8001 (do not change). Frontend uses REACT_APP_BACKEND_URL from env
- DB: use MONGO_URL from backend/.env; DB name from DB_NAME env (already present)

Data Models
ConsultRequest (Mongo collection: consult_requests)
{
  id: string (uuid),
  created_at: ISO datetime,
  name: string,
  company?: string,
  role?: string,
  summary: string,
  start_date?: string,
  budget?: string,
  attachment_id?: string (uploads._id)
}

UploadRecord (Mongo collection: uploads)
{
  id: string (uuid),
  created_at: ISO datetime,
  filename: string,
  size: number,
  path: string,            // absolute path under /app/backend/uploads/files
  mime_type: string
}

Endpoints
- GET /api/ -> { message: "Hello World" }

- POST /api/uploads/initiate
  Body: { filename: string, total_chunks: number, mime_type: string, size: number }
  Res: { upload_id: string }

- POST /api/uploads/chunk (multipart/form-data)
  Form fields: upload_id: string, index: number, chunk: file
  Res: { received: true, index: number }

- POST /api/uploads/complete
  Body: { upload_id: string }
  Res: { file_id: string, filename: string, size: number }

- POST /api/consult-requests
  Body: ConsultRequestCreate = {
    name: string,
    company?: string,
    role?: string,
    summary: string,
    start_date?: string,
    budget?: string,
    attachment_id?: string
  }
  Res: ConsultRequest

- GET /api/consult-requests
  Res: ConsultRequest[]

- GET /api/cv
  Behavior: Temporary 307 redirect to existing Profile.pdf URL; next iteration may implement docx→pdf conversion and serve from disk

Frontend Integration Changes
- use REACT_APP_BACKEND_URL; no hardcoded URLs
- Contact form flow:
  1) If file chosen: initiate → chunk loop (1MB) → complete → get file_id
  2) POST /api/consult-requests with form fields + attachment_id
  3) Show progress using shadcn Progress; on success toast + clear form
- LocalStorage fallback preserved if backend fails

Testing Plan
- Test backend first using deep_testing_backend_v2: uploads (all three endpoints) and consult-requests CRUD
- After backend passes, ask user whether to run automated UI tests

Notes
- File storage: /app/backend/uploads/{tmp|files}
- No changes to .env or ports
- Current content (about/services/method/etc.) remains mocked in src/mock/mock.js for now