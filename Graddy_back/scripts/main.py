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

class FeedbackRequest(BaseModel):
    assignment_title: str
    assignment_description: str
    submission_content: str
    submission_file_url: Optional[str] = None

class FeedbackResponse(BaseModel):
    score: int
    comment: str
    detailed_feedback: str

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

@app.post("/generate-feedback", response_model=FeedbackResponse)
async def generate_feedback(request: FeedbackRequest):
    """
    OpenAI GPT를 사용하여 과제 제출에 대한 상세한 피드백을 생성합니다.
    """
    try:
        # OpenAI API 키 확인
        if not openai.api_key:
            raise HTTPException(status_code=500, detail="OpenAI API 키가 설정되지 않았습니다.")
        
        # 제출 내용이 코드인지 판단
        is_code_submission = detect_code_submission(request.submission_content)
        
        # 프롬프트 구성 - 코드인 경우 코드 리뷰 형식, 일반 텍스트인 경우 일반 피드백 형식
        if is_code_submission:
            prompt = f"""
다음 과제 제출에 대한 전문적인 코드 리뷰를 수행해주세요.

**과제 정보:**
- 제목: {request.assignment_title}
- 설명: {request.assignment_description}

**제출된 코드:**
```code
{request.submission_content}
```

**첨부 파일:** {request.submission_file_url if request.submission_file_url else '없음'}

**코드 리뷰 기준 및 요구사항:**

**1. 코드 품질 (0-10점)**
- 코드 구조와 아키텍처
- 함수/클래스 설계의 적절성
- 변수명과 함수명의 명확성
- 코드 복잡도와 가독성

**2. 기능 구현 (0-10점)**
- 요구사항 충족도
- 핵심 기능의 정확한 구현
- 예외 처리 및 에러 핸들링
- 입력 검증 및 보안 고려사항

**3. 성능 및 최적화 (0-10점)**
- 알고리즘 효율성
- 메모리 사용량
- 시간 복잡도
- 리소스 관리

**4. 코드 스타일 및 컨벤션 (0-10점)**
- 코딩 스타일 일관성
- 들여쓰기 및 포맷팅
- 주석 및 문서화
- 네이밍 컨벤션 준수

**5. 테스트 및 유지보수성 (0-10점)**
- 테스트 가능성
- 코드 재사용성
- 확장성 및 유연성
- 디버깅 용이성

**6. 보안 및 모범 사례 (0-10점)**
- 보안 취약점
- 입력 검증
- 에러 메시지 노출
- 인증 및 권한 관리

**요구사항:**
- 최종 점수는 -5점에서 10점 사이로 설정
- 각 평가 기준별로 구체적인 코드 예시와 근거 제시
- 코드의 장점과 개선점을 명확하게 분석
- 구체적이고 실행 가능한 리팩토링 제안
- 보안 취약점이 있다면 구체적인 해결 방안 제시
- 건설적이고 격려적인 톤으로 작성
- 한국어로 작성

**출력 형식:**
점수: [최종점수]
코멘트: [간단한 요약 - 핵심 평가 결과와 전반적인 인상]
상세 피드백: [구체적인 코드 리뷰 - 각 평가 기준별 상세 분석, 코드 예시, 리팩토링 제안, 보안 개선 방안, 학습 방향 제시]
"""
        else:
            prompt = f"""
다음 과제 제출에 대한 매우 상세하고 구체적인 피드백을 생성해주세요.

**과제 정보:**
- 제목: {request.assignment_title}
- 설명: {request.assignment_description}

**제출 내용:**
{request.submission_content}

**첨부 파일:** {request.submission_file_url if request.submission_file_url else '없음'}

**평가 기준 및 요구사항:**

**1. 내용의 완성도 (0-10점)**
- 과제 요구사항 충족도
- 핵심 개념 이해도
- 구현 완성도

**2. 논리적 구조 (0-10점)**
- 내용의 논리적 흐름
- 구조적 설계의 적절성
- 단계별 접근의 명확성

**3. 기술적 정확성 (0-10점)**
- 기술적 구현의 정확성
- 에러나 버그의 존재 여부
- 최적화 수준

**4. 개선 가능성 (0-10점)**
- 향후 발전 방향
- 추가 학습이 필요한 부분
- 실무 적용 가능성

**요구사항:**
- 최종 점수는 -5점에서 10점 사이로 설정
- 각 평가 기준별로 구체적인 예시와 근거 제시
- 제출 내용의 장점과 단점을 명확하게 분석
- 구체적이고 실행 가능한 개선 방안 제시
- 건설적이고 격려적인 톤으로 작성
- 한국어로 작성

**출력 형식:**
점수: [최종점수]
코멘트: [간단한 요약 - 핵심 평가 결과와 전반적인 인상]
상세 피드백: [구체적인 분석과 개선 방안 - 각 평가 기준별 상세 분석, 구체적인 예시, 실행 가능한 개선 제안, 학습 방향 제시]
"""
        
        # OpenAI GPT API 호출
        if is_code_submission:
            system_message = "당신은 시니어 개발자이자 코드 리뷰 전문가입니다. 매우 상세하고 구체적인 코드 리뷰를 제공하며, 개발자의 성장을 돕는 것이 목표입니다. 각 평가 기준별로 구체적인 코드 예시와 근거를 제시하고, 실행 가능한 리팩토링 방안을 제안합니다."
        else:
            system_message = "당신은 교육 전문가이자 과제 평가자입니다. 매우 상세하고 구체적인 피드백을 제공하며, 학생의 성장을 돕는 것이 목표입니다. 각 평가 기준별로 구체적인 예시와 근거를 제시하고, 실행 가능한 개선 방안을 제안합니다."
        
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2500,  # 코드 리뷰의 경우 더 긴 응답을 위해 토큰 수 증가
            temperature=0.7   # 창의성과 일관성의 균형
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
            if is_code_submission:
                comment = "코드 리뷰가 완료되었습니다."
            else:
                comment = "과제 제출에 대한 상세한 피드백이 생성되었습니다."
        if not detailed_feedback:
            detailed_feedback = feedback_text
        
        # 코멘트와 상세 피드백을 하나로 통합
        integrated_comment = create_integrated_comment(comment, detailed_feedback, is_code_submission)
        
        return FeedbackResponse(
            score=score,
            comment=integrated_comment,  # 통합된 코멘트 반환
            detailed_feedback=detailed_feedback
        )
        
    except Exception as e:
        print(f"Error in generate_feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=f"피드백 생성 중 오류가 발생했습니다: {str(e)}")

def detect_code_submission(content):
    """
    제출 내용이 코드인지 판단
    """
    if not content:
        return False
    
    # 코드로 판단할 수 있는 키워드들
    code_keywords = [
        'public', 'private', 'class', 'function', 'def', 'var', 'let', 'const',
        'if', 'else', 'for', 'while', 'return', 'import', 'package', 'namespace',
        'try', 'catch', 'throw', 'new', 'this', 'super', 'extends', 'implements',
        'int', 'String', 'boolean', 'void', 'null', 'true', 'false',
        'console.log', 'System.out.println', 'print', 'printf',
        '=>', '->', '::', '++', '--', '&&', '||', '!', '==', '===', '!=', '!=='
    ]
    
    # 코드 블록 마커 확인
    if '```' in content or '`' in content:
        return True
    
    # 코드 키워드 확인
    content_lower = content.lower()
    keyword_count = sum(1 for keyword in code_keywords if keyword.lower() in content_lower)
    
    # 키워드가 3개 이상 있으면 코드로 판단
    return keyword_count >= 3

def create_integrated_comment(comment, detailed_feedback, is_code_submission=False):
    """
    코멘트와 상세 피드백을 하나로 통합
    """
    integrated = []
    
    # 1. 간단한 요약 (코멘트)
    if comment and comment.strip():
        if is_code_submission:
            integrated.append("🔍 **코드 리뷰 요약:**")
        else:
            integrated.append("📝 **간단한 요약:**")
        integrated.append(comment.strip())
        integrated.append("")  # 빈 줄 추가
    
    # 2. 상세 피드백
    if detailed_feedback and detailed_feedback.strip():
        if is_code_submission:
            integrated.append("💻 **상세 코드 리뷰:**")
        else:
            integrated.append("🔍 **상세 피드백:**")
        integrated.append(detailed_feedback.strip())
    
    return "\n".join(integrated)

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
