#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import openai
import os
import sys
from datetime import datetime
from dotenv import load_dotenv

# 시스템 인코딩을 UTF-8로 설정
if sys.platform.startswith('win'):
    import locale
    locale.setlocale(locale.LC_ALL, 'ko_KR.UTF-8')

# 표준 출력/에러를 UTF-8로 설정
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# .env 파일 로딩
load_dotenv()

# FastAPI 앱 생성
app = FastAPI(
    title="AI Curriculum Generator API",
    description="OpenAI GPT를 활용한 스터디/프로젝트 커리큘럼 생성 API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 특정 도메인으로 제한
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI API 키 설정
openai.api_key = os.getenv('OPENAI_API_KEY')

# Pydantic 모델 정의
class CurriculumRequest(BaseModel):
    study_project_id: int
    study_project_name: str
    study_project_title: str
    study_project_desc: str
    study_level: int
    interest_tags: List[str]
    study_project_start: str
    study_project_end: str
    type_check: str = "study"

class CurriculumResponse(BaseModel):
    study_project_id: int
    curriculum: str
    message: str
    success: bool
    generated_at: str

# API 엔드포인트
@app.get("/")
async def root():
    return {"message": "AI Curriculum Generator API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/generate-curriculum", response_model=CurriculumResponse)
async def generate_curriculum(request: CurriculumRequest):
    """
    OpenAI GPT를 사용하여 스터디/프로젝트 커리큘럼을 생성합니다.
    """
    try:
        # OpenAI API 키 확인
        if not openai.api_key:
            raise HTTPException(status_code=500, detail="OpenAI API 키가 설정되지 않았습니다.")
        
        # 레벨에 따른 설명 생성
        level_descriptions = {
            1: "초급자 (기초 개념 학습)",
            2: "중급자 (기본 실습 및 응용)",
            3: "고급자 (심화 학습 및 프로젝트)"
        }
        
        level_desc = level_descriptions.get(request.study_level, "중급자")
        
        # 프롬프트 구성
        prompt = f"""
다음 정보를 바탕으로 {request.study_project_name} {request.type_check}를 위한 상세한 커리큘럼을 생성해주세요.

**{request.type_check.capitalize()} 정보:**
- 이름: {request.study_project_name}
- 제목: {request.study_project_title}
- 설명: {request.study_project_desc}
- 수준: {level_desc} (레벨 {request.study_level})
- 관심 분야: {', '.join(request.interest_tags)}
- 기간: {request.study_project_start} ~ {request.study_project_end}

**요구사항:**
1. {request.type_check} 기간에 맞는 주차별 커리큘럼을 작성해주세요
2. 각 주차별로 학습 목표, 주요 내용, 실습 과제를 포함해주세요
3. {', '.join(request.interest_tags)} 분야의 핵심 개념들을 체계적으로 학습할 수 있도록 구성해주세요
4. 레벨 {request.study_level}에 맞는 적절한 난이도로 구성해주세요
5. 실무 적용 가능한 실습과 프로젝트를 포함해주세요

**출력 형식:**
- 마크다운 형식으로 작성
- 주차별로 명확하게 구분
- 각 주차마다 학습 목표, 주요 내용, 실습 과제 포함
- 마지막에 전체 학습 성과 평가 방법 제시

한국어로 작성해주세요.
"""
        
        # OpenAI GPT API 호출
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "당신은 교육 전문가이자 커리큘럼 설계 전문가입니다. 체계적이고 실용적인 학습 커리큘럼을 설계하는 것이 특기입니다."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2000,
            temperature=0.7
        )
        
        # 응답에서 커리큘럼 추출
        curriculum = response.choices[0].message.content.strip()
        
        # 디버깅: 생성된 커리큘럼 출력
        print(f"Generated Curriculum (UTF-8): {curriculum}")
        print(f"Curriculum length: {len(curriculum)}")
        print(f"Curriculum encoding check: {curriculum.encode('utf-8')}")
        
        return CurriculumResponse(
            study_project_id=request.study_project_id,
            curriculum=curriculum,
            message="커리큘럼이 성공적으로 생성되었습니다.",
            success=True,
            generated_at=datetime.now().isoformat()
        )
        
    except Exception as e:
        print(f"Error in generate_curriculum: {str(e)}")
        raise HTTPException(status_code=500, detail=f"커리큘럼 생성 중 오류가 발생했습니다: {str(e)}")

@app.get("/models")
async def get_available_models():
    """
    사용 가능한 OpenAI 모델 목록을 반환합니다.
    """
    try:
        models = openai.Model.list()
        return {"models": [model.id for model in models.data]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"모델 목록 조회 중 오류가 발생했습니다: {str(e)}")

if __name__ == "__main__":
    print("Starting FastAPI server with UTF-8 encoding...")
    print(f"System encoding: {sys.getdefaultencoding()}")
    print(f"Stdout encoding: {sys.stdout.encoding}")
    
    # 서버 실행
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
