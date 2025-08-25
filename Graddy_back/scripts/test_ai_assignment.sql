-- AI 과제 생성 테스트를 위한 데이터 확인 및 설정

-- 1. study_project_member 테이블에 테스트 데이터가 있는지 확인
SELECT * FROM study_project_member WHERE study_project_id = 14;

-- 2. 만약 데이터가 없다면 테스트 데이터 삽입
INSERT INTO study_project_member (user_id, study_project_id, study_project_check, member_type, joined_at) 
VALUES ('nano1', 14, 'approved', 'leader', NOW())
ON DUPLICATE KEY UPDATE study_project_check = 'approved', member_type = 'leader', joined_at = NOW();

-- 3. assignments 테이블 구조 확인
DESCRIBE assignments;

-- 4. 기존 과제 데이터 확인
SELECT * FROM assignments WHERE study_project_id = 14 ORDER BY created_at DESC;

-- 5. AI 과제 생성 후 결과 확인
-- (API 호출 후 실행)
SELECT 
    assignment_id,
    study_project_id,
    member_id,
    title,
    description,
    deadline,
    file_url,
    created_at,
    DATEDIFF(deadline, created_at) as days_until_deadline
FROM assignments 
WHERE study_project_id = 14 
ORDER BY created_at DESC;
