// src/hooks/useDropdown.ts
import { useState, useCallback } from 'react';
import { useToggle } from './useToggle';
import { useOutsideClick } from './useOutsideClick';
import { useThrottle } from '../utils/eventLimiter';
import { keyPress } from '../utils/keyPress';

interface UseDropdownOptions<T> {
    items: T[];
    onSelect?: (item: T) => void;
    throttleDelay?: number; // 스로틀링 지연 시간 (기본값: 100ms)
}

/**
 * Dropdown UI 로직을 관리하는 커스텀 훅
 * @param options - 드롭다운 아이템 리스트와 선택 시 콜백
 * @returns 드롭다운 상태와 prop getter 함수들을 반환
 */
export const useDropdown = <T>({ items, onSelect, throttleDelay = 100 }: UseDropdownOptions<T>) => {
    const [isOpen, toggle, open, close] = useToggle(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const onOutsideClick = useOutsideClick();

    const handleSelect = useCallback((item: T) => {
        onSelect?.(item);
        close();
    }, [onSelect, close]);

    // 키보드 네비게이션을 위한 스로틀된 함수들
    const throttledMoveUp = useThrottle(() => {
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : items.length - 1));
    }, throttleDelay);

    const throttledMoveDown = useThrottle(() => {
        setSelectedIndex(prev => (prev < items.length - 1 ? prev + 1 : 0));
    }, throttleDelay);

    const getToggleButtonProps = () => ({
        onClick: toggle,
        // 키보드로 버튼 포커스 후 Enter/Space로 열기 위한 핸들러 추가 가능
    });

    const getMenuProps = () => ({
        ref: onOutsideClick(close),
        onKeyDown: keyPress({
            onEscape: close,
            onArrowUp: throttledMoveUp,
            onArrowDown: throttledMoveDown,
            onEnter: () => {
                if (selectedIndex >= 0 && items[selectedIndex]) {
                    handleSelect(items[selectedIndex]);
                }
            },
        }),
        tabIndex: -1, // 키보드 이벤트를 받기 위함
    });

    const getItemProps = (index: number) => ({
        onClick: () => handleSelect(items[index]),
        onMouseOver: () => setSelectedIndex(index),
        'aria-selected': selectedIndex === index,
    });

    return {
        isOpen,
        selectedIndex,
        getToggleButtonProps,
        getMenuProps,
        getItemProps,
    };
};