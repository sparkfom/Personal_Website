from fastapi import FastAPI, APIRouter, UploadFile, File, Form, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.responses import RedirectResponse
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Ensure upload dirs exist
UPLOAD_ROOT = ROOT_DIR / 'uploads'
TMP_DIR = UPLOAD_ROOT / 'tmp'
FILES_DIR = UPLOAD_ROOT / 'files'
TMP_DIR.mkdir(parents=True, exist_ok=True)
FILES_DIR.mkdir(parents=True, exist_ok=True)

# Create the main app
app = FastAPI()

# Create router with /api prefix
api_router = APIRouter(prefix="/api")

# ===== Models =====
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class ConsultRequestCreate(BaseModel):
    name: str
    company: Optional[str] = None
    role: Optional[str] = None
    summary: str
    start_date: Optional[str] = None
    budget: Optional[str] = None
    attachment_id: Optional[str] = None

class ConsultRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    name: str
    company: Optional[str] = None
    role: Optional[str] = None
    summary: str
    start_date: Optional[str] = None
    budget: Optional[str] = None
    attachment_id: Optional[str] = None

class UploadInit(BaseModel):
    filename: str
    total_chunks: int
    mime_type: str
    size: int

class UploadComplete(BaseModel):
    upload_id: str

class UploadRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    filename: str
    size: int
    path: str
    mime_type: str

# ===== Routes =====
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.dict())
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# --- Uploads ---
@api_router.post("/uploads/initiate")
async def initiate_upload(meta: UploadInit):
    upload_id = str(uuid.uuid4())
    tmp_dir = TMP_DIR / upload_id
    tmp_dir.mkdir(parents=True, exist_ok=True)
    # Save meta for later
    (tmp_dir / 'meta.txt').write_text(
        f"{meta.filename}\n{meta.total_chunks}\n{meta.mime_type}\n{meta.size}",
        encoding='utf-8'
    )
    return {"upload_id": upload_id}

@api_router.post("/uploads/chunk")
async def upload_chunk(
    upload_id: str = Form(...),
    index: int = Form(...),
    chunk: UploadFile = File(...)
):
    tmp_dir = TMP_DIR / upload_id
    if not tmp_dir.exists():
        raise HTTPException(status_code=400, detail="Invalid upload_id")
    chunk_path = tmp_dir / f"chunk_{index:06d}"
    with open(chunk_path, 'wb') as f:
        while True:
            data = await chunk.read(1024 * 1024)
            if not data:
                break
            f.write(data)
    return {"received": True, "index": index}

@api_router.post("/uploads/complete")
async def complete_upload(body: UploadComplete):
    upload_id = body.upload_id
    tmp_dir = TMP_DIR / upload_id
    if not tmp_dir.exists():
        raise HTTPException(status_code=400, detail="Invalid upload_id")
    meta_lines = (tmp_dir / 'meta.txt').read_text(encoding='utf-8').splitlines()
    filename, total_chunks_str, mime_type, size_str = meta_lines
    total_chunks = int(total_chunks_str)
    size = int(size_str)

    final_name = f"{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{filename}"
    final_path = FILES_DIR / final_name

    with open(final_path, 'wb') as outfile:
        for i in range(total_chunks):
            chunk_path = tmp_dir / f"chunk_{i:06d}"
            if not chunk_path.exists():
                raise HTTPException(status_code=400, detail=f"Missing chunk {i}")
            with open(chunk_path, 'rb') as infile:
                shutil.copyfileobj(infile, outfile)

    # Clean tmp
    for p in tmp_dir.iterdir():
        try: p.unlink()
        except Exception: pass
    try: tmp_dir.rmdir()
    except Exception: pass

    record = UploadRecord(filename=filename, size=size, path=str(final_path), mime_type=mime_type)
    await db.uploads.insert_one(record.dict())
    return {"file_id": record.id, "filename": filename, "size": size}

# --- Consult Requests ---
@api_router.post("/consult-requests", response_model=ConsultRequest)
async def create_consult_request(body: ConsultRequestCreate):
    cr = ConsultRequest(**body.dict())
    await db.consult_requests.insert_one(cr.dict())
    return cr

@api_router.get("/consult-requests", response_model=List[ConsultRequest])
async def list_consult_requests():
    items = await db.consult_requests.find().sort("created_at", -1).to_list(1000)
    return [ConsultRequest(**it) for it in items]

# --- CV ---
PROFILE_PDF_URL = "https://customer-assets.emergentagent.com/job_d6d0531e-d939-4858-936b-14b530c1a68e/artifacts/z85mc8o3_Profile.pdf"

@api_router.get("/cv")
async def get_cv():
    # Temporary: redirect to externally hosted PDF; later we can serve from disk / conversion
    return RedirectResponse(url=PROFILE_PDF_URL, status_code=307)

# Include router in main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()