#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import sys

# 시스템 인코딩을 UTF-8로 설정
if sys.platform.startswith('win'):
    import locale
    try:
        locale.setlocale(locale.LC_ALL, 'ko_KR.UTF-8')
    except:
        pass

# 표준 출력/에러를 UTF-8로 설정
try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except:
    pass

app = FastAPI(title="한글 인코딩 테스트")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TestRequest(BaseModel):
    message: str

@app.get("/")
async def root():
    return {"message": "한글 인코딩 테스트 서버", "status": "실행 중"}

@app.get("/test-korean")
async def test_korean():
    return {
        "message": "안녕하세요! 한글이 제대로 출력되는지 테스트합니다.",
        "test_data": [
            "파이썬 프로그래밍",
            "웹 개발 스터디",
            "데이터 분석 프로젝트",
            "인공지능 학습"
        ]
    }

@app.post("/echo")
async def echo_message(request: TestRequest):
    return {
        "received_message": request.message,
        "message_length": len(request.message),
        "encoding_info": "UTF-8"
    }

if __name__ == "__main__":
    print("한글 인코딩 테스트 서버 시작...")
    print(f"시스템 인코딩: {sys.getdefaultencoding()}")
    print(f"표준출력 인코딩: {getattr(sys.stdout, 'encoding', '알 수 없음')}")
    
    uvicorn.run(
        "test_encoding:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
