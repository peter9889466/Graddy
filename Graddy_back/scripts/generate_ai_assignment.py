#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import json
import openai
import os
import mysql.connector
from datetime import datetime, timedelta
from dotenv import load_dotenv

# .env 파일 로딩
load_dotenv()

def get_study_info(study_id):
    """
    데이터베이스에서 스터디 정보를 조회합니다.
    
    Args:
        study_id: 스터디 ID
    
    Returns:
        스터디 정보 딕셔너리
    """
    try:
        # 데이터베이스 연결
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', ''),
            database=os.getenv('DB_NAME', 'graddy')
        )
        
        cursor = connection.cursor(dictionary=True)
        
        # 스터디 기본 정보 조회
        cursor.execute("""
            SELECT sp.study_project_id, sp.study_project_name, sp.study_project_title, 
                   sp.study_project_desc, sp.study_level, sp.cur_text, sp.study_project_start, 
                   sp.study_project_end, sp.study_project_total
            FROM study_project sp
            WHERE sp.study_project_id = %s
        """, (study_id,))
        
        study_info = cursor.fetchone()
        if not study_info:
            raise Exception(f"스터디 ID {study_id}를 찾을 수 없습니다.")
        
        # 태그 정보 조회
        cursor.execute("""
            SELECT i.interest_name
            FROM tag t
            JOIN interest i ON t.interest_id = i.interest_id
            WHERE t.study_project_id = %s
        """, (study_id,))
        
        tags = [row['interest_name'] for row in cursor.fetchall()]
        
        # 멤버 수 조회
        cursor.execute("""
            SELECT COUNT(*) as member_count
            FROM member m
            WHERE m.study_project_id = %s AND m.study_project_check = 'approved'
        """, (study_id,))
        
        member_count = cursor.fetchone()['member_count']
        
        cursor.close()
        connection.close()
        
        study_info['tags'] = tags
        study_info['member_count'] = member_count
        
        return study_info
        
    except Exception as e:
        print(f"ERROR: 데이터베이스 조회 중 오류가 발생했습니다: {str(e)}", file=sys.stderr)
        sys.exit(1)

def generate_ai_assignment(study_info, assignment_type="general"):
    """
    OpenAI GPT를 사용하여 AI 과제를 생성합니다.
    
    Args:
        study_info: 스터디 정보 딕셔너리
        assignment_type: 과제 유형 ("general", "quiz", "project", "review")
    
    Returns:
        생성된 과제 딕셔너리
    """
    
    # OpenAI API 키 설정
    openai.api_key = os.getenv('OPENAI_API_KEY')
    
    if not openai.api_key:
        print("ERROR: OPENAI_API_KEY가 .env 파일에 설정되지 않았습니다.", file=sys.stderr)
        sys.exit(1)
    
    # 레벨에 따른 난이도 설명
    level_descriptions = {
        1: "초급자 수준 (기초 개념 이해 및 간단한 실습)",
        2: "중급자 수준 (기본 실습 및 응용 문제)",
        3: "고급자 수준 (심화 학습 및 프로젝트 기반)"
    }
    
    level_desc = level_descriptions.get(study_info['study_level'], "기본 수준")
    
    # 과제 유형별 설명
    assignment_type_descriptions = {
        "general": "일반적인 학습 과제",
        "quiz": "퀴즈 형태의 과제",
        "project": "프로젝트 기반 과제",
        "review": "복습 및 정리 과제"
    }
    
    type_desc = assignment_type_descriptions.get(assignment_type, "일반적인 학습 과제")
    
    # 프롬프트 구성
    prompt = f"""
다음 정보를 바탕으로 {study_info['study_project_name']} 스터디를 위한 {type_desc}를 생성해주세요.

**스터디 정보:**
- 스터디명: {study_info['study_project_name']}
- 제목: {study_info['study_project_title']}
- 설명: {study_info['study_project_desc']}
- 수준: {level_desc} (레벨 {study_info['study_level']})
- 관심 분야: {', '.join(study_info['tags'])}
- 기간: {study_info['study_project_start']} ~ {study_info['study_project_end']}
- 현재 멤버 수: {study_info['member_count']}명
- 커리큘럼: {study_info['cur_text']}

**과제 요구사항:**
1. 레벨 {study_info['study_level']}에 맞는 적절한 난이도로 구성
2. {', '.join(study_info['tags'])} 분야의 핵심 개념을 포함
3. 실무 적용 가능한 실습 요소 포함
4. 팀워크와 협업을 고려한 과제 설계
5. 명확한 평가 기준과 마감일 제시

**출력 형식 (JSON):**
{{
    "title": "과제 제목",
    "description": "상세한 과제 설명",
    "learning_objectives": ["학습 목표 1", "학습 목표 2", "학습 목표 3"],
    "requirements": ["요구사항 1", "요구사항 2", "요구사항 3"],
    "submission_format": "제출 형식 설명",
    "evaluation_criteria": ["평가 기준 1", "평가 기준 2", "평가 기준 3"],
    "estimated_duration": "예상 소요 시간",
    "difficulty_level": "난이도 설명",
    "tags": ["관련 태그 1", "관련 태그 2"],
    "additional_resources": ["추가 자료 1", "추가 자료 2"]
}}

한국어로 작성하고, JSON 형식을 정확히 지켜주세요.
"""
    
    try:
        # OpenAI GPT API 호출
        response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "당신은 교육 전문가이자 과제 설계 전문가입니다. 체계적이고 실용적인 학습 과제를 설계하는 것이 특기입니다. 항상 요청된 JSON 형식으로 응답해주세요."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2000,
            temperature=0.7
        )
        
        # 응답에서 JSON 추출
        response_content = response.choices[0].message.content.strip()
        
        # JSON 파싱
        try:
            assignment_data = json.loads(response_content)
            return assignment_data
        except json.JSONDecodeError:
            # JSON 파싱 실패 시 텍스트로 반환
            return {
                "title": "AI 생성 과제",
                "description": response_content,
                "learning_objectives": ["AI가 생성한 과제입니다."],
                "requirements": ["과제 내용을 확인하세요."],
                "submission_format": "자유 형식",
                "evaluation_criteria": ["과제 완성도"],
                "estimated_duration": "1-2주",
                "difficulty_level": f"레벨 {study_info['study_level']}",
                "tags": study_info['tags'],
                "additional_resources": []
            }
        
    except Exception as e:
        print(f"ERROR: OpenAI API 호출 중 오류가 발생했습니다: {str(e)}", file=sys.stderr)
        sys.exit(1)

