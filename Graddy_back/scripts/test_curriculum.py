#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
AI 커리큘럼 생성 시스템 테스트 스크립트
"""

import os
import sys
from dotenv import load_dotenv

# .env 파일 로딩
load_dotenv()

# 현재 디렉토리를 Python 경로에 추가
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_curriculum_generation():
    """커리큘럼 생성 테스트"""
    
    # 테스트 데이터
    test_data = {
        'study_id': '1',
        'study_name': '웹 개발 기초 스터디',
        'study_title': 'HTML, CSS, JavaScript로 시작하는 웹 개발',
        'study_desc': '웹 개발의 기초를 다지고 간단한 웹사이트를 만들어보는 스터디입니다.',
        'study_level': '2',
        'interest_tags': '웹개발,프로그래밍,프론트엔드',
        'study_start': '2024-01-01 00:00:00',
        'study_end': '2024-03-31 23:59:59'
    }
    
    print("=== AI 커리큘럼 생성 시스템 테스트 ===")
    print(f"스터디명: {test_data['study_name']}")
    print(f"제목: {test_data['study_title']}")
    print(f"설명: {test_data['study_desc']}")
    print(f"레벨: {test_data['study_level']}")
    print(f"관심 태그: {test_data['interest_tags']}")
    print(f"기간: {test_data['study_start']} ~ {test_data['study_end']}")
    print()
    
    # OpenAI API 키 확인 (.env 파일에서)
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ OPENAI_API_KEY가 .env 파일에 설정되지 않았습니다.")
        print("프로젝트 루트 디렉토리에 .env 파일을 생성하고 OPENAI_API_KEY를 설정하세요.")
        return False
    
    print("✅ OpenAI API 키가 .env 파일에서 로드되었습니다.")
    
    # generate_curriculum 모듈 테스트
    try:
        from generate_curriculum import generate_curriculum
        
        print("\n=== 커리큘럼 생성 테스트 ===")
        curriculum = generate_curriculum(
            test_data['study_id'],
            test_data['study_name'],
            test_data['study_title'],
            test_data['study_desc'],
            int(test_data['study_level']),
            test_data['interest_tags'],
            test_data['study_start'],
            test_data['study_end']
        )
        
        if curriculum:
            print("✅ 커리큘럼이 성공적으로 생성되었습니다!")
            print("\n=== 생성된 커리큘럼 ===")
            print(curriculum)
            return True
        else:
            print("❌ 커리큘럼 생성에 실패했습니다.")
            return False
            
    except ImportError as e:
        print(f"❌ generate_curriculum 모듈을 불러올 수 없습니다: {e}")
        return False
    except Exception as e:
        print(f"❌ 커리큘럼 생성 중 오류가 발생했습니다: {e}")
        return False

def test_environment():
    """환경 설정 테스트"""
    print("=== 환경 설정 테스트 ===")
    
    # Python 버전 확인
    python_version = sys.version_info
    print(f"Python 버전: {python_version.major}.{python_version.minor}.{python_version.micro}")
    
    if python_version < (3, 7):
        print("❌ Python 3.7 이상이 필요합니다.")
        return False
    else:
        print("✅ Python 버전이 적절합니다.")
    
    # 필요한 패키지 확인
    required_packages = ['openai', 'dotenv']
    missing_packages = []
    
    for package in required_packages:
        try:
            if package == 'dotenv':
                __import__('dotenv')
            else:
                __import__(package)
            print(f"✅ {package} 패키지가 설치되어 있습니다.")
        except ImportError:
            print(f"❌ {package} 패키지가 설치되어 있지 않습니다.")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n설치가 필요한 패키지: {', '.join(missing_packages)}")
        print("다음 명령어로 설치하세요:")
        print("pip install -r requirements.txt")
        return False
    
    return True

def main():
    """메인 함수"""
    print("AI 커리큘럼 생성 시스템 테스트를 시작합니다...\n")
    
    # 환경 설정 테스트
    if not test_environment():
        print("\n❌ 환경 설정 테스트에 실패했습니다.")
        return
    
    print()
    
    # 커리큘럼 생성 테스트
    if test_curriculum_generation():
        print("\n🎉 모든 테스트가 성공적으로 완료되었습니다!")
    else:
        print("\n❌ 커리큘럼 생성 테스트에 실패했습니다.")

if __name__ == "__main__":
    main()
