// src/utils/keyPress.ts
import React from 'react';

interface KeyHandlers {
    onEnter?: (event: React.KeyboardEvent) => void;
    onEscape?: (event: React.KeyboardEvent) => void;
    onArrowUp?: (event: React.KeyboardEvent) => void;
    onArrowDown?: (event: React.KeyboardEvent) => void;
    [key: string]: ((event: React.KeyboardEvent) => void) | undefined;
}

/**
 * 키보드 이벤트를 선언적으로 처리하는 유틸리티 함수
 * @param handlers - 키별 이벤트 핸들러 객체
 * @returns React의 onKeyDown 핸들러
 */
export const keyPress = (handlers: KeyHandlers) => {
    return (event: React.KeyboardEvent) => {
        const keyMap = {
            'Enter': handlers.onEnter,
            'Escape': handlers.onEscape,
            'ArrowUp': handlers.onArrowUp,
            'ArrowDown': handlers.onArrowDown,
        };

        const handler = keyMap[event.key as keyof typeof keyMap];

        if (handler) {
            // 특정 키 조합에 대한 기본 동작 방지 (예: 화살표 키로 인한 스크롤)
            if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
                event.preventDefault();
            }
            handler(event);
        }
    };
};