import { useState, useEffect } from 'react';
import { keyPress } from '../utils/keyPress';

interface UseModalProps {
    onClose?: () => void;
}

export const useModal = ({ onClose }: UseModalProps = {}) => {
    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => setIsOpen(true);

    const closeModal = () => {
        setIsOpen(false);
        onClose?.();
    };

    // ESC 키 핸들러
    const handleKeyDown = keyPress({
        onEscape: closeModal,
    });

    // 모달이 열릴 때 키보드 이벤트 리스너 추가
    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown as any);
            // 모달이 열릴 때 body 스크롤 방지
            document.body.style.overflow = 'hidden';
        } else {
            document.removeEventListener('keydown', handleKeyDown as any);
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown as any);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, handleKeyDown]);

    return {
        isOpen,
        openModal,
        closeModal,
    };
};