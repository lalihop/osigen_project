from pydantic import BaseModel

# 로그인 요청 모델
class LoginRequest(BaseModel):
    password: str

class AnalyzeRequest(BaseModel):
    domain: str
    analysis_type: str  # "quick" or "full"