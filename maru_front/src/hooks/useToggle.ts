import { useState, useCallback } from 'react';

/**
 * boolean 상태를 관리하는 커스텀 훅
 * @param initialState - 초기 상태값 (기본값: false)
 * @returns [상태, 토글 함수, 열기 함수, 닫기 함수]
 */
export const useToggle = (initialState: boolean = false): [boolean, () => void, () => void, () => void] => {
    const [state, setState] = useState<boolean>(initialState);

    const toggle = useCallback(() => setState(prevState => !prevState), []);
    const open = useCallback(() => setState(true), []);
    const close = useCallback(() => setState(false), []);

    return [state, toggle, open, close];
};