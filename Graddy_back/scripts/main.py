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
import requests
# import boto3  # S3 사용하지 않음
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

# 로컬 파일 스토리지 설정
# S3 대신 로컬 파일 시스템 사용
print("로컬 파일 스토리지를 사용합니다.")

# 파일 읽기 함수 정의 (함수가 사용되기 전에 정의)
def test_file_url_access(file_url: str) -> dict:
    """
    fileUrl에 대한 다양한 접근 방법을 시도하여 접근 가능성을 테스트
    """
    print(f"🧪 [TEST] fileUrl 접근 테스트 시작: {file_url}")
    test_results = {
        "original_url": file_url,
        "url_format_valid": False,
        "http_accessible": False,
        "local_file_exists": False,
        "local_file_readable": False,
        "file_content": "",
        "error_messages": []
    }
    
    try:
        # 1. URL 형식 검증
        if file_url and file_url.startswith('/api/files/'):
            test_results["url_format_valid"] = True
            print(f"✅ [TEST] URL 형식 유효: {file_url}")
        else:
            test_results["error_messages"].append("Invalid URL format")
            print(f"❌ [TEST] URL 형식 무효: {file_url}")
            return test_results
        
        # 2. HTTP 접근 시도
        try:
            import requests
            full_url = f"http://localhost:8080{file_url}"
            print(f"🌐 [TEST] HTTP 접근 시도: {full_url}")
            
            response = requests.get(full_url, timeout=5)
            if response.status_code == 200:
                test_results["http_accessible"] = True
                test_results["file_content"] = response.text
                print(f"✅ [TEST] HTTP 접근 성공 - 상태코드: {response.status_code}")
                print(f"📄 [TEST] HTTP로 읽은 내용 길이: {len(response.text)}자")
                print(f"📄 [TEST] HTTP 내용 미리보기: {response.text[:200]}...")
            else:
                test_results["error_messages"].append(f"HTTP error {response.status_code}")
                print(f"❌ [TEST] HTTP 접근 실패 - 상태코드: {response.status_code}")
        except Exception as http_e:
            test_results["error_messages"].append(f"HTTP exception: {str(http_e)}")
            print(f"💥 [TEST] HTTP 접근 예외: {http_e}")
        
        # 3. 로컬 파일 경로 접근 시도
        try:
            relative_path = file_url.replace('/api/files/', '')
            script_dir = os.path.dirname(__file__)
            parent_dir = os.path.dirname(script_dir)
            base_path = os.path.join(parent_dir, 'uploads')
            file_path = os.path.join(base_path, relative_path)
            
            print(f"📁 [TEST] 로컬 파일 경로: {file_path}")
            print(f"📁 [TEST] 절대 경로: {os.path.abspath(file_path)}")
            
            if os.path.exists(file_path):
                test_results["local_file_exists"] = True
                print(f"✅ [TEST] 로컬 파일 존재 확인")
                
                # 파일 읽기 시도
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    if content:
                        test_results["local_file_readable"] = True
                        if not test_results["file_content"]:  # HTTP로 못 읽었으면
                            test_results["file_content"] = content
                        print(f"✅ [TEST] 로컬 파일 읽기 성공 - 내용 길이: {len(content)}자")
                        print(f"📄 [TEST] 로컬 파일 내용 미리보기: {content[:200]}...")
                    else:
                        test_results["error_messages"].append("Local file is empty")
                        print(f"⚠️ [TEST] 로컬 파일이 비어있음")
            else:
                test_results["error_messages"].append("Local file does not exist")
                print(f"❌ [TEST] 로컬 파일이 존재하지 않음")
                
        except Exception as local_e:
            test_results["error_messages"].append(f"Local file exception: {str(local_e)}")
            print(f"💥 [TEST] 로컬 파일 접근 예외: {local_e}")
    
    except Exception as e:
        test_results["error_messages"].append(f"General exception: {str(e)}")
        print(f"💥 [TEST] 전체 테스트 예외: {e}")
    
    # 4. 테스트 결과 요약
    print(f"📊 [TEST] 결과 요약:")
    print(f"   - URL 형식 유효: {test_results['url_format_valid']}")
    print(f"   - HTTP 접근 가능: {test_results['http_accessible']}")
    print(f"   - 로컬 파일 존재: {test_results['local_file_exists']}")
    print(f"   - 로컬 파일 읽기: {test_results['local_file_readable']}")
    print(f"   - 내용 읽기 성공: {bool(test_results['file_content'])}")
    print(f"   - 오류 메시지: {test_results['error_messages']}")
    
    return test_results

