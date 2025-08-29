#!/bin/bash

# UTF-8 인코딩 설정
export LANG=ko_KR.UTF-8
export LC_ALL=ko_KR.UTF-8

echo "FastAPI AI Curriculum Generator Server Starting..."
echo

# Python 가상환경 활성화 (있는 경우)
# source venv/bin/activate

# 필요한 패키지 설치
echo "Installing required packages..."
pip install -r requirements.txt

echo
echo "Starting FastAPI server on http://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com"
echo "Press Ctrl+C to stop the server"
echo

# FastAPI 서버 실행 (인코딩 설정 포함)
python uvicorn_config.py
