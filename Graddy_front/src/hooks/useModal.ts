// src/hooks/useModal.ts
import { useEffect } from 'react';
import { useToggle } from './useToggle';
import { useOutsideClick } from './useOutsideClick';

/**
 * Modal UI 로직을 관리하는 커스텀 훅
 * @returns 모달 상태와 prop getter 함수들을 반환
 */
export const useModal = () => {
    const [isOpen, , open, close] = useToggle(false);
    const onOutsideClick = useOutsideClick();

    // Escape 키로 모달 닫기
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                close();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, close]);

    const getToggleButtonProps = () => ({
        onClick: open,
    });

    const getModalProps = () => ({
        ref: onOutsideClick(close),
        role: 'dialog',
        'aria-modal': true,
    });

    // 백드롭 클릭 시 닫기 위한 prop getter
    const getBackdropProps = () => ({
        onClick: close,
    });


    return {
        isOpen,
        open,
        close,
        getToggleButtonProps,
        getModalProps,
        getBackdropProps,
    };
};