def read_local_file(file_url: str) -> str:
    """
    HTTP API를 통해 파일 내용을 읽어옵니다.
    """
    try:
        print(f"🔍 [DEBUG] 파일 읽기 요청: {file_url}")
        
        if not file_url:
            print("⚠️ [DEBUG] 파일 URL이 비어있음")
            return ""
        
        # HTTP API를 통한 파일 접근으로 변경
        if file_url.startswith('/api/files/'):
            # Spring Boot 서버 URL 구성
            spring_boot_url = "http://localhost:8080" + file_url
            print(f"🌐 [DEBUG] Spring Boot API 호출: {spring_boot_url}")
            
            try:
                import requests
                
                # HTTP 요청으로 파일 내용 가져오기
                response = requests.get(spring_boot_url, timeout=30)
                print(f"📡 [DEBUG] HTTP 응답 상태: {response.status_code}")
                print(f"📡 [DEBUG] Content-Type: {response.headers.get('content-type', 'unknown')}")
                
                if response.status_code == 200:
                    # 텍스트 파일인 경우 내용 읽기
                    content_type = response.headers.get('content-type', '').lower()
                    
                    if any(text_type in content_type for text_type in ['text/', 'application/json', 'application/xml']):
                        content = response.text
                        print(f"📄 [DEBUG] 텍스트 파일 읽기 성공: {len(content)} characters")
                        print(f"📄 [DEBUG] 파일 내용 미리보기 (처음 200자): {content[:200]}")
                        
                        # 파일 크기가 너무 큰 경우 일부만 처리
                        if len(content) > 10000:
                            content = content[:10000] + "... (내용이 길어 일부만 표시)"
                            print(f"✂️ [DEBUG] 파일 내용이 길어 일부만 처리")
                        
                        return content
                    else:
                        # 바이너리 파일인 경우
                        file_size = len(response.content)
                        print(f"📄 [DEBUG] 바이너리 파일 감지: {file_size} bytes")
                        
                        # 파일 확장자에 따른 처리
                        if file_url.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.pdf', '.zip', '.rar')):
                            return f"바이너리 파일입니다 (크기: {file_size} bytes). 브라우저에서 다운로드하여 확인하세요."
                        else:
                            # 텍스트로 해석 시도
                            try:
                                content = response.content.decode('utf-8', errors='ignore')
                                print(f"📄 [DEBUG] 바이너리 파일을 텍스트로 해석: {len(content)} characters")
                                
                                if len(content) > 10000:
                                    content = content[:10000] + "... (내용이 길어 일부만 표시)"
                                
                                return content
                            except Exception as decode_e:
                                print(f"💥 [DEBUG] 텍스트 디코딩 실패: {decode_e}")
                                return f"파일을 텍스트로 읽을 수 없습니다 (크기: {file_size} bytes)"
                
                elif response.status_code == 404:
                    print(f"❌ [DEBUG] 파일을 찾을 수 없음 (404)")
                    return "파일을 찾을 수 없습니다."
                else:
                    print(f"💥 [DEBUG] HTTP 오류: {response.status_code}")
                    return f"파일 접근 오류: HTTP {response.status_code}"
                    
            except requests.RequestException as req_e:
                print(f"💥 [DEBUG] HTTP 요청 실패: {req_e}")
                
                # HTTP 실패 시 로컬 파일 접근 시도 (백업)
                print(f"🔄 [DEBUG] 로컬 파일 접근으로 백업 시도")
                return read_local_file_fallback(file_url)
                
        else:
            print(f"❌ [DEBUG] 지원하지 않는 파일 URL 형식: {file_url}")
            return "지원하지 않는 파일 URL 형식입니다."
            
    except Exception as e:
        print(f"💥 [DEBUG] 파일 읽기 실패: {e}")
        import traceback
        print(f"💥 [DEBUG] 스택 트레이스:\n{traceback.format_exc()}")
        return f"파일을 읽을 수 없습니다: {str(e)}"


def read_local_file_fallback(file_url: str) -> str:
    """
    HTTP 접근 실패 시 로컬 파일 시스템 접근 백업 함수
    """
    try:
        print(f"🔄 [FALLBACK] 로컬 파일 시스템 접근 시도: {file_url}")
        
        if file_url.startswith('/api/files/'):
            # URL에서 상대 경로 추출
            relative_path = file_url.replace('/api/files/', '')
            
            # 스프링 프로젝트의 uploads 디렉토리 경로 계산
            script_dir = os.path.dirname(__file__)  # scripts 디렉토리
            parent_dir = os.path.dirname(script_dir)  # Graddy_back 디렉토리
            base_path = os.path.join(parent_dir, 'uploads')
            file_path = os.path.join(base_path, relative_path)
            
            print(f"📂 [FALLBACK] 계산된 파일 경로: {file_path}")
            
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    print(f"✅ [FALLBACK] 로컬 파일 읽기 성공: {len(content)} characters")
                    
                    if len(content) > 10000:
                        content = content[:10000] + "... (내용이 길어 일부만 표시)"
                    
                    return content
            else:
                print(f"❌ [FALLBACK] 로컬 파일이 존재하지 않음: {file_path}")
                return "로컬 파일을 찾을 수 없습니다."
                
    except Exception as e:
        print(f"💥 [FALLBACK] 로컬 파일 접근 실패: {e}")
        return f"로컬 파일 접근 실패: {str(e)}"

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

class AutoCurriculumRequest(BaseModel):
    study_project_id: int
    study_project_name: str
    study_project_title: str
    study_project_desc: str
    study_level: int
    interest_tags: List[str]
    study_project_start: str
    study_project_end: str
    type_check: str = "study"

class AutoCurriculumResponse(BaseModel):
    study_project_id: int
    curriculum: str
    message: str
    success: bool
    generated_at: str
    study_project_info: dict

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
            model="gpt-4o",
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

