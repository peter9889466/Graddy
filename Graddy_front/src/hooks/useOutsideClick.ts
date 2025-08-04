// src/hooks/useOutsideClick.ts
import { useCallback, useEffect, useRef } from 'react';
import { useThrottle } from '../utils/eventLimiter';

type Callback = () => void;

/**
 * 특정 엘리먼트 외부 클릭을 감지하여 콜백을 실행하는 커스텀 훅
 * @param throttleDelay 스로틀링 지연 시간 (기본값: 50ms)
 * @returns 콜백을 등록할 수 있는 함수를 반환합니다.
 */
export const useOutsideClick = (throttleDelay: number = 50) => {
    const handlersRef = useRef<Map<HTMLElement, Callback>>(new Map());

    // 스로틀된 클릭 핸들러
    const throttledHandleClick = useThrottle((e: MouseEvent) => {
        handlersRef.current.forEach((callback, element) => {
            if (element && !element.contains(e.target as Node)) {
                callback();
            }
        });
    }, throttleDelay);

    useEffect(() => {
        document.addEventListener('mousedown', throttledHandleClick);
        return () => document.removeEventListener('mousedown', throttledHandleClick);
    }, [throttledHandleClick]);

    // 콜백과 엘리먼트를 Map에 등록하고, 클린업 함수를 반환하는 함수
    const register = useCallback((callback: Callback) => {
        return (element: HTMLElement | null) => {
            if (!element) return;
            handlersRef.current.set(element, callback);

            return () => {
                handlersRef.current.delete(element);
            };
        };
    }, []);

    return register;
};