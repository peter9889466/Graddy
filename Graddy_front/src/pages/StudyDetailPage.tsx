import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ResponsiveContainer from "../components/layout/ResponsiveContainer";
import ResponsiveSidebar from "../components/layout/ResponsiveSidebar";
import ResponsiveMainContent from "../components/layout/ResponsiveMainContent";
import StudyDetailSideBar from "../components/detail/StudyDetailSideBar";
// import StudyChatting from "../components/detail/StudyChatting";
import Assignment from "../components/detail/Assignment";
import { studyList } from "../data/studyData";
import { AuthContext } from "../contexts/AuthContext";
import PageLayout from "../components/layout/PageLayout";
import { StudyApiService } from "../services/studyApi";
import FeedBack from "@/components/detail/FeedBack";
import Schedule from "@/components/detail/Schedule";
import Curriculum from "@/components/detail/Curriculum";
import Community from "@/components/detail/Community";
import DraggableChatWidget from "@/components/shared/DraggableChatWidget";
import { Tag, Info, Crown, Calendar } from "lucide-react";

const StudyDetailPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("스터디 정보");
	const [isApplied, setIsApplied] = useState(false);
	const [isRecruiting, setIsRecruiting] = useState(true); // 모집 상태 관리
	const authContext = useContext(AuthContext);
	const location = useLocation();
	const state = location.state as {
		name:string;
		title:string; 
		description:string
		leader:string;
		period: string;
		tags: string[];
		type?: 'study' | 'project';
		studyLevel?: number;
	} | null;
	
	const [studyName, setStudyName] = useState<string>(
		state?.name || `스터디#${id}`
	);
	const [studyTitle, setStudyTitle] = useState<string>(
		state?.title || `스터디#${id} 소개가 없습니다.`
	);
	const [studyDescription, setStudyDescription] = useState<String>(
		state?.description || `스터디#${id}의 설명이 없습니다.`
	);
	const [studyLeader, setStudyLeader] = useState<string>(
		state?.leader || "스터디장이 지정되지 않았습니다."
	);
	const [studyPeriod, setStudyPeriod] = useState<string>(
		state?.period || ""
	);
	const [studyLevel, setStudyLevel] = useState<number>(
		state?.studyLevel || 1
	);
	
	// 스터디 설정
	useEffect(() => {
		setActiveTab("스터디 정보");
	}, []);

	// 기간 포맷팅 함수
	const formatPeriod = (period: string): string => {
		if (!period) return "기간 정보가 없습니다.";
		
		// "25.08.15~25.09.15" 형식을 "2025.08.15~2025.09.15" 형식으로 변환
		const parts = period.split('~');
		if (parts.length === 2) {
			const startDate = parts[0].trim();
			const endDate = parts[1].trim();
			
			// "25.08.15" -> "2025.08.15" 변환
			const formatDate = (dateStr: string) => {
				const dateParts = dateStr.split('.');
				if (dateParts.length === 3) {
					const year = dateParts[0].length === 2 ? `20${dateParts[0]}` : dateParts[0];
					const month = dateParts[1].padStart(2, '0');
					const day = dateParts[2].padStart(2, '0');
					return `${year}.${month}.${day}`;
				}
				return dateStr;
			};
			
			return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
		}
		
		return period;
	};
	const [studyTags, setStudyTags] = useState<any[]>(
		state?.tags || []
	);

	const menuItems = ["스터디 정보", "참여자", "활동 기록"]

	useEffect(() => {
		if (!state?.title) {
			setStudyTitle(`스터디#${id}`);
		}
		if (!state?.description) {
			setStudyDescription(`스터디#${id}의 설명이 없습니다.`);
		}
		if (!state?.leader) {
			setStudyLeader("스터디장이 지정되지 않았습니다.")
		}

		if (!state?.period) {
			const numericId = id ? parseInt(id, 10) : NaN;
			const found = studyList.find((s) => s.id === numericId);
			setStudyPeriod(found?.period ?? "기간 정보가 없습니다.");
		} else {
			setStudyPeriod(state.period);
		}

		if (!state?.tags || state.tags.length === 0) {
			const numericId = id ? parseInt(id, 10) : NaN;
			const found = studyList.find((s) => s.id === numericId);
			setStudyTags(found?.tags ?? []);
		} else {
			setStudyTags(state.tags);
		}
	}, [id, state]);

	// 백엔드에서 받아온 멤버 정보를 기반으로 사용자 권한 확인
	const [userMemberType, setUserMemberType] = useState<string | null>(null);
	const [isStudyMember, setIsStudyMember] = useState(false);
	const [members, setMembers] = useState<Array<{
		memberId: number;
		userId: string;
		nick: string;
		memberType: string;
		memberStatus: string;
		joinedAt: string;
	}>>([]);
	const [maxMembers, setMaxMembers] = useState<number>(10);
	const [isLoading, setIsLoading] = useState(true);
	
	// 사용자 권한 확인
	const isLoggedIn = authContext?.isLoggedIn || false;
	
	// 백엔드에서 스터디 정보와 멤버 정보를 받아와서 설정
	useEffect(() => {
		const fetchStudyInfo = async () => {
			if (!id) return;
			
			setIsLoading(true);
			
			try {
				const studyProjectId = parseInt(id, 10);
				const studyData = await StudyApiService.getStudyProject(studyProjectId);
				
				if (studyData) {
					// 스터디 기본 정보 설정
					setStudyName(studyData.studyProjectName || `스터디#${id}`);
					setStudyTitle(studyData.studyProjectTitle || `스터디#${id} 소개가 없습니다.`);
					setStudyDescription(studyData.studyProjectDesc || `스터디#${id}의 설명이 없습니다.`);
					setStudyLevel(studyData.studyLevel || 1);
					setStudyTags(studyData.tagNames || []);
					setMaxMembers(studyData.studyProjectTotal || 10);
					
					// 기간 설정
					if (studyData.studyProjectStart && studyData.studyProjectEnd) {
						const startDate = new Date(studyData.studyProjectStart).toISOString().split('T')[0];
						const endDate = new Date(studyData.studyProjectEnd).toISOString().split('T')[0];
						setStudyPeriod(`${startDate} ~ ${endDate}`);
					}
					
					// 멤버 정보 설정
					if (studyData.members) {
						setMembers(studyData.members);
						
						// 디버깅을 위한 로그
						console.log('백엔드에서 받은 멤버 데이터:', studyData.members);
						console.log('현재 로그인한 사용자 이메일:', authContext?.user?.email);
						console.log('스터디 생성자 ID:', studyData.userId);
						
						// 현재 사용자의 멤버 정보 찾기
						if (authContext?.user?.email) {
							console.log('이메일 비교 - 현재 사용자:', authContext?.user?.email);
							console.log('이메일 비교 - 멤버들:', studyData.members.map(m => ({ userId: m.userId, memberType: m.memberType, nick: m.nick })));
							
							// 더 유연한 비교를 위해 여러 방법으로 시도
							const currentUser = studyData.members.find((member: { userId: string; memberType: string; nick: string }) => {
								// 정확한 매치
								const exactMatch = member.userId === authContext?.user?.email;
								// 대소문자 무시 매치
								const caseInsensitiveMatch = member.userId.toLowerCase() === authContext?.user?.email.toLowerCase();
								// 공백 제거 후 매치
								const trimmedMatch = member.userId.trim() === authContext?.user?.email.trim();
								// 닉네임으로도 매치 시도
								const nicknameMatch = member.nick === authContext?.user?.nickname;
								
								console.log(`비교: ${member.userId} === ${authContext?.user?.email} = ${exactMatch}`);
								console.log(`대소문자 무시: ${member.userId.toLowerCase()} === ${authContext?.user?.email.toLowerCase()} = ${caseInsensitiveMatch}`);
								console.log(`공백 제거: ${member.userId.trim()} === ${authContext?.user?.email.trim()} = ${trimmedMatch}`);
								console.log(`닉네임 매치: ${member.nick} === ${authContext?.user?.nickname} = ${nicknameMatch}`);
								
								return exactMatch || caseInsensitiveMatch || trimmedMatch || nicknameMatch;
							});
							console.log('찾은 현재 사용자:', currentUser);
							
							if (currentUser) {
								console.log('멤버로 인식됨:', currentUser.memberType);
								setUserMemberType(currentUser.memberType);
								setIsStudyMember(true);
							} else {
								console.log('멤버 목록에서 찾을 수 없음');
								setUserMemberType(null);
								setIsStudyMember(false);
							}
						}
						
						// 리더의 닉네임 설정
						const leader = studyData.members.find((member: { memberType: string; nick: string }) => member.memberType === "leader");
						if (leader && leader.nick && leader.nick.trim() !== "") {
							setStudyLeader(leader.nick);
						} else {
							setStudyLeader(studyData.userId || "리더가 지정되지 않았습니다.");
						}
					} else {
						setMembers([]);
						console.log('멤버 목록이 비어있음');
						setUserMemberType(null);
						setIsStudyMember(false);
						setStudyLeader(studyData.userId || "리더가 지정되지 않았습니다.");
					}
				}
			} catch (error) {
				console.error('스터디 정보 조회 실패:', error);
				setUserMemberType(null);
				setIsStudyMember(false);
			} finally {
				setIsLoading(false);
			}
		};
		
		fetchStudyInfo();
	}, [id, authContext?.user?.email]);
	
	// 권한 체크 (로딩 중이 아닐 때만)
	const isStudyLeader = !isLoading && userMemberType === 'leader';
	const isStudyMemberUser = !isLoading && userMemberType === 'member';
	const canAccessMemberFeatures = !isLoading && ((userMemberType === 'leader' || userMemberType === 'member') || isApplied);
	
	// 디버깅을 위한 콘솔 로그
	console.log('=== 디버깅 정보 ===');
	console.log('userMemberType:', userMemberType);
	console.log('isStudyLeader:', isStudyLeader);
	console.log('canAccessMemberFeatures:', canAccessMemberFeatures);
	console.log('현재 사용자 닉네임:', authContext?.user?.nickname);
	console.log('현재 사용자 이메일:', authContext?.user?.email);
	console.log('스터디장:', studyLeader);
	console.log('스터디장 여부:', isStudyLeader);
	console.log('로그인 여부:', isLoggedIn);
	console.log('스터디 멤버 여부:', isStudyMember);
	console.log('로딩 상태:', isLoading);
	console.log('전체 authContext:', authContext);
	console.log('==================');

	const handleApplyClick = async () => {
		if (!authContext?.isLoggedIn) {
			alert("로그인 후 이용해주세요!");
			return;
		}

		alert("가입 신청 기능은 현재 개발 중입니다.");
	};

	const handleRecruitmentToggle = () => {
		setIsRecruiting(!isRecruiting);
		alert(isRecruiting ? "모집이 마감되었습니다." : "모집이 다시 시작되었습니다.");
	};

	const handleStudyEnd = () => {
		if (confirm("스터디를 종료하시겠습니까?")) {
			alert("스터디가 종료되었습니다.");
			// 여기에 스터디 종료 로직 추가
		}
	};

	const handleEditStudy = () => {
		alert("스터디 수정 기능은 현재 개발 중입니다.");
		// 여기에 스터디 수정 페이지로 이동하는 로직 추가
		// navigate(`/study/edit/${id}`);
	};

	// 메인 콘텐츠 렌더링 함수
	const renderMainContent = () => {
		switch (activeTab) {
			case "스터디 메인":
			case "스터디 정보":
			default:
				return (
					<div className="space-y-2 p-4 pr-10">
						{/* 헤더 영역 - 제목과 수정 버튼 */}
						<div className="flex justify-between items-start mb-4">
							<h3 className="text-2xl font-bold">{studyName}</h3>
							{/* 리더만 수정 버튼 표시 */}
							{!isLoading && isStudyLeader && (
								<button
									onClick={handleEditStudy}
									className="px-4 py-2 bg-[#8B85E9] text-white rounded-lg text-sm font-medium hover:bg-[#7C76D8] transition-colors duration-200 flex items-center gap-2"
								>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
									</svg>
									수정
								</button>
							)}
						</div>
						<div className="text-gray-700">
							<div className="flex items-center gap-2">
								<Info className="w-4 h-4 text-gray-600" />
								<span>스터디 소개</span>
							</div>
							<span className="text-gray-800 block mt-1">{studyTitle}</span>
						</div>
						<div className="text-gray-700">
							<div className="flex items-center gap-2">
								<Crown className="w-4 h-4 text-gray-600" />
								<span>리더</span>
							</div>
							<span className="text-gray-800 block mt-1">{studyLeader}</span>
						</div>
						<div className="text-gray-700">
							<div className="flex items-center gap-2">
								<Calendar className="w-4 h-4 text-gray-600" />
								<span>스터디 기간</span>
							</div>
							<span className="text-gray-800 block mt-1">{formatPeriod(studyPeriod)}</span>
						</div>
						<div className="text-gray-700 inline-block">
							<div className="flex items-center gap-2">
								<Tag className="w-4 h-4 text-gray-600" />
								<span className="font-medium">태그</span>
							</div>
							<div className="mt-2 flex gap-2 flex-wrap">
								{/* 스터디 레벨 뱃지 */}
								<span className={`px-2 py-0.5 rounded-xl text-xs font-medium ${
									studyLevel === 1 
										? "bg-green-100 text-green-700"
										: studyLevel === 2
										? "bg-yellow-100 text-yellow-700"
										: "bg-red-100 text-red-700"
								}`}>
									스터디 레벨 {studyLevel}
								</span>
								{studyTags.length > 0 ? (
									studyTags.map((tag: string, index: number) => (
										<span key={index} className="px-2 py-0.5 rounded-xl text-xs bg-gray-100 text-gray-600">
											#{tag}
										</span>
									))
								) : (
									<span className="text-sm text-gray-500">태그 정보가 없습니다.</span>
								)}
							</div>
						</div>
						<hr className="my-4"/>

						<h4 className="font-semibold mb-2" style={{ color: "#8B85E9" }}>스터디 설명</h4>
						<div className="bg-white border-2 rounded-xl p-4" style={{ borderColor: "#8B85E9" }}>
							<p className="text-gray-700 text-sm sm:text-base leading-relaxed">{studyDescription}</p>
						</div>
						{/* 버튼 영역 */}
						{!isLoading && isStudyLeader ? (
							// 스터디장인 경우
							<div className="flex gap-2 mt-3">
								<button
									type="button"
									onClick={handleRecruitmentToggle}
									className="flex-1 px-4 py-2 rounded-lg text-white text-sm sm:text-base cursor-pointer transition-colors duration-200"
									style={{ backgroundColor: isRecruiting ? "#EF4444" : "#10B981" }}
								>
									{isRecruiting ? "모집 마감" : "모집 재시작"}
								</button>
								<button
									type="button"
									onClick={handleStudyEnd}
									className="flex-1 px-4 py-2 rounded-lg text-white text-sm sm:text-base cursor-pointer transition-colors duration-200"
									style={{ backgroundColor: "#6B7280" }}
								>
									스터디 종료
								</button>
							</div>
						) : !isLoading && (userMemberType === 'member' || userMemberType === null) ? (
							// 일반 사용자이거나 멤버인 경우
							<button
								type="button"
								onClick={handleApplyClick}
								className="w-full mt-3 px-4 py-2 rounded-lg text-white text-sm sm:text-base cursor-pointer"
								style={{ backgroundColor: isApplied ? "#6B7280" : "#8B85E9" }}
								disabled={isApplied}
							>
								{isApplied ? "가입 신청됨" : "스터디 가입 신청"}
							</button>
						) : null}
					</div>
				);
			case "과제 제출":
				// if (!isLoggedIn || !(userMemberType === 'leader' || userMemberType === 'member')) {
				// 	return (
				// 		<div className="flex items-center justify-center h-64">
				// 			<div className="text-center">
				// 				<p className="text-gray-500 mb-2">로그인이 필요합니다.</p>
				// 				<p className="text-sm text-gray-400">스터디에 가입한 멤버만 접근할 수 있습니다.</p>
				// 			</div>
				// 		</div>
				// 	);
				// }
				return <Assignment />;

			case "과제 피드백":
				// if (!isLoggedIn || !(userMemberType === 'leader' || userMemberType === 'member')) {
				// 	return (
				// 		<div className="flex items-center justify-center h-64">
				// 			<div className="text-center">
				// 			<p className="text-gray-500 mb-2">로그인이 필요합니다.</p>
				// 			<p className="text-sm text-gray-400">스터디에 가입한 멤버만 접근할 수 있습니다.</p>
				// 		</div>
				// 	);
				// }
				return <FeedBack />;
			case "과제 / 일정 관리":
				// if (!isLoggedIn || !(userMemberType === 'leader' || userMemberType === 'member')) {
				// 	return (
				// 		<div className="flex items-center justify-center h-64">
				// 			<div className="text-center">
				// 				<p className="text-gray-500 mb-2">로그인이 필요합니다.</p>
				// 				<p className="text-sm text-gray-400">스터디에 가입한 멤버만 접근할 수 있습니다.</p>
				// 			</div>
				// 		</div>
				// 	);
				// }
				return <Schedule isStudyLeader={isStudyLeader} />;
			case "커리큘럼":
				return <Curriculum />;
			case "커뮤니티":
				// if (!isLoggedIn || !(userMemberType === 'leader' || userMemberType === 'member')) {
				// 	return (
				// 		<div className="flex items-center justify-center h-64">
				// 			<div className="text-center">
				// 				<p className="text-gray-500 mb-2">로그인이 필요합니다.</p>
				// 				<p className="text-sm text-gray-400">스터디에 가입한 멤버만 접근할 수 있습니다.</p>
				// 			</div>
				// 		</div>
				// 	);
				// }
				return <Community />;
		}
	};

	return (
		<PageLayout>
			<ResponsiveContainer variant="sidebar">
				{/* 사이드바 */}
				<ResponsiveSidebar>
					<StudyDetailSideBar
						activeTab={activeTab}
						onTabChange={(tab) => setActiveTab(tab)}
						isLoggedIn={isLoggedIn}
						isStudyMember={!isLoading && (userMemberType === 'leader' || userMemberType === 'member')}
						isProject={false}
						isStudyLeader={isStudyLeader}
						userMemberType={userMemberType}
						maxMembers={maxMembers}
						members={members}
					/>
				</ResponsiveSidebar>

				{/* 메인 콘텐츠 */}
				<ResponsiveMainContent padding="md">
					{renderMainContent()}
				</ResponsiveMainContent>
			</ResponsiveContainer>
			<DraggableChatWidget />
		</PageLayout>
	);
};

export default StudyDetailPage;
