// src/components/Modal.tsx
import React from 'react';
import { useModal } from '../hooks/useModal';

export const TestModal: React.FC = () => {
    const { isOpen, close, getToggleButtonProps, getModalProps, getBackdropProps } = useModal();

    return (
        <>
            <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                {...getToggleButtonProps()}
            >
                Open Modal
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    {...getBackdropProps()}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
                        // 모달 컨텐츠 내부 클릭 시 닫히는 것을 방지
                        onClick={(e) => e.stopPropagation()}
                        {...getModalProps()}
                    >
                        <h2 className="text-xl font-bold mb-4">Modal Title</h2>
                        <p className="mb-6">This is the modal content. You can close it by clicking the button below, clicking outside, or pressing the 'Escape' key.</p>
                        <div className="text-right">
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                onClick={close}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};