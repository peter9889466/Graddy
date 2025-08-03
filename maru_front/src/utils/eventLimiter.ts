import { useCallback, useRef } from 'react';

/**
 * 디바운스 훅
 * - 마지막 호출 후 지정된 시간이 지나야 실행
 * - 사용자 입력 완료 후 처리 (예: 검색)
 * - 검색 입력 멈춘 후 500ms 뒤 API 호출
 * @param callback 실행할 함수
 * @param delay 지연 시간 (ms)
 * @returns 디바운스된 함수
 */
export const useDebounce = <T extends (...args: any[]) => any>(
    callback: T,
    delay: number
): T => {
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    return useCallback(
        ((...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                callback(...args);
            }, delay);
        }) as T,
        [callback, delay]
    );
};

/**
 * 스로틀링 훅
 * - 지정된 시간 간격으로만 실행
 * - 고정된 간격으로 이벤트 처리 (예: 스크롤)
 * - 스크롤 시 500ms마다 위치 업데이트
 * @param callback 실행할 함수
 * @param delay 간격 시간 (ms)
 * @returns 스로틀된 함수
 */
export const useThrottle = <T extends (...args: any[]) => any>(
    callback: T,
    delay: number
): T => {
    const lastCallRef = useRef<number>(0);
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    return useCallback(
        ((...args: Parameters<T>) => {
            const now = Date.now();

            if (now - lastCallRef.current >= delay) {
                lastCallRef.current = now;
                callback(...args);
            } else {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }

                timeoutRef.current = setTimeout(() => {
                    lastCallRef.current = Date.now();
                    callback(...args);
                }, delay - (now - lastCallRef.current));
            }
        }) as T,
        [callback, delay]
    );
};