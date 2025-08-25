-- study_project_member 테이블에 테스트 데이터 삽입
-- 이 스크립트는 개발/테스트 환경에서 사용됩니다.

-- 기존 데이터가 있다면 삭제 (선택사항)
-- DELETE FROM study_project_member;

-- 테스트 데이터 삽입
-- study_project_id가 14인 스터디에 user_id가 'nano1'인 사용자를 리더로 추가
INSERT INTO study_project_member (user_id, study_project_id, study_project_check, member_type, joined_at) 
VALUES ('nano1', 14, 'approved', 'leader', NOW())
ON DUPLICATE KEY UPDATE study_project_check = 'approved', member_type = 'leader', joined_at = NOW();

-- 추가 테스트 데이터 (필요시 사용)
-- INSERT INTO study_project_member (user_id, study_project_id, study_project_check, member_type, joined_at) 
-- VALUES ('user2', 14, 'approved', 'member', NOW());

-- INSERT INTO study_project_member (user_id, study_project_id, study_project_check, member_type, joined_at) 
-- VALUES ('user3', 14, 'approved', 'member', NOW());

-- 데이터 확인
SELECT * FROM study_project_member WHERE study_project_id = 14;
