// src/hooks/useDropdown.ts
import { useState, useCallback } from 'react';
import { useToggle } from './useToggle';
import { useOutsideClick } from './useOutsideClick';
import { keyPress } from '../utils/keyPress';

interface UseDropdownOptions<T> {
    items: T[];
    onSelect?: (item: T) => void;
}

/**
 * Dropdown UI 로직을 관리하는 커스텀 훅
 * @param options - 드롭다운 아이템 리스트와 선택 시 콜백
 * @returns 드롭다운 상태와 prop getter 함수들을 반환
 */
export const useDropdown = <T>({ items, onSelect }: UseDropdownOptions<T>) => {
    const [isOpen, toggle, open, close] = useToggle(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const onOutsideClick = useOutsideClick();

    const handleSelect = (item: T) => {
        onSelect?.(item);
        close();
    };

    const getToggleButtonProps = () => ({
        onClick: toggle,
        // 키보드로 버튼 포커스 후 Enter/Space로 열기 위한 핸들러 추가 가능
    });

    const getMenuProps = () => ({
        ref: onOutsideClick(close),
        onKeyDown: keyPress({
            onEscape: close,
            onArrowUp: () => {
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : items.length - 1));
            },
            onArrowDown: () => {
                setSelectedIndex(prev => (prev < items.length - 1 ? prev + 1 : 0));
            },
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