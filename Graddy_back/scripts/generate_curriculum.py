#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import json
import openai
import os
from datetime import datetime
from dotenv import load_dotenv

# .env 파일 로딩
load_dotenv()

def generate_curriculum(study_id, study_name, study_title, study_desc, study_level, 
                       interest_tags, study_start, study_end):
    """
    OpenAI GPT를 사용하여 스터디 커리큘럼을 생성합니다.
    
    Args:
        study_id: 스터디 ID
        study_name: 스터디명
        study_title: 스터디 제목
        study_desc: 스터디 설명
        study_level: 스터디 레벨 (1 - 3)
        interest_tags: 관심 태그들 (쉼표로 구분)
        study_start: 스터디 시작일
        study_end: 스터디 마감일
    
    Returns:
        생성된 커리큘럼 문자열
    """
    
    # OpenAI API 키 설정 (.env 파일에서 가져오기)
    openai.api_key = os.getenv('OPENAI_API_KEY')
    
    if not openai.api_key:
        print("ERROR: OPENAI_API_KEY가 .env 파일에 설정되지 않았습니다.", file=sys.stderr)
        print("프로젝트 루트 디렉토리에 .env 파일을 생성하고 OPENAI_API_KEY를 설정하세요.", file=sys.stderr)
        sys.exit(1)
    
    # 레벨에 따른 설명 생성
    level_descriptions = {
        1: "초급자 (기초 개념 학습)",
        2: "중급자 (기본 실습 및 응용)",
        3: "고급자 (심화 학습 및 프로젝트)"
    }
    
    level_desc = level_descriptions.get(study_level, level_descriptions.get(study_level))
    
    # 관심 태그들을 리스트로 변환
    tags_list = [tag.strip() for tag in interest_tags.split(',') if tag.strip()]
    
    # 프롬프트 구성
    prompt = f"""
다음 정보를 바탕으로 {study_name} 스터디를 위한 상세한 커리큘럼을 생성해주세요.

**스터디 정보:**
- 스터디명: {study_name}
- 제목: {study_title}
- 설명: {study_desc}
- 수준: {level_desc} (레벨 {study_level})
- 관심 분야: {', '.join(tags_list)}
- 기간: {study_start} ~ {study_end}

**요구사항:**
1. 스터디 기간에 맞는 주차별 커리큘럼을 작성해주세요
2. 각 주차별로 학습 목표, 주요 내용, 실습 과제를 포함해주세요
3. {', '.join(tags_list)} 분야의 핵심 개념들을 체계적으로 학습할 수 있도록 구성해주세요
4. 레벨 {study_level}에 맞는 적절한 난이도로 구성해주세요
5. 실무 적용 가능한 실습과 프로젝트를 포함해주세요

**출력 형식:**
- 마크다운 형식으로 작성
- 주차별로 명확하게 구분
- 각 주차마다 학습 목표, 주요 내용, 실습 과제 포함
- 마지막에 전체 학습 성과 평가 방법 제시

한국어로 작성해주세요.
"""
    
    try:
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
        
        # 생성된 커리큘럼 출력
        print(curriculum)
        
        return curriculum
        
    except Exception as e:
        print(f"ERROR: OpenAI API 호출 중 오류가 발생했습니다: {str(e)}", file=sys.stderr)
        sys.exit(1)

def main():
    """메인 함수"""
    if len(sys.argv) != 9:
        print("ERROR: 올바른 인자 개수가 아닙니다.", file=sys.stderr)
        print("사용법: python generate_curriculum.py <study_id> <study_name> <study_title> <study_desc> <study_level> <interest_tags> <study_start> <study_end>", file=sys.stderr)
        sys.exit(1)
    
    # 명령행 인자 파싱
    study_id = sys.argv[1]
    study_name = sys.argv[2]
    study_title = sys.argv[3]
    study_desc = sys.argv[4]
    study_level = int(sys.argv[5])
    interest_tags = sys.argv[6]
    study_start = sys.argv[7]
    study_end = sys.argv[8]
    
    # 커리큘럼 생성
    generate_curriculum(study_id, study_name, study_title, study_desc, 
                       study_level, interest_tags, study_start, study_end)

if __name__ == "__main__":
    main()
