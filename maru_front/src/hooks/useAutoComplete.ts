// src/hooks/useAutoComplete.ts
import { useState, useMemo, useCallback } from 'react';

// 훅에 전달할 옵션 타입 정의
interface UseAutoCompleteOptions<T> {
    items: T[]; // 전체 검색 대상 아이템 배열
    filterFn: (item: T, inputValue: string) => boolean; // 사용자 정의 필터링 함수
}

export const useAutoComplete = <T>({ items, filterFn }: UseAutoCompleteOptions<T>) => {
    const [inputValue, setInputValue] = useState('');
    const [activeIndex, setActiveIndex] = useState(-1);

    // 입력값이 바뀔 때만 필터링된 리스트를 다시 계산 (성능 최적화)
    const filteredItems = useMemo(() => {
        if (inputValue === '') {
            return [];
        }
        return items.filter(item => filterFn(item, inputValue));
    }, [inputValue, items, filterFn]);

    // 드롭다운 메뉴의 노출 여부는 상태가 아닌, 파생된 값으로 처리
    const isOpen = inputValue.length > 0 && filteredItems.length > 0;

    const reset = useCallback(() => {
        setInputValue('');
        setActiveIndex(-1);
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
                break;
            case 'Enter':
                if (activeIndex >= 0) {
                    setInputValue(String(filteredItems[activeIndex])); // 아이템이 객체일 경우를 대비해 변환
                    setActiveIndex(-1);
                }
                break;
            case 'Escape':
                reset();
                break;
        }
    }, [isOpen, activeIndex, filteredItems, reset]);

    // Prop Getter 패턴: 훅 사용을 간결하게 만들어주는 고급 패턴
    const getInputProps = () => ({
        value: inputValue,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            setInputValue(e.target.value);
            setActiveIndex(-1); // 입력 시 활성 인덱스 초기화
        },
        onKeyDown: handleKeyDown,
    });

    const getItemProps = (index: number) => ({
        key: index,
        onClick: () => {
            setInputValue(String(filteredItems[index]));
            setActiveIndex(-1);
        },
        onMouseOver: () => setActiveIndex(index),
        'data-active': activeIndex === index, // CSS나 스타일 컴포넌트에서 활용
    });

    const getResetButtonProps = () => ({
        onClick: reset,
    });

    return {
        isOpen,
        inputValue,
        filteredItems,
        activeIndex,
        getInputProps,
        getItemProps,
        getResetButtonProps,
    };
};