import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
    sub: string; // 사용자 ID (subject)
    iat: number; // 발급 시간
    exp: number; // 만료 시간
}

export const getUserIdFromToken = (): string | null => {
    try {
        const token = localStorage.getItem('userToken');
        if (!token) {
            console.log('토큰이 없습니다.');
            return null;
        }

        const decoded = jwtDecode<JwtPayload>(token);
        
        if (decoded && decoded.sub) {
            return decoded.sub;
        }
        
        console.log('토큰에서 사용자 ID를 찾을 수 없습니다.');
        return null;
    } catch (error) {
        console.error('JWT 디코딩 실패:', error);
        return null;
    }
};

export const isTokenExpired = (): boolean => {
    try {
        const token = localStorage.getItem('userToken');
        if (!token) return true;

        const decoded = jwtDecode<JwtPayload>(token);
        const currentTime = Date.now() / 1000; // 현재 시간을 초 단위로 변환
        
        return decoded.exp < currentTime;
    } catch (error) {
        console.error('토큰 만료 확인 실패:', error);
        return true;
    }
};

