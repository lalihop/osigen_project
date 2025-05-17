from fastapi import FastAPI, HTTPException, Depends, Request #Response, Cookie
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from models import LoginRequest
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi import FastAPI
from routes import analysis
from database import db, admin_collection

app = FastAPI()
app.include_router(analysis.router)

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

@app.get("/ping-db")
async def ping_db():
    try:
        result = await db.command("ping")  # ping 명령어로 연결 확인
        return JSONResponse(content={"status": "success", "mongo": result})
    except Exception as e:
        return JSONResponse(content={"status": "fail", "error": str(e)}, status_code=500)

# 전체 admin 컬렉션 조회
@app.get("/get-admins")
async def get_admins():
    try:
        # MongoDB Cursor 객체를 list로 변환
        admins = await admin_collection.find().to_list(length=100)
        
        # ObjectId는 JSON 직렬화 불가능하므로 문자열로 변환
        for admin in admins:
            admin["_id"] = str(admin["_id"])
        
        return JSONResponse(content={"status": "success", "data": admins})
    except Exception as e:
        return JSONResponse(content={"status": "fail", "error": str(e)}, status_code=500)

# 로그인 API
# @app.post("/login")
# async def login(request: LoginRequest):
#     username = "admin"
#     user = await admin_collection.find_one({"username": username})

#     if not user:
#         raise HTTPException(status_code=401, detail="Admin account not found")

#     is_correct = pwd_context.verify(request.password, user["password"])

#     if not is_correct:
#         raise HTTPException(status_code=401, detail="Incorrect password")

#     return JSONResponse(content={"status": "success", "message": "Login successful"})

# # 로그인: 세션 쿠키 발급
# @app.post("/login")
# async def login(request: Request, response: Response, credentials: LoginRequest):
#     user = await admin_collection.find_one({"username": "admin"})
#     if not user or not pwd_context.verify(credentials.password, user["password"]):
#         raise HTTPException(status_code=401, detail="Invalid credentials")
    
#     # 세션 쿠키 설정 (간단히 username만 넣기)
#     response.set_cookie(key="session", value="admin", httponly=True)
#     return {"message": "Login successful"}

# # 인증된 관리자만 접근 가능
# @app.get("/admin-only")
# async def protected_route(session: str = Cookie(default=None)):
#     if session != "admin":
#         raise HTTPException(status_code=401, detail="Not authenticated")
#     return {"message": "Welcome, Admin!"}

# # 로그아웃 (쿠키 삭제)
# @app.post("/logout")
# async def logout(response: Response):
#     response.delete_cookie(key="session")
#     return {"message": "Logged out"}

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

# 인증된 사용자만 접근 가능한 엔드포인트
@app.get("/admin-only")
def protected_route(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("sub") != "admin":
            raise HTTPException(status_code=403, detail="Invalid user")
    except JWTError:
        raise HTTPException(status_code=403, detail="Invalid token")

    return {"message": "Welcome, Admin!"}

