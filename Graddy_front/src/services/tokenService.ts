/**
 * JWT 토큰 관련 유틸리티 서비스
 */
export class TokenService {
    private static instance: TokenService;

    private constructor() {}

    public static getInstance(): TokenService {
        if (!TokenService.instance) {
            TokenService.instance = new TokenService();
        }
        return TokenService.instance;
    }

    /**
     * 토큰이 유효한지 확인
     * @param token JWT 토큰
     * @returns 토큰 유효성 여부
     */
    public isTokenValid(token: string | null): boolean {
        if (!token) return false;
        
        try {
            // JWT 토큰의 payload 부분을 디코딩
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            
            // 만료 시간 확인
            return payload.exp > currentTime;
        } catch (error) {
            console.error('토큰 유효성 검사 중 오류:', error);
            return false;
        }
    }

    /**
     * JWT 토큰에서 사용자 ID 추출
     * @param token JWT 토큰 (선택사항, 없으면 localStorage에서 가져옴)
     * @returns 사용자 ID
     */
    public getUserIdFromToken(token?: string): string | null {
        const targetToken = token || localStorage.getItem('userToken');
        
        if (!targetToken) return null;
        
        try {
            // JWT 토큰의 payload 부분을 디코딩
            const payload = JSON.parse(atob(targetToken.split('.')[1]));
            return payload.userId || payload.sub || null;
        } catch (error) {
            console.error('토큰에서 사용자 ID 추출 중 오류:', error);
            return null;
        }
    }

    /**
     * Access Token을 갱신
     * @returns 새로운 Access Token
     */
    public async refreshAccessToken(): Promise<string> {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
            throw new Error('Refresh Token이 없습니다.');
        }

        try {
            const response = await fetch('http://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) {
                throw new Error('토큰 갱신에 실패했습니다.');
            }

            const data = await response.json();
            
            if (data.expiredRefreshToken) {
                // Refresh Token이 만료된 경우
                localStorage.removeItem('userToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userData');
                throw new Error('Refresh Token이 만료되었습니다. 다시 로그인해주세요.');
            }

            const newAccessToken = data.data.accessToken;
            localStorage.setItem('userToken', newAccessToken);
            
            return newAccessToken;
        } catch (error) {
            console.error('토큰 갱신 실패:', error);
            throw error;
        }
    }
}
