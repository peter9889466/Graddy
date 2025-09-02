// JWT 토큰에서 사용자 정보 추출
export const getUserFromToken = () => {
    const token = localStorage.getItem('userToken');
    if (!token) return null;

    try {
        // JWT 토큰의 payload 부분 디코딩
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            userId: payload.sub, // JWT의 subject가 userId
            // 필요한 다른 정보들도 여기서 추출 가능
        };
    } catch (error) {
        console.error('토큰 파싱 실패:', error);
        return null;
    }
};

// 로그인 상태 확인
export const isAuthenticated = () => {
    const token = localStorage.getItem('userToken');
    if (!token) return false;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        return payload.exp > currentTime; // 토큰 만료 시간 확인
    } catch (error) {
        return false;
    }
};