def save_assignment_to_db(study_id, assignment_data, member_id):
    """
    생성된 과제를 데이터베이스에 저장합니다.
    
    Args:
        study_id: 스터디 ID
        assignment_data: 과제 데이터
        member_id: 과제 생성자 member_id
    """
    try:
        # 데이터베이스 연결
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', ''),
            database=os.getenv('DB_NAME', 'graddy')
        )
        
        cursor = connection.cursor()
        
        # 기본 마감일 설정 (7일 후)
        deadline = datetime.now() + timedelta(days=7)
        
        # 과제 저장
        cursor.execute("""
            INSERT INTO assignments (study_project_id, member_id, title, description, 
                                   deadline, file_url, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            study_id,
            member_id,
            assignment_data['title'],
            assignment_data['description'],
            deadline,
            json.dumps(assignment_data, ensure_ascii=False),  # 전체 데이터를 JSON으로 저장
            datetime.now()
        ))
        
        connection.commit()
        cursor.close()
        connection.close()
        
        print(f"과제가 성공적으로 저장되었습니다. ID: {cursor.lastrowid}")
        
    except Exception as e:
        print(f"ERROR: 데이터베이스 저장 중 오류가 발생했습니다: {str(e)}", file=sys.stderr)
        sys.exit(1)

def main():
    """메인 함수"""
    if len(sys.argv) < 3:
        print("ERROR: 올바른 인자 개수가 아닙니다.", file=sys.stderr)
        print("사용법: python generate_ai_assignment.py <study_id> <member_id> [assignment_type]", file=sys.stderr)
        print("assignment_type: general, quiz, project, review (기본값: general)", file=sys.stderr)
        sys.exit(1)
    
    # 명령행 인자 파싱
    study_id = int(sys.argv[1])
    member_id = int(sys.argv[2])
    assignment_type = sys.argv[3] if len(sys.argv) > 3 else "general"
    
    print(f"스터디 ID {study_id}에 대한 AI 과제 생성을 시작합니다...")
    print(f"과제 유형: {assignment_type}")
    
    # 1. 스터디 정보 조회
    print("1. 스터디 정보를 조회하고 있습니다...")
    study_info = get_study_info(study_id)
    print(f"   - 스터디명: {study_info['study_project_name']}")
    print(f"   - 레벨: {study_info['study_level']}")
    print(f"   - 태그: {', '.join(study_info['tags'])}")
    
    # 2. AI 과제 생성
    print("2. OpenAI를 사용하여 AI 과제를 생성하고 있습니다...")
    assignment_data = generate_ai_assignment(study_info, assignment_type)
    
    # 3. 과제 데이터 출력
    print("3. 생성된 과제:")
    print(json.dumps(assignment_data, ensure_ascii=False, indent=2))
    
    # 4. 데이터베이스에 저장
    print("4. 데이터베이스에 과제를 저장하고 있습니다...")
    save_assignment_to_db(study_id, assignment_data, member_id)
    
    print("AI 과제 생성이 완료되었습니다!")

if __name__ == "__main__":
    main()
