import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Minimize2, Move, Settings } from 'lucide-react';

interface Message {
	id: string;
	text: string;
	sender: 'user' | 'bot';
	timestamp: Date;
}

interface ChatSettings {
	position: { x: number; y: number };
	width: number;
	height: number;
	opacity: number;
}

const DraggableChatWidget: React.FC = () => {
	// 초기 설정 불러오기
	const getSavedSettings = (): ChatSettings => {
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
	const [settings, setSettings] = useState<ChatSettings>(getSavedSettings);
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

	// refs
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	const chatRef = useRef<HTMLDivElement>(null);

	// 드래그/리사이즈 관련 상태
	const isDragging = useRef(false);
	const isResizing = useRef(false);
	const dragStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
	const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });

	// Mutation Observer를 사용한 자동 스크롤 최적화
	useEffect(() => {
		const messagesContainer = messagesContainerRef.current;
		if (!messagesContainer) return;

		const observer = new MutationObserver(() => {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		});

		observer.observe(messagesContainer, {
			childList: true,
			subtree: true
		});

		messagesContainer.scrollTop = messagesContainer.scrollHeight;

		return () => {
			observer.disconnect();
		};
	}, []);

	// 시간 포맷팅
	const formatTime = (date: Date) => {
		return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
	};

	// 드래그 시작 (body 영역에서만)
	const handleDragStart = useCallback((e: React.MouseEvent) => {
		// 헤더나 버튼 영역에서는 드래그 방지
		const target = e.target as HTMLElement;
		if (target.closest('button') || target.closest('.header-controls')) {
			return;
		}

		if (!chatRef.current) return;
		
		e.preventDefault();
		const rect = chatRef.current.getBoundingClientRect();
		dragStart.current = {
			x: e.clientX,
			y: e.clientY,
			offsetX: e.clientX - rect.left,
			offsetY: e.clientY - rect.top,
		};
		isDragging.current = true;
	}, []);

	// 리사이즈 시작
	const handleResizeStart = useCallback((e: React.MouseEvent) => {
		if (!chatRef.current) return;
		e.preventDefault();
		e.stopPropagation();
		
		const rect = chatRef.current.getBoundingClientRect();
		resizeStart.current = {
			x: e.clientX,
			y: e.clientY,
			width: rect.width,
			height: rect.height,
		};
		isResizing.current = true;
	}, []);

	// 마우스 이동 처리
	const handleMouseMove = useCallback((e: MouseEvent) => {
		if (!chatRef.current) return;

		if (isDragging.current) {
			const newX = e.clientX - dragStart.current.offsetX;
			const newY = e.clientY - dragStart.current.offsetY;
			
			// 화면 경계 체크
			const maxX = window.innerWidth - settings.width;
			const maxY = window.innerHeight - settings.height;

			const clampedX = Math.max(0, Math.min(newX, maxX));
			const clampedY = Math.max(0, Math.min(newY, maxY));

			chatRef.current.style.left = `${clampedX}px`;
			chatRef.current.style.top = `${clampedY}px`;
		} else if (isResizing.current) {
			const deltaX = e.clientX - resizeStart.current.x;
			const deltaY = e.clientY - resizeStart.current.y;

			const newWidth = Math.max(280, Math.min(600, resizeStart.current.width + deltaX));
			const newHeight = Math.max(300, Math.min(600, resizeStart.current.height + deltaY));

			chatRef.current.style.width = `${newWidth}px`;
			chatRef.current.style.height = `${newHeight}px`;
		}
	}, [settings.width, settings.height]);

	// 마우스 업 처리
	const handleMouseUp = useCallback(() => {
		if (!chatRef.current) return;

		if (isDragging.current || isResizing.current) {
			const rect = chatRef.current.getBoundingClientRect();
			const newSettings = {
				...settings,
				position: { x: rect.left, y: rect.top },
				width: rect.width,
				height: rect.height,
			};
			
			setSettings(newSettings);
			localStorage.setItem('chatWidgetSettings', JSON.stringify(newSettings));
		}

		isDragging.current = false;
		isResizing.current = false;
	}, [settings]);

	// 마우스 이벤트 등록
	useEffect(() => {
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
		
		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, [handleMouseMove, handleMouseUp]);

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
	const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	}, [handleSendMessage]);

	// 투명도 변경
	const handleOpacityChange = useCallback((newOpacity: number) => {
		const newSettings = { ...settings, opacity: newOpacity };
		setSettings(newSettings);
		localStorage.setItem('chatWidgetSettings', JSON.stringify(newSettings));
	}, [settings]);

	// 헤더 클릭 이벤트 처리
	const handleHeaderClick = useCallback((e: React.MouseEvent) => {
		// 버튼 클릭은 드래그로 인식하지 않도록
		const target = e.target as HTMLElement;
		if (target.closest('button')) {
			e.stopPropagation();
		}
	}, []);

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
						left: settings.position.x,
						top: settings.position.y,
						width: settings.width,
						height: settings.height,
						opacity: settings.opacity,
						zIndex: 1000,
						cursor: isDragging.current ? 'grabbing' : 'default',
					}}
				>
					{/* 헤더 */}
					<div 
						className="flex items-center justify-between p-4 bg-[#8B85E9] text-white rounded-t-lg cursor-grab active:cursor-grabbing"
						onMouseDown={handleDragStart}
						onClick={handleHeaderClick}
						style={{ userSelect: 'none' }}
					>
						<div className="flex items-center gap-2">
							<h3 className="font-semibold">채팅 상담</h3>
						</div>
						<div className="flex items-center gap-2 header-controls">
							<button
								onClick={(e) => {
									e.stopPropagation();
									setShowSettings(!showSettings);
								}}
								className="p-1 hover:bg-white/20 rounded transition-colors"
								title="설정"
							>
								<Settings className="w-4 h-4" />
							</button>	
							<button
								onClick={(e) => {
									e.stopPropagation();
									setIsOpen(false);
								}}
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
					<div 
						ref={messagesContainerRef}
						className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
						onMouseDown={handleDragStart}
					>
						{messages.map((message) => (
							<div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
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
						))}
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
					<div
						className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
						onMouseDown={handleResizeStart}
					>
						<div className="w-full h-full flex items-end justify-end">
							<div className="w-3 h-3 border-r-2 border-b-2 border-gray-400 rounded-br"></div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default DraggableChatWidget;
