#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import uvicorn
import sys
import os

# 시스템 인코딩을 UTF-8로 설정
if sys.platform.startswith('win'):
    import locale
    try:
        locale.setlocale(locale.LC_ALL, 'ko_KR.UTF-8')
    except:
        try:
            locale.setlocale(locale.LC_ALL, 'Korean_Korea.UTF8')
        except:
            pass

# 표준 출력/에러를 UTF-8로 설정
try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except:
    pass

if __name__ == "__main__":
    print("Starting FastAPI server with UTF-8 encoding...")
    print(f"System encoding: {sys.getdefaultencoding()}")
    print(f"Stdout encoding: {getattr(sys.stdout, 'encoding', 'unknown')}")
    
    # Uvicorn 서버 실행 (인코딩 설정 포함)
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
        access_log=True,
        use_colors=True
    )
