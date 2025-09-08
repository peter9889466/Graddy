import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Minimize2, Move, Settings, Users } from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../../contexts/AuthContext';
import { TokenService } from '../../services/tokenService.js';

interface Message {
	id: string;
	text: string;
	sender: 'user' | 'bot';
	senderNick?: string;
	timestamp: Date;
	messageType?: 'TEXT' | 'FILE' | 'IMAGE' | 'ENTER' | 'LEAVE';
	fileUrl?: string;
}

interface ChatMessageRequest {
	studyProjectId: number;
	content: string;
	fileUrl?: string;
	messageType: 'TEXT' | 'FILE' | 'IMAGE' | 'ENTER' | 'LEAVE';
}

interface ChatMessageResponse {
	messageId: number;
	memberId: number;
	userId: string;
	senderNick: string;
	content: string;
	fileUrl?: string;
	createdAt: string;
	messageType: 'TEXT' | 'FILE' | 'IMAGE' | 'ENTER' | 'LEAVE';
	studyProjectId: number;
}

interface ChatSettings {
	position: { x: number; y: number };
	width: number;
	height: number;
	opacity: number;
}

interface DraggableChatWidgetProps {
	studyProjectId?: number;
}

const DraggableChatWidget: React.FC<DraggableChatWidgetProps> = ({ studyProjectId }) => {
	const authContext = useAuth();
	const user = authContext?.user;
	const token = authContext?.token;
	
	// 초기 설정 불러오기
	const getSavedSettings = (): ChatSettings => {
		const saved = localStorage.getItem('chatWidgetSettings');
		if (saved) {
			const settings = JSON.parse(saved);
			const maxX = window.innerWidth - (settings.width || 320);
			const maxY = window.innerHeight - (settings.height || 384);
			return {
				position: {
					x: Math.min(settings.position?.x || window.innerWidth - 340, maxX),
					y: Math.min(settings.position?.y || window.innerHeight / 2 - 192, maxY),
				},
				width: settings.width || 320,
				height: settings.height || 384,
				opacity: settings.opacity || 1,
			};
		}
		return {
			position: { x: window.innerWidth - 340, y: window.innerHeight / 2 - 192 },
			width: 320,
			height: 384,
			opacity: 1,
		};
	};

	const [isOpen, setIsOpen] = useState(false);
	const [settings, setSettings] = useState<ChatSettings>(getSavedSettings);
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputText, setInputText] = useState('');
	const [showSettings, setShowSettings] = useState(false);
	const [isConnected, setIsConnected] = useState(false);
	const [connectionError, setConnectionError] = useState<string | null>(null);
	const [subscriptionActive, setSubscriptionActive] = useState(false);
	const [currentStudyProjectId, setCurrentStudyProjectId] = useState<number | null>(studyProjectId || null);

	// refs
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	const chatRef = useRef<HTMLDivElement>(null);
	const stompClientRef = useRef<Client | null>(null);

	// 드래그/리사이즈 관련 상태
	const isDragging = useRef(false);
	const isResizing = useRef(false);
	const dragStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
	const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });

	// WebSocket 연결 함수
	const connectWebSocket = useCallback(async () => {
		if (!currentStudyProjectId) {
			setConnectionError('스터디 정보가 없습니다.');
			return;
		}

		let currentToken = token;
		
		// 토큰이 없거나 유효하지 않으면 갱신 시도
		if (!currentToken || !TokenService.getInstance().isTokenValid(currentToken)) {
			try {
				console.log('토큰 갱신 시도...');
				currentToken = await TokenService.getInstance().refreshAccessToken();
				console.log('토큰 갱신 성공');
			} catch (error) {
				console.error('토큰 갱신 실패:', error);
				setConnectionError('인증 오류가 발생했습니다. 다시 로그인해주세요.');
				return;
			}
		}

		console.log('WebSocket 연결 시도:', {
			token: currentToken ? '토큰 있음' : '토큰 없음',
			studyProjectId: currentStudyProjectId,
			userNick: user?.nick
		});

		try {
			// SockJS를 사용한 WebSocket 연결
			const socket = new SockJS('http://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com/api/ws-stomp');
			const stompClient = new Client({
				webSocketFactory: () => socket,
				debug: (str: string) => {
					console.log('STOMP Debug:', str);
				},
				connectHeaders: {
					'Authorization': `Bearer ${currentToken}`
				},
				onConnect: (frame: any) => {
					console.log('🔗 WebSocket 연결 성공:', {
						command: frame.command,
						headers: frame.headers,
						body: frame.body,
						destination: `/topic/chat/room/${currentStudyProjectId}`
					});
					setIsConnected(true);
					setConnectionError(null);

					// 스터디방 메시지 구독
					console.log('📡 메시지 구독 시작:', `/topic/chat/room/${currentStudyProjectId}`);
					const subscription = stompClient.subscribe(
						`/topic/chat/room/${currentStudyProjectId}`,
						(message: any) => {
							console.log('🎯 구독 콜백 실행됨!');
							try {
								console.log('🔔 메시지 수신됨:', {
									destination: `/topic/chat/room/${currentStudyProjectId}`,
									rawMessage: message.body,
									currentUser: user?.nickname,
									messageHeaders: message.headers,
									timestamp: new Date().toISOString()
								});
								
								const chatMessage: ChatMessageResponse = JSON.parse(message.body);
								
								console.log('📨 파싱된 메시지:', {
									messageId: chatMessage.messageId,
									userId: chatMessage.userId,
									senderNick: chatMessage.senderNick,
									content: chatMessage.content,
									messageType: chatMessage.messageType,
									currentUserId: TokenService.getInstance().getUserIdFromToken(),
									userNickname: user?.nickname,
									isFromMe: chatMessage.userId === TokenService.getInstance().getUserIdFromToken()
								});
								
								// 메시지 추가 로직
								setMessages(prev => {
									console.log('📝 메시지 추가 전 현재 메시지 수:', prev.length);
									
									// 같은 메시지 ID가 이미 있는지 확인 (중복 방지)
									const existingMessage = prev.find(msg => 
										msg.id.includes(chatMessage.messageId?.toString() || '') &&
										msg.text === chatMessage.content &&
										msg.senderNick === chatMessage.senderNick
									);
									
									if (existingMessage) {
										console.log('🔄 중복 메시지 발견, 무시:', {
											messageId: chatMessage.messageId,
											content: chatMessage.content,
											senderNick: chatMessage.senderNick
										});
										return prev;
									}
									
									// 임시 메시지가 있다면 제거 (자신이 보낸 메시지의 경우)
									const filteredMessages = prev.filter(msg => 
										!(msg.id.startsWith('temp-') && 
										  msg.text === chatMessage.content && 
										  msg.sender === 'user')
									);
									
									// 새 메시지 생성 - JWT에서 추출한 userId와 비교
									const currentUserId = TokenService.getInstance().getUserIdFromToken();
									const isFromMe = chatMessage.userId === currentUserId;
									console.log('🔍 메시지 발신자 확인:', {
										chatMessageUserId: chatMessage.userId,
										currentUserId: currentUserId,
										isFromMe: isFromMe
									});
									
									const newMessage: Message = {
										id: `${chatMessage.messageId}-${Date.now()}-${Math.random()}`,
										text: chatMessage.content,
										sender: isFromMe ? 'user' : 'bot',
										senderNick: chatMessage.senderNick,
										timestamp: new Date(chatMessage.createdAt),
										messageType: chatMessage.messageType || 'TEXT',
										fileUrl: chatMessage.fileUrl,
									};
									
									console.log('✅ 새 메시지 추가:', {
										messageId: chatMessage.messageId,
										userId: chatMessage.userId,
										senderNick: chatMessage.senderNick,
										userNick: user?.nickname,
										sender: newMessage.sender,
										content: chatMessage.content,
										isFromMe: chatMessage.userId === user?.nickname,
										messageType: chatMessage.messageType
									});
									
									const updatedMessages = [...filteredMessages, newMessage];
									console.log('📝 메시지 추가 후 총 메시지 수:', updatedMessages.length);
									
									return updatedMessages;
								});
								
								console.log('🎉 메시지 수신 성공:', {
									messageId: chatMessage.messageId,
									userId: chatMessage.userId,
									senderNick: chatMessage.senderNick,
									content: chatMessage.content,
									isFromMe: chatMessage.userId === user?.nickname,
									currentUser: user?.nickname
								});
							} catch (error) {
								console.error('메시지 파싱 오류:', error);
							}
						}
					);

					// 구독 성공 상태 업데이트
					setSubscriptionActive(true);
					console.log('✅ 구독 활성화됨:', `/topic/chat/room/${currentStudyProjectId}`);

					// 연결 정보 저장
					stompClientRef.current = stompClient;
				},
				onStompError: (frame: any) => {
					console.error('❌ STOMP 오류:', {
						command: frame.command,
						headers: frame.headers,
						body: frame.body
					});
					setConnectionError('채팅 서버 연결에 실패했습니다.');
					setIsConnected(false);
					setSubscriptionActive(false);
				},
				onWebSocketError: (error: any) => {
					console.error('❌ WebSocket 오류:', error);
					setConnectionError('채팅 서버 연결에 실패했습니다.');
					setIsConnected(false);
					setSubscriptionActive(false);
				}
			});

			// 연결 시작
			stompClient.activate();
		} catch (error) {
			console.error('WebSocket 연결 오류:', error);
			setConnectionError('채팅 서버 연결에 실패했습니다.');
		}
	}, [token, currentStudyProjectId, user?.nickname]);

	// WebSocket 연결 해제 함수
	const disconnectWebSocket = useCallback(() => {
		if (stompClientRef.current) {
			console.log('🔌 WebSocket 연결 해제 중...');
			stompClientRef.current.deactivate();
			stompClientRef.current = null;
			setIsConnected(false);
			setSubscriptionActive(false);
		}
	}, []);

	// 스터디 프로젝트 ID 변경 시 연결 재설정
	useEffect(() => {
		if (studyProjectId && studyProjectId !== currentStudyProjectId) {
			setCurrentStudyProjectId(studyProjectId);
			disconnectWebSocket();
			setMessages([]);
		}
	}, [studyProjectId, currentStudyProjectId, disconnectWebSocket]);

	// 채팅 이력 불러오기 함수
	const loadChatHistory = useCallback(async () => {
		if (!currentStudyProjectId) {
			return;
		}

		let currentToken = token;
		
		// 토큰이 없거나 유효하지 않으면 갱신 시도
		if (!currentToken || !TokenService.getInstance().isTokenValid(currentToken)) {
			try {
				console.log('채팅 이력 불러오기 전 토큰 갱신 시도...');
				currentToken = await TokenService.getInstance().refreshAccessToken();
				console.log('채팅 이력용 토큰 갱신 성공');
			} catch (error) {
				console.error('채팅 이력용 토큰 갱신 실패:', error);
				return;
			}
		}

		try {
			console.log('채팅 이력 불러오기 시작:', currentStudyProjectId);
			
			const response = await fetch(`http://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com/api/chat/history/${currentStudyProjectId}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${currentToken}`,
					'Content-Type': 'application/json'
				}
			});

			if (response.ok) {
				const chatHistory: ChatMessageResponse[] = await response.json();
				console.log('채팅 이력 불러오기 성공:', chatHistory.length, '개 메시지');
				
				// 채팅 이력을 Message 형태로 변환하고 역순으로 정렬 (오래된 것부터 최신 순으로)
				const historyMessages: Message[] = chatHistory
					.reverse() // 배열을 역순으로 뒤집기
					.map(chatMessage => {
						const isFromMe = chatMessage.userId === user?.nickname;
						return {
							id: `${chatMessage.messageId}-${Date.now()}-${Math.random()}`,
							text: chatMessage.content,
							sender: isFromMe ? 'user' : 'bot',
							senderNick: chatMessage.senderNick,
							timestamp: new Date(chatMessage.createdAt),
							messageType: chatMessage.messageType || 'TEXT',
							fileUrl: chatMessage.fileUrl,
						};
					});
				
				setMessages(historyMessages);
			} else {
				console.error('채팅 이력 불러오기 실패:', response.status);
			}
		} catch (error) {
			console.error('채팅 이력 불러오기 오류:', error);
		}
	}, [currentStudyProjectId, token, user?.nickname]);

	// 채팅창이 열릴 때 WebSocket 연결 및 이력 불러오기
	useEffect(() => {
		if (isOpen && currentStudyProjectId && token) {
			// 먼저 채팅 이력 불러오기
			loadChatHistory().then(() => {
				// 이력 불러오기 완료 후 WebSocket 연결
				connectWebSocket();
			});
		} else if (!isOpen) {
			disconnectWebSocket();
		}

		return () => {
			disconnectWebSocket();
		};
	}, [isOpen, currentStudyProjectId, token, connectWebSocket, disconnectWebSocket, loadChatHistory]);

	// 자동 스크롤 함수
	const scrollToBottom = useCallback(() => {
		const messagesContainer = messagesContainerRef.current;
		if (messagesContainer) {
			// 부드러운 스크롤
			messagesContainer.scrollTo({
				top: messagesContainer.scrollHeight,
				behavior: 'smooth'
			});
		}
	}, []);

	// 메시지가 추가될 때마다 자동 스크롤
	useEffect(() => {
		scrollToBottom();
	}, [messages, scrollToBottom]);

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

	// 드래그 시작
	const handleDragStart = useCallback((e: React.MouseEvent) => {
		if (e.target instanceof HTMLElement && e.target.closest('.header-controls')) {
			return;
		}
		isDragging.current = true;
		dragStart.current = {
			x: e.clientX,
			y: e.clientY,
			offsetX: e.clientX - settings.position.x,
			offsetY: e.clientY - settings.position.y,
		};
		e.preventDefault();
	}, [settings.position]);

	// 리사이즈 시작
	const handleResizeStart = useCallback((e: React.MouseEvent) => {
		isResizing.current = true;
		resizeStart.current = {
			x: e.clientX,
			y: e.clientY,
			width: settings.width,
			height: settings.height,
		};
		e.preventDefault();
		e.stopPropagation();
	}, [settings.width, settings.height]);

	// 마우스 이동 처리
	const handleMouseMove = useCallback((e: MouseEvent) => {
		if (isDragging.current) {
			const newX = e.clientX - dragStart.current.offsetX;
			const newY = e.clientY - dragStart.current.offsetY;
			const maxX = window.innerWidth - settings.width;
			const maxY = window.innerHeight - settings.height;
			
			const constrainedX = Math.max(0, Math.min(newX, maxX));
			const constrainedY = Math.max(0, Math.min(newY, maxY));
			
			setSettings(prev => ({
				...prev,
				position: { x: constrainedX, y: constrainedY }
			}));
		} else if (isResizing.current) {
			const deltaX = e.clientX - resizeStart.current.x;
			const deltaY = e.clientY - resizeStart.current.y;
			const newWidth = Math.max(280, Math.min(600, resizeStart.current.width + deltaX));
			const newHeight = Math.max(200, Math.min(800, resizeStart.current.height + deltaY));
			
			setSettings(prev => ({
				...prev,
				width: newWidth,
				height: newHeight
			}));
		}
	}, [settings.width, settings.height]);

	// 마우스 업 처리
	const handleMouseUp = useCallback(() => {
		isDragging.current = false;
		isResizing.current = false;
	}, []);

	// 마우스 이벤트 리스너 등록
	useEffect(() => {
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, [handleMouseMove, handleMouseUp]);

	// 메시지 전송
	const handleSendMessage = useCallback(async () => {
		if (!inputText.trim() || !stompClientRef.current || !isConnected || !currentStudyProjectId) {
			return;
		}

		let currentToken = token;
		
		// 토큰이 없거나 유효하지 않으면 갱신 시도
		if (!currentToken || !TokenService.getInstance().isTokenValid(currentToken)) {
			try {
				console.log('메시지 전송 전 토큰 갱신 시도...');
				currentToken = await TokenService.getInstance().refreshAccessToken();
				console.log('메시지 전송용 토큰 갱신 성공');
			} catch (error) {
				console.error('메시지 전송용 토큰 갱신 실패:', error);
				setConnectionError('인증 오류가 발생했습니다. 다시 로그인해주세요.');
				return;
			}
		}

		const messageRequest: ChatMessageRequest = {
			studyProjectId: currentStudyProjectId,
			content: inputText.trim(),
			messageType: 'TEXT'
		};

		// 먼저 로컬에 메시지 표시 (즉시 피드백)
		const tempMessage: Message = {
			id: `temp-${Date.now()}-${Math.random()}`,
			text: inputText.trim(),
			sender: 'user',
			senderNick: user?.nickname || '나',
			timestamp: new Date(),
			messageType: 'TEXT'
		};
		console.log('💬 임시 메시지 추가:', tempMessage);
		setMessages(prev => [...prev, tempMessage]);
		
		// 메시지 전송 후 자동 스크롤
		setTimeout(() => {
			scrollToBottom();
		}, 100);
		
		// 입력 필드 초기화
		const messageToSend = inputText.trim();
		setInputText('');

		try {
			console.log('📤 메시지 전송 시도:', {
				destination: `/app/chat.sendMessage/${currentStudyProjectId}`,
				messageRequest,
				token: currentToken ? '토큰 있음' : '토큰 없음'
			});
			
			// STOMP를 통해 메시지 전송
			stompClientRef.current.publish({
				destination: `/app/chat.sendMessage/${currentStudyProjectId}`,
				body: JSON.stringify(messageRequest),
				headers: {
					'Authorization': `Bearer ${currentToken}`
				}
			});

			console.log('✅ 메시지 전송 성공:', messageRequest);
		} catch (error) {
			console.error('메시지 전송 오류:', error);
			setConnectionError('메시지 전송에 실패했습니다.');
			
			// 전송 실패 시 임시 메시지 제거
			setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
		}
	}, [inputText, isConnected, currentStudyProjectId, token, user?.nick, scrollToBottom]);

	// Enter 키로 메시지 전송
	const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	}, [handleSendMessage]);

	// 설정 저장
	const saveSettings = useCallback(() => {
		localStorage.setItem('chatWidgetSettings', JSON.stringify(settings));
	}, [settings]);

	// 설정 변경 시 저장
	useEffect(() => {
		saveSettings();
	}, [settings, saveSettings]);

	// 투명도 조절
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

	// 스터디 정보가 없으면 안내 메시지와 함께 채팅 위젯 표시
	if (!currentStudyProjectId) {
		return null;
	}

	return (
		<div className="fixed z-50">
			{!isOpen ? (
				// 채팅 버튼
				<button
					onClick={() => setIsOpen(true)}
					className="fixed bottom-6 right-6 w-14 h-14 bg-[#8B85E9] hover:bg-[#7A75D8] text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center"
					style={{ zIndex: 1000 }}
					title={`스터디 #${currentStudyProjectId} 채팅`}
				>
					<MessageCircle className="w-6 h-6" />
				</button>
			) : (
				// 채팅창
				<div
					ref={chatRef}
					className="bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col"
					style={{
						position: 'fixed',
						left: settings.position.x,
						top: settings.position.y,
						width: settings.width,
						height: settings.height,
						opacity: settings.opacity,
						zIndex: 1000,
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
							<Users className="w-4 h-4" />
							<div>
								<h3 className="font-semibold">
									{currentStudyProjectId ? '스터디 채팅' : '채팅 상담'}
								</h3>
								<div className="flex items-center gap-2 text-xs">
									<div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
									<span>{isConnected ? '연결됨' : '연결 안됨'}</span>
								</div>
							</div>
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

					{/* 연결 오류 메시지 */}
					{connectionError && (
						<div className="flex justify-center">
							<div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm">
								{connectionError}
							</div>
						</div>
					)}

					{/* 메시지 목록 */}
					<div 
						ref={messagesContainerRef}
						className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
						onMouseDown={handleDragStart}
					>
						{messages.map((message, index) => (
							<div key={`${message.id}-${message.timestamp.getTime()}-${index}`} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
								<div
									className={`max-w-[80%] p-3 rounded-lg ${
										message.sender === 'user'
											? 'bg-[#8B85E9] text-white rounded-br-none'
											: 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
									}`}
								>
									{message.senderNick && message.sender !== 'user' && (
										<p className="text-xs font-semibold mb-1 text-gray-600">
											{message.senderNick}
										</p>
									)}
									<p className="text-sm select-text">{message.text}</p>
									{message.fileUrl && (
										<div className="mt-2">
											<a 
												href={message.fileUrl} 
												target="_blank" 
												rel="noopener noreferrer"
												className="text-blue-500 underline text-xs"
											>
												첨부파일 보기
											</a>
										</div>
									)}
									<p
										className={`text-xs mt-1 ${
											message.sender === 'user' 
												? 'text-white/70' 
												: 'text-gray-500'
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
								placeholder={
									!currentStudyProjectId 
										? "스터디 페이지에서 채팅을 이용하세요"
										: !isConnected 
										? "연결 중..."
										: "메시지를 입력하세요..."
								}
								disabled={!currentStudyProjectId || !isConnected}
								className={`flex-1 p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9] select-text ${
									!currentStudyProjectId || !isConnected
										? 'border-gray-200 bg-gray-100 text-gray-500'
										: 'border-gray-300'
								}`}
								rows={1}
								style={{ minHeight: '40px', maxHeight: '100px' }}
							/>
							<button
								onClick={handleSendMessage}
								disabled={!inputText.trim() || !currentStudyProjectId || !isConnected}
								className="p-2 bg-[#8B85E9] hover:bg-[#7A75D8] disabled:bg-gray-300 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
							>
								<Send className="w-4 h-4" />
							</button>
						</div>
					</div>

					{/* 리사이즈 핸들 */}
					<div
						className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-gray-300 hover:bg-gray-400"
						onMouseDown={handleResizeStart}
						style={{
							clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)',
						}}
					/>
				</div>
			)}
		</div>
	);
};

export default DraggableChatWidget;