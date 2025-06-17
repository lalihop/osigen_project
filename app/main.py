from fastapi import FastAPI, HTTPException
from fastapi.security import HTTPBearer
from models import LoginRequest
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from fastapi import FastAPI
from routes import analysis
from database import admin_collection
from routes import ai_summary

app = FastAPI()
app.include_router(analysis.router)
app.include_router(ai_summary.router)

# 비밀번호 해시 context 설정
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT 설정
SECRET_KEY = "supersecretjwtkey"  # 환경변수로 빼면 더 좋아
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# CORS 설정 (FastAPI와 React 연동)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 토큰 생성 함수
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# 로그인 API → JWT 토큰 발급
@app.post("/login")
async def login(request: LoginRequest):
    user = await admin_collection.find_one({"username": "admin"})
    if not user or not pwd_context.verify(request.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": "admin"})
    return {"access_token": access_token, "token_type": "bearer"}

# 인증 보호 의존성
security = HTTPBearer()