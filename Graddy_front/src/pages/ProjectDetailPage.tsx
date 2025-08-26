import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ResponsiveContainer from "../components/layout/ResponsiveContainer";
import ResponsiveSidebar from "../components/layout/ResponsiveSidebar";
import ResponsiveMainContent from "../components/layout/ResponsiveMainContent";
import StudyDetailSideBar from "../components/detail/StudyDetailSideBar";
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
import { Tag, Info, Crown, Calendar, Github, Edit } from "lucide-react";

const ProjectDetailPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("프로젝트 메인");
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
	} | null;

	const [studyName, setStudyName] = useState<string>(
		state?.name || `프로젝트#${id}`
	);
	
	const [studyTitle, setStudyTitle] = useState<string>(
		state?.title || `프로젝트#${id}의 소개가 없습니다.`
	);
	const [studyDescription, setStudyDescription] = useState<String>(
		state?.description || `프로젝트#${id}의 설명이 없습니다.`
	);
	const [studyLeader, setStudyLeader] = useState<string>(
		state?.leader || "프로젝트장이 지정되지 않았습니다."
	);
	const [leaderNickname, setLeaderNickname] = useState<string>("");
	const [studyPeriod, setStudyPeriod] = useState<string>(
		state?.period || ""
	);
	const [githubUrl, setGithubUrl] = useState<string>("");
	const [isEditing, setIsEditing] = useState(false);
	
	// 프로젝트 설정
	useEffect(() => {
		setActiveTab("프로젝트 메인");
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
	const [isLoading, setIsLoading] = useState(true);
	
	// 사용자 권한 확인
	const isLoggedIn = authContext?.isLoggedIn || false;
	
	// 백엔드에서 프로젝트 정보와 멤버 정보를 받아와서 설정
	useEffect(() => {
		const fetchProjectInfo = async () => {
			if (!id) return;
			
			setIsLoading(true);
			
			try {
				const studyProjectId = parseInt(id, 10);
				const studyData = await StudyApiService.getStudyProject(studyProjectId);
				
				if (studyData) {
					// 프로젝트 기본 정보 설정
					setStudyName(studyData.studyProjectName || `프로젝트#${id}`);
					setStudyTitle(studyData.studyProjectTitle || `프로젝트#${id} 소개가 없습니다.`);
					setStudyDescription(studyData.studyProjectDesc || `프로젝트#${id}의 설명이 없습니다.`);
					setStudyTags(studyData.tagNames || []);
					
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
						console.log('프로젝트 생성자 ID:', studyData.userId);
						
						// 현재 사용자의 멤버 정보 찾기
						if (authContext?.user?.email) {
							console.log('이메일 비교 - 현재 사용자:', authContext?.user?.email);
							console.log('이메일 비교 - 멤버들:', studyData.members.map(m => ({ userId: m.userId, memberType: m.memberType, nick: m.nick })));
							
							const currentUser = studyData.members.find((member: { userId: string; memberType: string; nick: string }) => {
								const match = member.userId === authContext?.user?.email;
								console.log(`비교: ${member.userId} === ${authContext?.user?.email} = ${match}`);
								return match;
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
				console.error('프로젝트 정보 조회 실패:', error);
				setUserMemberType(null);
				setIsStudyMember(false);
			} finally {
				setIsLoading(false);
			}
		};
		
		fetchProjectInfo();
	}, [id, authContext?.user?.email]);
	
	// 권한 체크 (로딩 중이 아닐 때만)
	const isStudyLeader = !isLoading && userMemberType === 'leader';
	const isStudyMemberUser = !isLoading && userMemberType === 'member';
	const canAccessMemberFeatures = !isLoading && ((userMemberType === 'leader' || userMemberType === 'member') || isApplied);
	
	// 디버깅을 위한 콘솔 로그
	console.log('userMemberType:', userMemberType);
	console.log('isStudyLeader:', isStudyLeader);
	console.log('canAccessMemberFeatures:', canAccessMemberFeatures);
	
	// 디버깅을 위한 콘솔 로그
	console.log('현재 사용자 닉네임:', authContext?.user?.nickname);
	console.log('프로젝트장 ID:', studyLeader);
	console.log('프로젝트장 닉네임:', leaderNickname);
	console.log('프로젝트장 여부:', isStudyLeader);
	console.log('로그인 여부:', isLoggedIn);
	console.log('프로젝트 멤버 여부:', isStudyMember);

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
		if (confirm("프로젝트를 종료하시겠습니까?")) {
			alert("프로젝트가 종료되었습니다.");
			// 여기에 프로젝트 종료 로직 추가
		}
	};

	const handleEditToggle = () => {
		setIsEditing(!isEditing);
	};

	const handleSave = () => {
		// 여기에 저장 로직 추가
		alert("프로젝트 정보가 저장되었습니다.");
		setIsEditing(false);
	};

	const handleCancel = () => {
		setIsEditing(false);
		// 변경사항 초기화
	};

	// 메인 콘텐츠 렌더링 함수
	const renderMainContent = () => {
		switch (activeTab) {
			case "프로젝트 메인":
			default:
				return (
					<div className="space-y-2 p-4 pr-10 relative">
						{/* 수정 버튼 - 팀장만 표시 */}
						{isStudyLeader && (
							<div className="absolute top-0 right-0">
								{!isEditing ? (
									<button
										onClick={handleEditToggle}
										className="flex items-center gap-2 px-3 py-2 bg-[#8B85E9] text-white rounded-lg text-sm hover:bg-[#7A74D8] transition-colors duration-200"
									>
										<Edit className="w-4 h-4" />
										수정
									</button>
								) : (
									<div className="flex gap-2">
										<button
											onClick={handleSave}
											className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors duration-200"
										>
											저장
										</button>
										<button
											onClick={handleCancel}
											className="px-3 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors duration-200"
										>
											취소
										</button>
									</div>
								)}
							</div>
						)}
						<h3 className="text-2xl font-bold">{studyName}</h3>
						<p className="text-gray-700">
							<div className="flex items-center gap-2">
								<Info className="w-4 h-4 text-gray-600" />
								<span>프로젝트 소개</span>
							</div>
							<span className="text-gray-800 block mt-1">{studyTitle}</span>
						</p>
						<p className="text-gray-700">
							<div className="flex items-center gap-2">
								<Crown className="w-4 h-4 text-gray-600" />
								<span>리더</span>
							</div>
							<span className="text-gray-800 block mt-1">{leaderNickname || studyLeader}</span>
						</p>
						<p className="text-gray-700">
							<div className="flex items-center gap-2">
								<Calendar className="w-4 h-4 text-gray-600" />
								<span>프로젝트 기간</span>
							</div>
							<span className="text-gray-800 block mt-1">{formatPeriod(studyPeriod)}</span>
						</p>
						<div className="text-gray-700 inline-block">
							<div className="flex items-center gap-2">
								<Tag className="w-4 h-4 text-gray-600" />
								<span className="font-medium">태그</span>
							</div>
							<div className="mt-2 flex gap-2 flex-wrap">
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
						<div className="flex items-center gap-2 mt-2">
							<Github className="w-4 h-4 text-gray-600" />
							<span className="font-medium text-gray-600">GitHub</span>
						</div>
						<div className="mt-1">
							<input
								type="url"
								value={githubUrl}
								onChange={(e) => setGithubUrl(e.target.value)}
								placeholder="GitHub URL"
								className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-transparent"
							/>
						</div>
						<hr className="my-4"/>

						<h4 className="font-semibold mb-2" style={{ color: "#8B85E9" }}>프로젝트 설명</h4>
						<div className="bg-white border-2 rounded-xl p-4" style={{ borderColor: "#8B85E9" }}>
							<p className="text-gray-700 text-sm sm:text-base leading-relaxed">{studyDescription}</p>
						</div>
						{/* 버튼 영역 */}
						{isStudyLeader ? (
							// 프로젝트장인 경우
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
									프로젝트 종료
								</button>
							</div>
						) : (
							// 일반 사용자인 경우
							<button
								type="button"
								onClick={handleApplyClick}
								className="w-full mt-3 px-4 py-2 rounded-lg text-white text-sm sm:text-base cursor-pointer"
								style={{ backgroundColor: isApplied ? "#6B7280" : "#8B85E9" }}
								disabled={isApplied}
							>
								{isApplied ? "가입 신청됨" : "프로젝트 가입 신청"}
							</button>
						)}
					</div>
				);
			case "커뮤니티":
				if (!isLoggedIn || !(userMemberType === 'leader' || userMemberType === 'member')) {
					return (
						<div className="flex items-center justify-center h-64">
							<div className="text-center">
								<p className="text-gray-500 mb-2">로그인이 필요합니다.</p>
								<p className="text-sm text-gray-400">프로젝트에 가입한 멤버만 접근할 수 있습니다.</p>
							</div>
						</div>
					);
				}
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
						isProject={true}
						isStudyLeader={isStudyLeader}
						userMemberType={userMemberType}
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

export default ProjectDetailPage;
