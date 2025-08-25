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

# 과제 피드백 요청 모델
class FeedbackRequest(BaseModel):
    assignment_title: str
    assignment_description: str
    submission_content: str
    submission_file_url: Optional[str] = None

# 과제 피드백 응답 모델
class FeedbackResponse(BaseModel):
    score: int  # -5 ~ 10 점수
    comment: str
    detailed_feedback: str

# 과제 생성 요청 모델
class AssignmentGenerationRequest(BaseModel):
    study_project_id: int
    study_project_name: str
    study_project_title: str
    study_project_desc: str
    study_level: int
    interest_tags: List[str]
    study_project_start: str
    study_project_end: str
    type_check: str = "study"

# 과제 생성 응답 모델
class AssignmentGenerationResponse(BaseModel):
    study_project_id: int
    assignments: List[dict]  # 과제 목록
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

@app.post("/generate-assignments", response_model=AssignmentGenerationResponse)
async def generate_assignments(request: AssignmentGenerationRequest):
    """
    OpenAI GPT를 사용하여 스터디/프로젝트에 맞는 과제를 생성합니다.
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
다음 정보를 바탕으로 {request.study_project_name} {request.type_check}를 위한 체계적인 과제를 생성해주세요.

**{request.type_check.capitalize()} 정보:**
- 이름: {request.study_project_name}
- 제목: {request.study_project_title}
- 설명: {request.study_project_desc}
- 수준: {level_desc} (레벨 {request.study_level})
- 관심 분야: {', '.join(request.interest_tags)}
- 기간: {request.study_project_start} ~ {request.study_project_end}

**요구사항:**
1. {request.type_check} 기간에 맞는 주차별 과제를 작성해주세요
2. 각 과제마다 제목, 설명, 마감일, 난이도를 포함해주세요
3. {', '.join(request.interest_tags)} 분야의 핵심 개념들을 학습할 수 있는 과제로 구성해주세요
4. 레벨 {request.study_level}에 맞는 적절한 난이도로 구성해주세요
5. 실무 적용 가능한 실습과 프로젝트를 포함해주세요

**출력 형식 (JSON):**
```json
[
  {{
    "title": "과제 제목",
    "description": "과제 설명",
    "deadline": "YYYY-MM-DD HH:MM:SS",
    "difficulty": "초급/중급/고급",
    "week": "주차 번호",
    "learning_objectives": ["학습 목표1", "학습 목표2"],
    "required_skills": ["필요한 기술1", "필요한 기술2"],
    "evaluation_criteria": ["평가 기준1", "평가 기준2"]
  }}
]
```

한국어로 작성해주세요.
"""
        
        # OpenAI GPT API 호출
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "당신은 교육 전문가이자 과제 설계 전문가입니다. 체계적이고 실용적인 학습 과제를 설계하는 것이 특기입니다."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2000,
            temperature=0.7
        )
        
        # 응답에서 과제 정보 추출
        assignments_text = response.choices[0].message.content.strip()
        
        # JSON 파싱 시도
        import json
        try:
            # JSON 부분만 추출
            if "```json" in assignments_text:
                json_start = assignments_text.find("```json") + 7
                json_end = assignments_text.find("```", json_start)
                json_text = assignments_text[json_start:json_end].strip()
                assignments = json.loads(json_text)
            else:
                # JSON 형식이 아닌 경우 기본 구조로 변환
                assignments = [{
                    "title": "자동 생성된 과제",
                    "description": assignments_text,
                    "deadline": "2024-12-31 23:59:59",
                    "difficulty": level_desc,
                    "week": 1,
                    "learning_objectives": ["과제 완성"],
                    "required_skills": request.interest_tags,
                    "evaluation_criteria": ["완성도", "정확성"]
                }]
        except json.JSONDecodeError:
            # JSON 파싱 실패 시 기본 구조로 변환
            assignments = [{
                "title": "자동 생성된 과제",
                "description": assignments_text,
                "deadline": "2024-12-31 23:59:59",
                "difficulty": level_desc,
                "week": 1,
                "learning_objectives": ["과제 완성"],
                "required_skills": request.interest_tags,
                "evaluation_criteria": ["완성도", "정확성"]
            }]
        
        return AssignmentGenerationResponse(
            study_project_id=request.study_project_id,
            assignments=assignments,
            message="과제가 성공적으로 생성되었습니다.",
            success=True,
            generated_at=datetime.now().isoformat()
        )
        
    except Exception as e:
        print(f"Error in generate_assignments: {str(e)}")
        raise HTTPException(status_code=500, detail=f"과제 생성 중 오류가 발생했습니다: {str(e)}")

@app.post("/generate-feedback", response_model=FeedbackResponse)
async def generate_feedback(request: FeedbackRequest):
    """
    OpenAI GPT를 사용하여 과제 제출에 대한 피드백을 생성합니다.
    """
    try:
        # OpenAI API 키 확인
        if not openai.api_key:
            raise HTTPException(status_code=500, detail="OpenAI API 키가 설정되지 않았습니다.")
        
        # 프롬프트 구성
        prompt = f"""
다음 과제 제출에 대한 상세한 피드백을 생성해주세요.

**과제 정보:**
- 제목: {request.assignment_title}
- 설명: {request.assignment_description}

**제출 내용:**
{request.submission_content}

**첨부 파일:** {request.submission_file_url if request.submission_file_url else '없음'}

**평가 기준:**
1. 내용의 완성도 (0-10점)
2. 창의성과 독창성 (0-10점)
3. 논리적 구조 (0-10점)
4. 기술적 정확성 (0-10점)
5. 표현력과 가독성 (0-10점)

**요구사항:**
- 최종 점수는 -5점에서 10점 사이로 설정
- 상세한 피드백과 구체적인 개선 방안 제시
- 건설적이고 격려적인 톤으로 작성
- 한국어로 작성

**출력 형식:**
점수: [최종점수]
코멘트: [간단한 요약]
상세 피드백: [구체적인 피드백과 개선 방안]
"""
        
        # OpenAI GPT API 호출
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "당신은 교육 전문가이자 과제 평가자입니다. 공정하고 건설적인 피드백을 제공하며, 학생의 성장을 돕는 것이 목표입니다."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.6
        )
        
        # 응답에서 피드백 추출
        feedback_text = response.choices[0].message.content.strip()
        
        # 점수와 코멘트 추출
        lines = feedback_text.split('\n')
        score = 0
        comment = ""
        detailed_feedback = ""
        
        for line in lines:
            if line.startswith('점수:'):
                try:
                    score_text = line.replace('점수:', '').strip()
                    score = int(score_text)
                    # 점수 범위 제한 (-5 ~ 10)
                    score = max(-5, min(10, score))
                except ValueError:
                    score = 5  # 기본값
            elif line.startswith('코멘트:'):
                comment = line.replace('코멘트:', '').strip()
            elif line.startswith('상세 피드백:'):
                detailed_feedback = line.replace('상세 피드백:', '').strip()
        
        # 기본값 설정
        if not comment:
            comment = "과제 제출에 대한 피드백이 생성되었습니다."
        if not detailed_feedback:
            detailed_feedback = feedback_text
        
        return FeedbackResponse(
            score=score,
            comment=comment,
            detailed_feedback=detailed_feedback
        )
        
    except Exception as e:
        print(f"Error in generate_feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=f"피드백 생성 중 오류가 발생했습니다: {str(e)}")

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
