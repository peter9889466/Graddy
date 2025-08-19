import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import ResponsiveContainer from "../components/layout/ResponsiveContainer";
import ResponsiveSidebar from "../components/layout/ResponsiveSidebar";
import ResponsiveMainContent from "../components/layout/ResponsiveMainContent";
import StudyDetailSideBar from "../components/detail/StudyDetailSideBar";
import StudyChatting from "../components/detail/StudyChatting";
import { studyList } from "../data/studyData";
import { AuthContext } from "../contexts/AuthContext";
 

const StudyDetailPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("스터디 정보");
	const [isApplied, setIsApplied] = useState(false);
	const authContext = useContext(AuthContext);
	const location = useLocation();
	const state = location.state as {
		title:string; 
		description:string
		leader:string;
		period: string;
		tags: string[];
	} | null;
	// 스터디 이름이 없을 때 스터디 상세 페이지로 뜨게 근데 그럴 수 있나?
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
	const [studyTags, setStudyTags] = useState<string[]>(
		state?.tags || []
	);

	const menuItems = ["스터디 정보", "참여자", "활동 기록"]

	useEffect(() => {
		if (!state?.title) {
			// state가 없으면 id 기반 임시 제목 세팅 <- 이럴 수 있냐고
			setStudyTitle(`스터디#${id}`);
		}
		if (!state?.description) {
			setStudyDescription(`스터디#${id}의 설명이 없습니다.`);
		}
		if (!state?.leader) {
			setStudyLeader("스터디장이 지정되지 않았습니다.")
		}

		// 기간은 state에 없을 수 있으니 id로 조회하여 설정
		if (!state?.period) {
			const numericId = id ? parseInt(id, 10) : NaN;
			const found = studyList.find((s) => s.id === numericId);
			setStudyPeriod(found?.period ?? "기간 정보가 없습니다.");
		} else {
			setStudyPeriod(state.period);
		}

		// 태그는 state에 없을 수 있으니 id로 조회하여 설정
		if (!state?.tags || state.tags.length === 0) {
			const numericId = id ? parseInt(id, 10) : NaN;
			const found = studyList.find((s) => s.id === numericId);
			setStudyTags(found?.tags ?? []);
		} else {
			setStudyTags(state.tags);
		}
	}, [id, state]);

	const handleApplyClick = () => {
		if (!authContext?.isLoggedIn) {
			alert("로그인 후 이용해주세요!");
			return;
		}
		setIsApplied(true);
	};

	return (
	<PageLayout>
		<ResponsiveContainer variant="sidebar">
			{/* 사이드바 */}
			<ResponsiveSidebar>
			<StudyDetailSideBar
				activeTab={activeTab}
				onTabChange={(tab) => console.log("탭 변경:", tab)}
				onDeleteAccount={() => {}}
			/>
		</ResponsiveSidebar>

		{/* 메인 콘텐츠 */}
		<ResponsiveMainContent padding="md">
			<div className="space-y-1">
				<h3 className="text-2xl font-bold">{studyTitle}</h3>
				<p className="text-gray-700">
				스터디 소개: <span className="text-gray-800">{studyDescription}</span>
				</p>
				<p className="text-gray-700">
				스터디장: <span className="text-gray-800">{studyLeader}</span>
				</p>
				<p className="text-gray-700">
				스터디 기간: <span className="text-gray-800">{studyPeriod}</span>
				</p>
				<div className="text-gray-700 inline-block border-2 rounded-xl p-3" style={{ borderColor: "#8B85E9" }}>
					<div className="flex items-center gap-2">
						<span className="font-medium">태그</span>
					</div>
					<div className="mt-2 flex gap-2 flex-wrap">
						{studyTags.length > 0 ? (
							studyTags.map((t, index) => (
								<span key={`${t}-${index}`} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-xl text-xs border border-gray-300">#{t}</span>
							))
						) : (
							<span className="text-sm text-gray-500">태그 정보가 없습니다.</span>
						)}
					</div>
				</div>
				<hr className="my-4"/>

				<div className="bg-white border-2 rounded-xl p-4" style={{ borderColor: "#8B85E9" }}>
					<h4 className="font-semibold mb-2" style={{ color: "#8B85E9" }}>스터디 소개</h4>
					<p className="text-gray-700 text-sm sm:text-base leading-relaxed">{studyDescription}</p>
				</div>
				{/* 가입 신청 버튼 */}
                {/* 토큰 처리: 나중에 AuthContext에서 localStorage.getItem('token')으로 토큰 확인하도록 수정하면 됨
                    API 호출: handleApplyClick에서 실제 API 호출로 변경하면 됨
                    코드 수정 최소화: 기존 로직은 그대로 유지하고 인증 부분만 업데이트 */}
				<button
					type="button"
					onClick={handleApplyClick}
					className="mt-3 px-4 py-2 rounded-lg text-white text-sm sm:text-base cursor-pointer"
					style={{ backgroundColor: isApplied ? "#6B7280" : "#8B85E9" }}
				>
					{isApplied ? "승인 대기" : "스터디 가입 신청"}
				</button>

			</div>
		</ResponsiveMainContent>
		{/* 오른쪽 채팅 패널 */}
		<ResponsiveSidebar isCollapsible={false}>
			<StudyChatting />
		</ResponsiveSidebar>
		</ResponsiveContainer>
	</PageLayout>
	);
};

export default StudyDetailPage;
