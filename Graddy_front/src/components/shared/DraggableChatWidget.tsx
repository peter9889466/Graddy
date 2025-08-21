import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { MessageCircle, X, Send, Minimize2, Move, Settings } from 'lucide-react';

interface Message {
	id: string;
	text: string;
	sender: 'user' | 'bot';
	timestamp: Date;
}

// 메시지 컴포넌트 (memo로 불필요한 리렌더링 방지)
const MessageItem = memo<{ message: Message; formatTime: (date: Date) => string }>(
	({ message, formatTime }) => (
		<div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
			<div
				className={`max-w-[80%] p-3 rounded-lg ${message.sender === 'user'
						? 'bg-[#8B85E9] text-white rounded-br-none'
						: 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
					}`}
			>
				<p className="text-sm select-text">{message.text}</p>
				<p
					className={`text-xs mt-1 ${message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
						}`}
				>
					{formatTime(message.timestamp)}
				</p>
			</div>
		</div>
	)
);

const DraggableChatWidget: React.FC = () => {
	// 초기 설정 불러오기
	const getSavedSettings = () => {
		const saved = localStorage.getItem('chatWidgetSettings');
		if (saved) {
			const settings = JSON.parse(saved);
			const maxX = window.innerWidth - (settings.width || 320);
			const maxY = window.innerHeight - (settings.height || 384);
			return {
				position: {
					x: Math.min(settings.position?.x || window.innerWidth - 80, maxX),
					y: Math.min(settings.position?.y || window.innerHeight - 80, maxY),
				},
				width: settings.width || 320,
				height: settings.height || 384,
				opacity: settings.opacity || 1,
			};
		}
		return {
			position: { x: window.innerWidth - 80, y: window.innerHeight - 80 },
			width: 320,
			height: 384,
			opacity: 1,
		};
	};

	const [isOpen, setIsOpen] = useState(false);
	const [settings, setSettings] = useState(getSavedSettings);
	const [messages, setMessages] = useState<Message[]>([
		{
			id: '1',
			text: '안녕하세요! 무엇을 도와드릴까요?',
			sender: 'bot',
			timestamp: new Date(),
		},
	]);
	const [inputText, setInputText] = useState('');
	const [showSettings, setShowSettings] = useState(false);

	// --- 여기서부터 최적화 핵심 ---
	const chatRef = useRef<HTMLDivElement>(null);

	// 드래그/리사이즈 관련 값들은 상태 대신 ref에 저장
	const isDragging = useRef(false);
	const isResizing = useRef(false);
	const dragOffset = useRef({ x: 0, y: 0 });
	const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });

	// 애니메이션 프레임 제어용 ref
	const animationFrame = useRef<number | null>(null);

	// 메시지 자동 스크롤
	const messagesEndRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	// 시간 포맷팅
	const formatTime = useCallback((date: Date) => {
		return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
	}, []);

	// 드래그 시작
	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			if (!chatRef.current) return;
			e.preventDefault();
			const rect = chatRef.current.getBoundingClientRect();
			dragOffset.current = {
				x: e.clientX - rect.left,
				y: e.clientY - rect.top,
			};
			isDragging.current = true;
		},
		[]
	);

	// 리사이즈 시작
	const handleResizeStart = useCallback((e: React.MouseEvent) => {
		if (!chatRef.current) return;
		e.preventDefault();
		const rect = chatRef.current.getBoundingClientRect();
		resizeStart.current = {
			x: e.clientX,
			y: e.clientY,
			width: rect.width,
			height: rect.height,
		};
		isResizing.current = true;
	}, []);

	// 드래그/리사이즈 동작 (렌더링 최소화 위해 style 직접 업데이트)
	const handleMouseMove = useCallback((e: MouseEvent) => {
		if (!chatRef.current) return;
		if (!isDragging.current && !isResizing.current) return;

		// 이전 애니메이션 프레임 취소
		if (animationFrame.current) {
			cancelAnimationFrame(animationFrame.current);
		}

		// 새로운 애니메이션 프레임 요청
		animationFrame.current = requestAnimationFrame(() => {
			const element = chatRef.current!;
			
			if (isDragging.current) {
				const newX = e.clientX - dragOffset.current.x;
				const newY = e.clientY - dragOffset.current.y;
				
				// 화면 경계 체크 (현재 요소의 실제 크기 사용)
				const rect = element.getBoundingClientRect();
				const maxX = window.innerWidth - rect.width;
				const maxY = window.innerHeight - rect.height;

				element.style.left = `${Math.max(0, Math.min(newX, maxX))}px`;
				element.style.top = `${Math.max(0, Math.min(newY, maxY))}px`;
			} else if (isResizing.current) {
				const deltaX = e.clientX - resizeStart.current.x;
				const deltaY = e.clientY - resizeStart.current.y;

				const newWidth = Math.max(280, Math.min(600, resizeStart.current.width + deltaX));
				const newHeight = Math.max(300, Math.min(600, resizeStart.current.height + deltaY));

				element.style.width = `${newWidth}px`;
				element.style.height = `${newHeight}px`;
			}
		});
	}, []);

	// 드래그/리사이즈 종료 → 여기서만 상태 업데이트
	const handleMouseUp = useCallback(() => {
		if (!chatRef.current) return;
		if (!isDragging.current && !isResizing.current) return;

		// 애니메이션 프레임 정리
		if (animationFrame.current) {
			cancelAnimationFrame(animationFrame.current);
			animationFrame.current = null;
		}

		const rect = chatRef.current.getBoundingClientRect();
		const finalSettings = {
			...settings,
			position: { x: rect.left, y: rect.top },
			width: rect.width,
			height: rect.height,
		};
		
		// 최종 설정을 상태에 반영하고 localStorage에 저장
		setSettings(finalSettings);
		localStorage.setItem('chatWidgetSettings', JSON.stringify(finalSettings));

		// 드래그/리사이즈 상태 초기화
		isDragging.current = false;
		isResizing.current = false;
	}, [settings]);

	// 마우스 이벤트 등록 (컴포넌트 마운트 시 한 번만 등록)
	useEffect(() => {
		const handleMouseMoveEvent = (e: MouseEvent) => handleMouseMove(e);
		const handleMouseUpEvent = () => handleMouseUp();

		document.addEventListener('mousemove', handleMouseMoveEvent);
		document.addEventListener('mouseup', handleMouseUpEvent);
		
		return () => {
			document.removeEventListener('mousemove', handleMouseMoveEvent);
			document.removeEventListener('mouseup', handleMouseUpEvent);
			
			// 컴포넌트 언마운트 시 애니메이션 프레임 정리
			if (animationFrame.current) {
				cancelAnimationFrame(animationFrame.current);
			}
		};
	}, []); // 의존성 배열을 비워서 한 번만 등록

	// 메시지 전송
	const handleSendMessage = useCallback(() => {
		if (!inputText.trim()) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			text: inputText,
			sender: 'user',
			timestamp: new Date(),
		};
		setMessages((prev) => [...prev, userMessage]);
		setInputText('');

		// 봇 응답 시뮬레이션
		setTimeout(() => {
			const botMessage: Message = {
				id: (Date.now() + 1).toString(),
				text: '메시지를 받았습니다. 곧 답변드리겠습니다!',
				sender: 'bot',
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, botMessage]);
		}, 1000);
	}, [inputText]);

	// Enter 키로 메시지 전송
	const handleKeyPress = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				handleSendMessage();
			}
		},
		[handleSendMessage]
	);

	// 투명도 변경
	const handleOpacityChange = useCallback(
		(newOpacity: number) => {
			const newSettings = { ...settings, opacity: newOpacity };
			setSettings(newSettings);
			localStorage.setItem('chatWidgetSettings', JSON.stringify(newSettings));
		},
		[settings]
	);

	return (
		<div className="fixed z-50">
			{!isOpen ? (
				// 채팅 버튼
				<button
					onClick={() => setIsOpen(true)}
					className="fixed bottom-6 right-6 w-14 h-14 bg-[#8B85E9] hover:bg-[#7A75D8] text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center"
					style={{ zIndex: 1000 }}
				>
					<MessageCircle className="w-6 h-6" />
				</button>
			) : (
				// 채팅창
				<div
					ref={chatRef}
					className="fixed bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col select-none"
					style={{
						left: window.innerWidth <= 768 ? 0 : settings.position.x,
						top: window.innerWidth <= 768 ? 0 : settings.position.y,
						width: window.innerWidth <= 768 ? '100%' : settings.width,
						height: window.innerWidth <= 768 ? '100%' : settings.height,
						opacity: settings.opacity,
						zIndex: 1000,
						// 드래그/리사이즈 중에는 transition 비활성화
						transition: (isDragging.current || isResizing.current) ? 'none' : 'all 0.2s ease',
					}}
				>
					{/* 헤더 */}
					<div
						className="flex items-center justify-between p-4 bg-[#8B85E9] text-white rounded-t-lg cursor-grab active:cursor-grabbing"
						onMouseDown={window.innerWidth > 768 ? handleMouseDown : undefined}
						style={{ userSelect: 'none' }}
					>
						<div className="flex items-center gap-2">
							<Move className="w-4 h-4" />
							<h3 className="font-semibold">채팅 상담</h3>
						</div>
						<div className="flex items-center gap-2">
							<button
								onClick={() => setShowSettings(!showSettings)}
								className="p-1 hover:bg-white/20 rounded transition-colors"
								title="설정"
							>
								<Settings className="w-4 h-4" />
							</button>
							<button
								onClick={() => setIsOpen(false)}
								className="p-1 hover:bg-white/20 rounded transition-colors"
								title="최소화"
							>
								<Minimize2 className="w-4 h-4" />
							</button>
							<button
								onClick={() => setIsOpen(false)}
								className="p-1 hover:bg-white/20 rounded transition-colors"
								title="닫기"
							>
								<X className="w-4 h-4" />
							</button>
						</div>
					</div>

					{/* 설정 패널 */}
					{showSettings && (
						<div className="p-4 bg-gray-50 border-b border-gray-200">
							<div className="space-y-3">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										투명도: {Math.round(settings.opacity * 100)}%
									</label>
									<input
										type="range"
										min="0.3"
										max="1"
										step="0.1"
										value={settings.opacity}
										onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
										className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
									/>
								</div>
							</div>
						</div>
					)}

					{/* 메시지 영역 */}
					<div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
						{messages.map((message) => (
							<MessageItem key={message.id} message={message} formatTime={formatTime} />
						))}
						<div ref={messagesEndRef} />
					</div>

					{/* 입력 영역 */}
					<div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
						<div className="flex items-center gap-2">
							<textarea
								value={inputText}
								onChange={(e) => setInputText(e.target.value)}
								onKeyPress={handleKeyPress}
								placeholder="메시지를 입력하세요..."
								className="flex-1 p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9] select-text"
								rows={1}
								style={{ minHeight: '40px', maxHeight: '100px' }}
							/>
							<button
								onClick={handleSendMessage}
								disabled={!inputText.trim()}
								className="p-2 bg-[#8B85E9] hover:bg-[#7A75D8] disabled:bg-gray-300 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
							>
								<Send className="w-4 h-4" />
							</button>
						</div>
					</div>

					{/* 리사이즈 핸들 */}
					{window.innerWidth > 768 && (
						<div
							className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
							onMouseDown={handleResizeStart}
						>
							<div className="w-full h-full flex items-end justify-end">
								<div className="w-3 h-3 border-r-2 border-b-2 border-gray-400 rounded-br"></div>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default DraggableChatWidget;
