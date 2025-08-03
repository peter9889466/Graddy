// src/hooks/useOutsideClick.ts
import { useCallback, useEffect, useRef } from 'react';

type Callback = () => void;

/**
 * 특정 엘리먼트 외부 클릭을 감지하여 콜백을 실행하는 커스텀 훅
 * @returns 콜백을 등록할 수 있는 함수를 반환합니다.
 */
export const useOutsideClick = () => {
    const handlersRef = useRef<Map<HTMLElement, Callback>>(new Map());

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            handlersRef.current.forEach((callback, element) => {
                if (element && !element.contains(e.target as Node)) {
                    callback();
                }
            });
        };

        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

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