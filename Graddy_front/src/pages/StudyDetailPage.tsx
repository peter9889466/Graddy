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
		title:string; 
		description:string
		leader:string;
		period: string;
		tags: string[];
		type?: 'study' | 'project';
		studyLevel?: number;
	} | null;
	
	const [studyTitle, setStudyTitle] = useState<string>(
		state?.title || `스터디#${id}`
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

	// 현재 사용자가 스터디장인지 확인
	const isStudyLeader = authContext?.user?.nickname === studyLeader;
	
	// 임시 테스트용 (실제 사용자 닉네임으로 변경해보세요)
	// const isStudyLeader = "test" === studyLeader;
	


	// 사용자 권한 확인
	const isLoggedIn = authContext?.isLoggedIn || false;
	const isStudyMember = isStudyLeader || isApplied; // 스터디장이거나 가입 신청한 사용자
	
	// 디버깅을 위한 콘솔 로그
	console.log('현재 사용자 닉네임:', authContext?.user?.nickname);
	console.log('스터디장:', studyLeader);
	console.log('스터디장 여부:', isStudyLeader);
	console.log('로그인 여부:', isLoggedIn);
	console.log('스터디 멤버 여부:', isStudyMember);

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

	// 메인 콘텐츠 렌더링 함수
	const renderMainContent = () => {
		switch (activeTab) {
			case "스터디 메인":
			case "스터디 정보":
			default:
				return (
					<div className="space-y-2 p-4 pr-10">
						<h3 className="text-2xl font-bold">{studyTitle}</h3>
						<p className="text-gray-700">
							<div className="flex items-center gap-2">
								<Info className="w-4 h-4 text-gray-600" />
								<span>스터디 소개</span>
							</div>
							<span className="text-gray-800 block mt-1">{studyDescription}</span>
						</p>
						<p className="text-gray-700">
							<div className="flex items-center gap-2">
								<Crown className="w-4 h-4 text-gray-600" />
								<span>리더</span>
							</div>
							<span className="text-gray-800 block mt-1">{studyLeader}</span>
						</p>
						<p className="text-gray-700">
							<div className="flex items-center gap-2">
								<Calendar className="w-4 h-4 text-gray-600" />
								<span>스터디 기간</span>
							</div>
							<span className="text-gray-800 block mt-1">{formatPeriod(studyPeriod)}</span>
						</p>
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
						{isStudyLeader ? (
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
						) : (
							// 일반 사용자인 경우
							<button
								type="button"
								onClick={handleApplyClick}
								className="w-full mt-3 px-4 py-2 rounded-lg text-white text-sm sm:text-base cursor-pointer"
								style={{ backgroundColor: isApplied ? "#6B7280" : "#8B85E9" }}
								disabled={isApplied}
							>
								{isApplied ? "가입 신청됨" : "스터디 가입 신청"}
							</button>
						)}
					</div>
				);
			case "과제 제출":
				if (!isLoggedIn || !isStudyMember) {
					return (
						<div className="flex items-center justify-center h-64">
							<div className="text-center">
								<p className="text-gray-500 mb-2">로그인이 필요합니다.</p>
								<p className="text-sm text-gray-400">스터디에 가입한 멤버만 접근할 수 있습니다.</p>
							</div>
						</div>
					);
				}
				return <Assignment />;

			case "과제 피드백":
				if (!isLoggedIn || !isStudyMember) {
					return (
						<div className="flex items-center justify-center h-64">
							<div className="text-center">
								<p className="text-gray-500 mb-2">로그인이 필요합니다.</p>
								<p className="text-sm text-gray-400">스터디에 가입한 멤버만 접근할 수 있습니다.</p>
							</div>
						</div>
					);
				}
				return <FeedBack />;
			case "과제 / 일정 관리":
				if (!isLoggedIn || !isStudyMember) {
					return (
						<div className="flex items-center justify-center h-64">
							<div className="text-center">
								<p className="text-gray-500 mb-2">로그인이 필요합니다.</p>
								<p className="text-sm text-gray-400">스터디에 가입한 멤버만 접근할 수 있습니다.</p>
							</div>
						</div>
					);
				}
				return <Schedule isStudyLeader={isStudyLeader} />;
			case "커리큘럼":
				return <Curriculum />;
			case "커뮤니티":
				if (!isLoggedIn || !isStudyMember) {
					return (
						<div className="flex items-center justify-center h-64">
							<div className="text-center">
								<p className="text-gray-500 mb-2">로그인이 필요합니다.</p>
								<p className="text-sm text-gray-400">스터디에 가입한 멤버만 접근할 수 있습니다.</p>
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
						isStudyMember={isStudyMember}
						isProject={false}
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