@app.post("/auto-generate-curriculum", response_model=AutoCurriculumResponse)
async def auto_generate_curriculum(request: AutoCurriculumRequest):
    """
    스터디/프로젝트 생성 후 자동으로 AI 커리큘럼을 생성합니다.
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
            model="gpt-4o-mini",
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
        print(f"Auto-Generated Curriculum (UTF-8): {curriculum}")
        print(f"Curriculum length: {len(curriculum)}")
        print(f"Curriculum encoding check: {curriculum.encode('utf-8')}")
        
        # 스터디/프로젝트 정보 구성
        study_project_info = {
            "id": request.study_project_id,
            "name": request.study_project_name,
            "title": request.study_project_title,
            "description": request.study_project_desc,
            "level": request.study_level,
            "level_description": level_desc,
            "interest_tags": request.interest_tags,
            "start_date": request.study_project_start,
            "end_date": request.study_project_end,
            "type": request.type_check
        }
        
        return AutoCurriculumResponse(
            study_project_id=request.study_project_id,
            curriculum=curriculum,
            message=f"{request.type_check.capitalize()} 커리큘럼이 자동으로 생성되었습니다.",
            success=True,
            generated_at=datetime.now().isoformat(),
            study_project_info=study_project_info
        )
        
    except Exception as e:
        print(f"Error in auto_generate_curriculum: {str(e)}")
        raise HTTPException(status_code=500, detail=f"자동 커리큘럼 생성 중 오류가 발생했습니다: {str(e)}")

@app.post("/generate-feedback", response_model=FeedbackResponse)
async def generate_feedback(request: FeedbackRequest):
    """
    OpenAI GPT를 사용하여 과제 제출에 대한 상세한 피드백을 생성합니다.
    """
    try:
        print(f"🚀 [DEBUG] 피드백 생성 요청 시작")
        print(f"📝 [DEBUG] 과제 제목: {request.assignment_title}")
        print(f"📝 [DEBUG] 과제 설명: {request.assignment_description}")
        print(f"📄 [DEBUG] 제출 내용 길이: {len(request.submission_content)} characters")
        print(f"📄 [DEBUG] 제출 내용 미리보기: {request.submission_content[:200]}...")
        print(f"📎 [DEBUG] 첨부 파일 URL: {request.submission_file_url}")
        
        # 요청 데이터 상세 분석
        if request.submission_content:
            print(f"📄 [DEBUG] 제출 내용 있음: {len(request.submission_content)}자")
        else:
            print(f"📄 [DEBUG] 제출 내용 없음 또는 빈 문자열")
            
        if request.submission_file_url:
            print(f"📎 [DEBUG] 첨부파일 URL 있음: {request.submission_file_url}")
        else:
            print(f"📎 [DEBUG] 첨부파일 URL 없음")
        
        # OpenAI API 키 확인
        if not openai.api_key:
            print("❌ [DEBUG] OpenAI API 키가 설정되지 않음")
            raise HTTPException(status_code=500, detail="OpenAI API 키가 설정되지 않았습니다.")
        
        print("✅ [DEBUG] OpenAI API 키 확인 완료")
        
        # 🎯 핵심: 첨부파일 내용 읽기 및 검증 🎯
        file_content = ""
        file_reading_success = False
        
        if request.submission_file_url:
            print(f"🚀 [CRITICAL] 첨부파일 읽기 프로세스 시작!")
            print(f"📎 [CRITICAL] 대상 fileUrl: {request.submission_file_url}")
            print(f"📎 [CRITICAL] URL 타입: {type(request.submission_file_url)}")
            print(f"📎 [CRITICAL] URL 길이: {len(request.submission_file_url)}")
            
            # 파일 내용 읽기 시도
            file_content = read_local_file(request.submission_file_url)
            
            # 🎯 중요: 읽기 결과 검증
            print(f"🔍 [CRITICAL] 파일 읽기 결과 검증:")
            print(f"   - 읽은 내용 길이: {len(file_content)} characters")
            print(f"   - 내용 존재 여부: {bool(file_content)}")
            print(f"   - 에러 메시지 포함: {file_content.startswith('파일을 찾을 수 없습니다') or file_content.startswith('파일을 읽을 수 없습니다')}")
            
            if file_content and not file_content.startswith("파일을 찾을 수 없습니다") and not file_content.startswith("파일을 읽을 수 없습니다"):
                file_reading_success = True
                print(f"🎉 [CRITICAL] 파일 읽기 성공!")
                print(f"📄 [CRITICAL] 읽은 파일 전체 내용:")
                print("🔥" * 60)
                print(file_content)
                print("🔥" * 60)
            else:
                print(f"💥 [CRITICAL] 파일 읽기 실패!")
                print(f"💥 [CRITICAL] 실패 내용: {file_content[:200]}")
                
        else:
            print("⚠️ [CRITICAL] 첨부 파일 URL이 없음 - submission_file_url이 None 또는 빈 문자열")
        
        # 🎯 파일 읽기 성공/실패 상태 로깅
        print(f"📊 [CRITICAL] 파일 읽기 최종 상태:")
        print(f"   - 첨부파일 URL 제공됨: {bool(request.submission_file_url)}")
        print(f"   - 파일 읽기 성공: {file_reading_success}")
        print(f"   - 읽은 내용 길이: {len(file_content)} characters")
        print(f"   - FastAPI 채점 가능 상태: {file_reading_success or bool(request.submission_content)}")
        
        # 첨부파일 텍스트화 + 과제 내용을 통합하여 한번에 피드백 생성
        print(f"🔧 [DEBUG] 콘텐츠 통합 시작 - 파일내용: {len(file_content)}자, 제출내용: {len(request.submission_content)}자")
        
        full_content = create_integrated_content(
            file_content=file_content,
            submission_content=request.submission_content,
            file_url=request.submission_file_url
        )
        
        print(f"🎯 [CRITICAL] 통합 콘텐츠 결과:")
        print(f"   - 최종 내용 길이: {len(full_content)} characters")
        print(f"   - 첨부파일 포함 여부: {file_reading_success}")
        print(f"   - 제출 내용 포함 여부: {bool(request.submission_content)}")
        
        # 🔥 중요: 최종 통합 내용 전체 출력
        print(f"🔥 [CRITICAL] 최종 AI 채점 대상 통합 내용:")
        print("⭐" * 80)
        print(full_content)
        print("⭐" * 80)
        
        # 통합 내용 상태 검증
        if not full_content or len(full_content.strip()) == 0:
            print(f"💥 [CRITICAL] 치명적 오류: 통합된 내용이 비어있음!")
            print(f"💥 [CRITICAL] 파일 내용: '{file_content[:100]}'")
            print(f"💥 [CRITICAL] 제출 내용: '{request.submission_content[:100]}'")
            print(f"💥 [CRITICAL] AI 채점 불가능 상태!")
        else:
            print(f"🎉 [CRITICAL] 통합된 내용 확인 완료 - AI 채점 준비됨!")
            
        # 🎯 FastAPI 채점 가능성 최종 판단
        can_ai_score = bool(full_content and full_content.strip())
        print(f"🚀 [CRITICAL] FastAPI AI 채점 가능 상태: {can_ai_score}")
        
        if file_reading_success:
            print(f"✅ [CRITICAL] 첨부파일 읽기 성공으로 완전한 채점 가능!")
        elif request.submission_content:
            print(f"⚠️ [CRITICAL] 첨부파일 읽기 실패했지만 제출 내용만으로 채점 시도")
        else:
            print(f"💥 [CRITICAL] 첨부파일과 제출 내용 모두 없음 - 채점 불가!")
        
        # 제출 내용이 코드인지 판단 (파일 내용 포함)
        is_code_submission = detect_code_submission(full_content)
        
        # 프롬프트 구성 - 통합된 내용에 대한 종합적 피드백 생성
        if is_code_submission:
            prompt = f"""
