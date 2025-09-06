import React, { useEffect, useRef } from "react";
import { X, ExternalLink, Copy, Check } from "lucide-react";
import { useModal } from "../../hooks/useModal";
import { keyPress } from "../../utils/keyPress";
import { useDebounce, useThrottle } from "../../utils/eventLimiter";

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    memberData: {
        nickname: string;
        githubUrl: string;
        score: number;
        interests: Array<{
            id: number;
            name: string;
            category: string;
            difficulty: string;
        }>;
        introduction: string;
        profileImage?: string;
    };
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, memberData }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [copiedUrl, setCopiedUrl] = React.useState(false);
    const [isHovered, setIsHovered] = React.useState(false);

    // useModal 훅 사용
    const { closeModal } = useModal({ onClose });

    // GitHub URL 복사 함수 (디바운스 적용)
    const handleCopyUrl = useDebounce(async () => {
        try {
            await navigator.clipboard.writeText(memberData.githubUrl);
            setCopiedUrl(true);
            setTimeout(() => setCopiedUrl(false), 2000);
        } catch (err) {
            console.error('URL 복사 실패:', err);
        }
    }, 300);

    // GitHub 링크 열기 함수 (쓰로틀 적용)
    const handleOpenGitHub = useThrottle(() => {
        window.open(`${memberData.githubUrl}`, '_blank', 'noopener,noreferrer');
    }, 1000);

    // 모달 외부 클릭 시 닫기
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    // 키보드 이벤트 핸들러
    const handleKeyDown = keyPress({
        onEscape: closeModal,
        onEnter: () => {
            // Enter 키로 GitHub 링크 열기
            handleOpenGitHub();
        }
    });

    // 모달이 열릴 때 포커스 관리
    useEffect(() => {
        if (isOpen && modalRef.current) {
            const firstFocusableElement = modalRef.current.querySelector(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            ) as HTMLElement;
            firstFocusableElement?.focus();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-tranparent"
            onClick={handleBackdropClick}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
        >
            {/* 모달 컨테이너 */}
            <div
                ref={modalRef}
                className="relative bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200"
                style={{
                    backdropFilter: 'blur(10px)',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)'
                }}
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
                    <h2 className="text-xl font-bold text-gray-800">스터디원 프로필</h2>
                    <button
                        onClick={closeModal}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
                        aria-label="모달 닫기"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* 프로필 내용 */}
                <div className="p-6 space-y-6">
                    {/* 프로필 섹션 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 왼쪽 카드 - 사용자 정보 */}
                        <div className="bg-purple-50 rounded-xl p-4 space-y-4 border border-gray-100">
                            {/* 아바타 */}
                            <div className="flex justify-center">
                                <div className="w-20 h-20 rounded-full bg-purple-400 flex items-center justify-center shadow-lg">
                                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-inner">
                                        <div className="w-8 h-8 bg-purple-500 rounded-md"></div>
                                    </div>
                                </div>
                            </div>

                            {/* 닉네임 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    닉네임
                                </label>
                                <div className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 shadow-sm">
                                    {memberData.nickname}
                                </div>
                            </div>

                            {/* GitHub */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    GitHub
                                </label>
                                <div className="flex items-center gap-2">
                                    <svg
                                        className="w-5 h-5 text-gray-700"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                    <div
                                        className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 flex-1 shadow-sm overflow-hidden whitespace-nowrap text-ellipsis"
                                        style={{ maxWidth: "300px" }} // 원하는 고정 너비
                                    >
                                        {memberData.githubUrl}
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={handleOpenGitHub}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            title="GitHub 열기"
                                        >
                                            <ExternalLink className="w-4 h-4 text-gray-600" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 오른쪽 카드 - 점수와 관심분야 */}
                        <div className="bg-purple-50 rounded-xl p-4 space-y-6 border border-gray-100">
                            {/* 내 점수 */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-gray-700">내 점수</h3>
                                    <span
                                        className="text-lg font-bold bg-purple-300 bg-clip-text text-transparent"
                                    >
                                        {memberData.score.toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">활동 기반 평가 점수</p>
                            </div>

                            {/* 관심분야 */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-3">관심분야</h3>
                                <div className="flex flex-wrap gap-2">
                                    {memberData.interests.map((interest) => (
                                        <span
                                            key={interest.id}
                                            className="px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm transition-all duration-200 hover:scale-105"
                                            style={{
                                                backgroundColor:
                                                    interest.category === 'framework' ? '#3B82F6' :
                                                        interest.category === 'language' ? '#10B981' :
                                                            interest.category === 'database' ? '#F59E0B' :
                                                                interest.category === 'cs' ? '#8B5CF6' :
                                                                    '#8B5CF6'
                                            }}
                                        >
                                            {interest.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 내 소개 섹션 */}
                    <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl p-4 border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">내 소개</h3>
                        <div
                            className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            <p className="text-gray-800 leading-relaxed transition-all duration-200">
                                {memberData.introduction}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