다음 과제 제출에 대한 전문적인 코드 리뷰를 수행해주세요.

**과제 정보:**
- 제목: {request.assignment_title}
- 설명: {request.assignment_description}

**통합 제출 내용 (첨부파일 + 과제내용):**
{full_content}

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

**통합 제출 내용 (첨부파일 + 과제내용):**
{full_content}

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
            print("🧑‍💻 [DEBUG] 코드 제출로 판단됨 - 코드 리뷰 모드")
        else:
            system_message = "당신은 교육 전문가이자 과제 평가자입니다. 매우 상세하고 구체적인 피드백을 제공하며, 학생의 성장을 돕는 것이 목표입니다. 각 평가 기준별로 구체적인 예시와 근거를 제시하고, 실행 가능한 개선 방안을 제안합니다."
            print("📚 [DEBUG] 일반 제출로 판단됨 - 일반 피드백 모드")
        
        print(f"🤖 [DEBUG] OpenAI API 호출 시작")
        print(f"🔧 [DEBUG] 모델: gpt-4o")
        print(f"🎛️ [DEBUG] 프롬프트 길이: {len(prompt)} characters")
        
        print(f"🎛️ [DEBUG] 전송될 시스템 메시지:")
        print("-" * 50)
        print(system_message)
        print("-" * 50)
        
        print(f"🎛️ [DEBUG] 전송될 사용자 프롬프트:")
        print("=" * 80)
        print(prompt)
        print("=" * 80)
        
        response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2500,  # 코드 리뷰의 경우 더 긴 응답을 위해 토큰 수 증가
            temperature=0.7   # 창의성과 일관성의 균형
        )
        
        print(f"✅ [DEBUG] OpenAI API 호출 완료")
        
        # 응답에서 피드백 추출
        feedback_text = response.choices[0].message.content.strip()
        print(f"📝 [DEBUG] AI 응답 길이: {len(feedback_text)} characters")
        print(f"📝 [DEBUG] AI 전체 응답:")
        print("🤖" * 40)
        print(feedback_text)
        print("🤖" * 40)
        
        # 점수와 코멘트 추출
        lines = feedback_text.split('\n')
        score = None
        comment = ""
        detailed_feedback = ""
        
        print(f"🔍 [DEBUG] 응답 파싱 시작 (총 {len(lines)}줄)")
        
        for i, line in enumerate(lines):
            if line.startswith('점수:'):
                try:
                    score_text = line.replace('점수:', '').strip()
                    # "7점", "점수: 7", "7" 등 다양한 형태 처리
                    import re
                    score_match = re.search(r'(-?\d+)', score_text)
                    if score_match:
                        score = int(score_match.group(1))
                        # 점수 범위 제한 (-5 ~ 10)
                        score = max(-5, min(10, score))
                        print(f"📊 [DEBUG] 점수 파싱 성공: {score} (원본: '{score_text}')")
                    else:
                        print(f"⚠️ [DEBUG] 점수 파싱 실패 - 숫자를 찾을 수 없음: {line}")
                except Exception as e:
                    print(f"⚠️ [DEBUG] 점수 파싱 예외: {line}, 오류: {e}")
                    # 점수 파싱 실패 시 기본값을 사용하지 않고, 관련도 기반 점수 산정
                    pass
            elif line.startswith('코멘트:'):
                comment = line.replace('코멘트:', '').strip()
                print(f"💬 [DEBUG] 코멘트 파싱: {comment[:100]}...")
            elif line.startswith('상세 피드백:'):
                detailed_feedback = line.replace('상세 피드백:', '').strip()
                print(f"📋 [DEBUG] 상세 피드백 파싱: {detailed_feedback[:100]}...")
        
        # 기본값 설정
        if not comment:
            if is_code_submission:
                comment = "코드 리뷰가 완료되었습니다."
            else:
                comment = "과제 제출에 대한 상세한 피드백이 생성되었습니다."
        if not detailed_feedback:
            detailed_feedback = feedback_text

        # 점수가 존재하지 않거나 파싱 실패 시, 과제-제출물 관련도 기반으로 점수 산정
        if score is None:
            score = derive_score_from_relevance(
                assignment_title=request.assignment_title,
                assignment_description=request.assignment_description,
                submission_content=request.submission_content
            )
        
        # 🎯 최종 채점 결과 검증 및 요약
        print(f"🏆 [CRITICAL] AI 채점 완료 - 최종 결과:")
        print(f"   - 점수: {score}")
        print(f"   - 코멘트: {comment}")
        print(f"   - 첨부파일 읽기 성공: {file_reading_success}")
        print(f"   - 코드 제출 여부: {is_code_submission}")
        
        # 과제-제출물 관련도 평가 (불일치 시 안내 메시지 제공)
        title_tokens = _normalize_text(request.assignment_title or "")
        desc_tokens = _normalize_text(request.assignment_description or "")
        assign_tokens = title_tokens + desc_tokens
        
        # 🎯 중요: 첨부파일 읽기 성공 시 파일 내용도 관련도 계산에 포함
        if file_reading_success and file_content:
            subm_tokens = _normalize_text(file_content + " " + (request.submission_content or ""))
            print(f"🔍 [CRITICAL] 관련도 계산에 첨부파일 내용 포함 ({len(file_content)}자)")
        else:
            subm_tokens = _normalize_text(request.submission_content or "")
            print(f"🔍 [CRITICAL] 관련도 계산에 제출 내용만 사용")
            
        # 기존 Jaccard 유사도와 향상된 관련도 둘 다 계산
        relevance = _jaccard_similarity(assign_tokens, subm_tokens)
        enhanced_relevance = _enhanced_relevance_score(
            assignment_title=request.assignment_title or "",
            assignment_desc=request.assignment_description or "",
            submission_content=request.submission_content or "",
            file_content=file_content if file_reading_success else ""
        )
        print(f"📊 [CRITICAL] 과제-제출물 관련도: {relevance:.3f} (향상된: {enhanced_relevance:.3f})")
        
        # 향상된 관련도를 주로 사용
        relevance = enhanced_relevance

        # 아주 낮은 관련도 또는 극단적 길이 불일치 시, 일반 피드백 대신 불일치 안내를 반환
        try:
            desc_len = max(1, len((request.assignment_description or "").split()))
            sub_len = len((request.submission_content or "").split())
            if file_reading_success and file_content:
                # 첨부파일 읽기 성공 시 파일 내용도 길이에 포함
                sub_len += len(file_content.split())
                print(f"📏 [CRITICAL] 길이 계산에 첨부파일 내용 포함 (총 {sub_len}단어)")
            length_ratio = sub_len / desc_len
        except Exception:
            length_ratio = 0.0

        # 불일치 감지 로직을 더 관대하게 조정
        # 코드 제출물이고 첨부파일이 있으면 더욱 관대하게
        if is_code_submission and file_reading_success:
            relevance_threshold = 0.02
            length_threshold = 0.02
        elif file_reading_success:
            relevance_threshold = 0.04
            length_threshold = 0.03
        elif is_code_submission:
            relevance_threshold = 0.05
            length_threshold = 0.04
        else:
            relevance_threshold = 0.06
            length_threshold = 0.05
        
        mismatch = (relevance < relevance_threshold) and (length_ratio < length_threshold)
        print(f"🎭 [CRITICAL] 불일치 여부: {mismatch} (관련도: {relevance:.3f} >= {relevance_threshold}, 길이비율: {length_ratio:.3f} >= {length_threshold})")

        # 불일치 감지 조건을 더 엄격하게 설정
        # 불일치 처리 로직 개선: 더 신중하고 관대하게
        if mismatch:
            print(f"⚠️ [CRITICAL] 과제-제출물 불일치 감지")
            print(f"⚠️ [CRITICAL]   - 첨부파일 읽기 성공: {file_reading_success}")
            print(f"⚠️ [CRITICAL]   - 코드 제출물: {is_code_submission}")
            print(f"⚠️ [CRITICAL]   - 현재 점수: {score}")
            
            # 1. 점수가 아예 없으면 관련도 기반으로 산정
            if score is None:
                score = derive_score_from_relevance(
                    assignment_title=request.assignment_title,
                    assignment_description=request.assignment_description,
                    submission_content=request.submission_content
                )
                print(f"⚠️ [CRITICAL] 점수 없어서 관련도 기반으로 산정: {score}")
            
            # 2. 첨부파일 읽기에 실패한 경우에만 점수 조정 고려
            elif not file_reading_success:
                # 매우 높은 점수만 제한적으로 조정 (코드가 아닌 경우에만)
                if score > 8 and not is_code_submission:
                    old_score = score
                    score = max(3, min(score, 6))  # 3~6점으로 제한
                    print(f"⚠️ [CRITICAL] 비코드 제출물의 과도한 고점 조정: {old_score} -> {score}")
                elif score > 9:
                    old_score = score
                    score = min(score, 8)  # 최대 8점으로 제한
                    print(f"⚠️ [CRITICAL] 과도한 고점 제한: {old_score} -> {score}")
                else:
                    print(f"✅ [CRITICAL] 점수 유지: {score} (적절한 범위)")
            else:
                print(f"✅ [CRITICAL] 첨부파일 읽기 성공으로 점수 유지: {score}")

            # 불일치 메시지를 덜 공격적으로 수정
            if not file_reading_success and score < 3:
                mismatch_comment = "제출된 내용이 과제 요구사항과 다소 다를 수 있습니다. 추가 설명이나 체크를 다시 해주세요."
                mismatch_detail = (
                    f"제출물 검토 결과:\n\n"
                    f"- 과제 제목: {request.assignment_title}\n"
                    f"- 관련도 지표: {relevance:.2f}\n"
                    f"- 제출물 길이 비율: {length_ratio:.2f}\n"
                    f"- 첨부파일 읽기: {'성공' if file_reading_success else '실패 또는 없음'}\n\n"
                    f"개선 방향:\n"
                    f"1) 과제 설명의 핵심 요구사항 재확인\n"
                    f"2) 관련 기술/개념 키워드 추가\n"
                    f"3) 구체적인 구현 예시나 설명 보강\n"
                    f"4) 첨부파일이 있다면 파일 경로 확인"
                )
                integrated_comment = create_integrated_comment(mismatch_comment, mismatch_detail, is_code_submission)
                detailed_feedback = mismatch_detail
            else:
                # 정상적인 피드백 사용
                integrated_comment = create_integrated_comment(comment, detailed_feedback, is_code_submission)
        else:
            print(f"✅ [CRITICAL] 정상 채점 결과 반환 (첨부파일 읽기: {file_reading_success})")
            # 코멘트와 상세 피드백을 하나로 통합
            integrated_comment = create_integrated_comment(comment, detailed_feedback, is_code_submission)
        
        # 🎯 최종 반환 결과 로깅
        final_result = FeedbackResponse(
            score=score,
            comment=integrated_comment,  # 통합된 코멘트 반환
            detailed_feedback=detailed_feedback
        )
        
        print(f"🚀 [CRITICAL] 최종 FastAPI 응답 준비 완료!")
        print(f"📊 [CRITICAL] 응답 요약:")
        print(f"   - 최종 점수: {score}")
        print(f"   - 첨부파일 읽기 성공: {file_reading_success}")
        print(f"   - 통합 코멘트 길이: {len(integrated_comment)}자")
        print(f"   - 상세 피드백 길이: {len(detailed_feedback)}자")
        print(f"🎉 [CRITICAL] FastAPI AI 채점 프로세스 완료!")
        
        return final_result
        
    except Exception as e:
        print(f"Error in generate_feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=f"피드백 생성 중 오류가 발생했습니다: {str(e)}")

def detect_code_submission(content):
    """
    제출 내용이 코드인지 판단 (첨부파일 형식 정보 포함)
    """
    if not content:
        return False
    
    # 파일 확장자 기반 코드 판단
    code_extensions = [
        'py', 'java', 'js', 'ts', 'jsx', 'tsx', 'cpp', 'c', 'h', 'hpp',
        'cs', 'php', 'rb', 'go', 'rs', 'kt', 'swift', 'html', 'css',
        'scss', 'less', 'sql', 'sh', 'bat', 'json', 'xml', 'yaml', 'yml'
    ]
    
    # 첨부파일 확장자 확인
    if '📎 **첨부파일 내용' in content:
        for ext in code_extensions:
            if f'({ext} 파일)' in content:
                print(f"🔍 [DEBUG] 파일 확장자로 코드 판단: {ext}")
                return True
    
    # 코드로 판단할 수 있는 키워드들 (확장)
    code_keywords = [
        'public', 'private', 'class', 'function', 'def', 'var', 'let', 'const',
        'if', 'else', 'for', 'while', 'return', 'import', 'package', 'namespace',
        'try', 'catch', 'throw', 'new', 'this', 'super', 'extends', 'implements',
        'int', 'String', 'boolean', 'void', 'null', 'true', 'false',
        'console.log', 'System.out.println', 'print', 'printf',
        '=>', '->', '::', '++', '--', '&&', '||', '!', '==', '===', '!=', '!==',
        '#include', 'using namespace', 'std::', 'from', 'as', 'with',
        '@Override', '@Autowired', 'async', 'await', 'yield', 'lambda'
    ]
    
    # 코드 블록 마커 확인
    if '```' in content:
        print(f"🔍 [DEBUG] 코드 블록 마커로 코드 판단")
        return True
    
    # 코드 키워드 확인
    content_lower = content.lower()
    keyword_count = sum(1 for keyword in code_keywords if keyword.lower() in content_lower)
    
    # 키워드가 3개 이상 있으면 코드로 판단
    is_code = keyword_count >= 3
    if is_code:
        print(f"🔍 [DEBUG] 키워드 수로 코드 판단: {keyword_count}개")
    
    return is_code

def _normalize_text(text: str) -> list:
    if not text:
        return []
    try:
        import re
        text = text.lower()
        # 코드 키워드를 보존하고, 특수 문자를 더 관대하게 처리
        text = re.sub(r"[^a-z0-9가-힣\s._-]", " ", text)
        tokens = [t for t in text.split() if len(t) > 1]
        return tokens
    except Exception:
        return text.lower().split()

def _jaccard_similarity(a_tokens: list, b_tokens: list) -> float:
    if not a_tokens or not b_tokens:
        return 0.0
    a_set = set(a_tokens)
    b_set = set(b_tokens)
    inter = len(a_set & b_set)
    union = len(a_set | b_set)
    if union == 0:
        return 0.0
    return inter / union

def _enhanced_relevance_score(assignment_title: str, assignment_desc: str, submission_content: str, file_content: str = "") -> float:
    """
    향상된 관련도 계산 - 단순 Jaccard 유사도보다 더 정교하게 계산
    """
    # 기본 Jaccard 유사도
    title_tokens = _normalize_text(assignment_title or "")
    desc_tokens = _normalize_text(assignment_desc or "")
    assign_tokens = title_tokens + desc_tokens
    
    full_submission = (submission_content or "") + " " + (file_content or "")
    subm_tokens = _normalize_text(full_submission)
    
    jaccard_sim = _jaccard_similarity(assign_tokens, subm_tokens)
    
    # 코드 제출물인 경우 관련도를 더 관대하게 계산
    is_code = detect_code_submission(full_submission)
    if is_code:
        # 코드 제출물의 경우 더 관대한 점수 부여
        jaccard_sim *= 1.5
        
        # 코드 키워드 보너스
        code_keywords = ['class', 'function', 'def', 'public', 'private', 'import', 'package']
        bonus = sum(1 for keyword in code_keywords if keyword in full_submission.lower()) * 0.02
        jaccard_sim += min(bonus, 0.1)  # 최대 0.1 보너스
    
    # 길이 보정 - 너무 짧지 않으면 보너스
    if len(subm_tokens) >= 20:  # 20단어 이상이면 보너스
        length_bonus = min(0.05, len(subm_tokens) / 1000)  # 최대 0.05 보너스
        jaccard_sim += length_bonus
    
    return min(1.0, jaccard_sim)  # 1.0을 초과하지 않도록 제한

def derive_score_from_relevance(assignment_title: str, assignment_description: str, submission_content: str) -> int:
    """
    LLM이 점수를 명시하지 않았을 때, 과제 내용과 제출물의 관련도를 기반으로 점수 산정.
    점수는 최종적으로 -5 ~ 10 범위로 클램프.
    """
    # 비어있거나 매우 짧은 제출물은 강한 감점
    if not submission_content or len(submission_content.strip()) < 10:
        return -5

    # 향상된 관련도 계산 사용
    enhanced_sim = _enhanced_relevance_score(
        assignment_title=assignment_title or "",
        assignment_desc=assignment_description or "",
        submission_content=submission_content or "",
        file_content=""  # 여기서는 파일 내용 없음
    )

    # 길이 기반 보정
    try:
        desc_len = max(1, len((assignment_description or "").split()))
        sub_len = len((submission_content or "").split())
        length_ratio = sub_len / desc_len
    except Exception:
        length_ratio = 0.0

    # 더 관대한 휴리스틱 맵핑
    if enhanced_sim < 0.02:
        base = -5
    elif enhanced_sim < 0.05:
        base = -2
    elif enhanced_sim < 0.1:
        base = 0
    elif enhanced_sim < 0.2:
        base = 2
    elif enhanced_sim < 0.4:
        base = 4
    else:
        base = 6

    # 길이 보정 - 덜 엄격하게
    if length_ratio < 0.05:
        base -= 2
    elif length_ratio < 0.1:
        base -= 1

    # 코드 제출물인 경우 보너스
    if detect_code_submission(submission_content):
        base += 1

    # 범위 제한
    return max(-5, min(10, int(base)))

def create_integrated_content(file_content: str, submission_content: str, file_url: str = None) -> str:
    """
    첨부파일 텍스트화 내용과 과제 내용을 통합하여 한번에 피드백할 수 있는 형태로 구성
    
    Args:
        file_content: 읽어온 첨부파일의 텍스트 내용
        submission_content: 사용자가 입력한 과제 제출 내용
        file_url: 첨부파일 URL (선택사항)
    
    Returns:
        str: 통합된 콘텐츠
    """
    print(f"🔧 [DEBUG] create_integrated_content 함수 시작")
    print(f"🔧 [DEBUG] 입력 파라미터:")
    print(f"   - file_content 길이: {len(file_content) if file_content else 0}")
    print(f"   - submission_content 길이: {len(submission_content) if submission_content else 0}")
    print(f"   - file_url: {file_url}")
    
    integrated_parts = []
    
    # 1. 첨부파일이 있고 유효한 경우
    print(f"🔍 [DEBUG] 첨부파일 유효성 검사 시작")
    print(f"   - file_content 존재: {bool(file_content)}")
    if file_content:
        print(f"   - file_content 길이: {len(file_content)}")
        print(f"   - 에러 메시지 포함 여부: {file_content.startswith('파일을 찾을 수 없습니다') or file_content.startswith('파일을 읽을 수 없습니다')}")
        print(f"   - file_content 앞부분: '{file_content[:100]}'")
    
    if file_content and not file_content.startswith("파일을 찾을 수 없습니다") and not file_content.startswith("파일을 읽을 수 없습니다"):
        print(f"📄 [DEBUG] 첨부파일 텍스트화 내용 추가 (길이: {len(file_content)}자)")
        
        # 파일 형식 정보 추가
        file_info = ""
        if file_url:
            file_extension = file_url.split('.')[-1].lower() if '.' in file_url else "unknown"
            file_info = f" ({file_extension} 파일)"
        
        integrated_parts.append(f"📎 **첨부파일 내용{file_info}:**")
        integrated_parts.append("```")
        integrated_parts.append(file_content.strip())
        integrated_parts.append("```")
        integrated_parts.append("")  # 구분을 위한 빈 줄
        
        print(f"✅ [DEBUG] 첨부파일 내용 통합 완료")
    else:
        print(f"⚠️ [DEBUG] 첨부파일 내용 통합 건너뜀")
        if file_content:
            print(f"   - 파일 읽기 실패: {file_content[:100]}")
        else:
            print(f"   - 파일 내용 없음")
    
    # 2. 과제 제출 내용 추가
    print(f"🔍 [DEBUG] 과제 제출 내용 확인")
    print(f"   - submission_content 존재: {bool(submission_content)}")
    if submission_content:
        print(f"   - submission_content 길이: {len(submission_content)}")
        print(f"   - 공백 제거 후 길이: {len(submission_content.strip())}")
        print(f"   - 내용 미리보기: '{submission_content[:100]}'")
    
    if submission_content and submission_content.strip():
        print(f"📝 [DEBUG] 과제 제출 내용 추가 (길이: {len(submission_content)}자)")
        
        # 첨부파일이 있는 경우와 없는 경우 구분
        if integrated_parts:
            integrated_parts.append("📝 **과제 제출 내용:**")
        
        integrated_parts.append(submission_content.strip())
        print(f"✅ [DEBUG] 과제 제출 내용 통합 완료")
    else:
        print(f"⚠️ [DEBUG] 과제 제출 내용 없음 또는 빈 문자열")
    
    # 3. 내용이 전혀 없는 경우
    if not integrated_parts:
        print(f"⚠️ [DEBUG] 통합할 내용이 없음")
        return "제출된 내용이 없습니다."
    
    final_content = "\n".join(integrated_parts)
    print(f"🎯 [DEBUG] 최종 통합 완료 - 총 길이: {len(final_content)}자")
    print(f"🎯 [DEBUG] 최종 통합 내용:")
    print("="*60)
    print(final_content)
    print("="*60)
    
    return final_content

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

@app.get("/debug/file-info")
async def debug_file_info(file_url: str):
    """
    디버깅용: 파일 정보 확인 엔드포인트
    """
    try:
        print(f"🔍 [DEBUG] 파일 정보 확인 요청: {file_url}")
        
        if not file_url.startswith('/api/files/'):
            return {"error": "잘못된 파일 URL 형식", "file_url": file_url}
        
        # 파일 경로 구성
        relative_path = file_url.replace('/api/files/', '')
        base_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
        file_path = os.path.join(base_path, relative_path)
        
        # 디렉토리 정보
        directory = os.path.dirname(file_path)
        
        result = {
            "file_url": file_url,
            "relative_path": relative_path,
            "base_path": base_path,
            "full_file_path": file_path,
            "directory": directory,
            "file_exists": os.path.exists(file_path),
            "directory_exists": os.path.exists(directory),
            "current_working_directory": os.getcwd()
        }
        
        # 디렉토리 내용 확인
        if os.path.exists(directory):
            result["directory_contents"] = os.listdir(directory)
        
        # uploads 디렉토리 전체 구조 확인
        uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
        if os.path.exists(uploads_dir):
            result["uploads_structure"] = {}
            for item in os.listdir(uploads_dir):
                item_path = os.path.join(uploads_dir, item)
                if os.path.isdir(item_path):
                    result["uploads_structure"][item] = os.listdir(item_path)
                else:
                    result["uploads_structure"][item] = "file"
        
        return result
        
    except Exception as e:
        return {"error": str(e), "file_url": file_url}

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

