import React, { useEffect, useState, useContext, useMemo } from "react";
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
import {
    StudyApiService,
    applyToStudyProject,
    getStudyApplications,
    processStudyApplication,
    getUserApplicationStatus,
    StudyApplicationResponse,
    cancelStudyApplication,
} from "../services/studyApi";
import FeedBack from "@/components/detail/FeedBack";
import Schedule from "@/components/detail/Schedule";
import Curriculum from "@/components/detail/Curriculum";
import Community from "@/components/detail/Community";
import DraggableChatWidget from "@/components/shared/DraggableChatWidget";
import {
    Tag,
    Info,
    Crown,
    Calendar,
    Search,
    AlertCircle,
    X,
    Star,
} from "lucide-react";
import { getUserIdFromToken } from "../utils/jwtUtils";
import {
    InterestApiService,
    InterestForFrontend,
} from "../services/interestApi";
import { useCommunityContext } from "@/contexts/CommunityContext";

const StudyDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("스터디 정보");
    const [isApplied, setIsApplied] = useState(false);
    const [isRecruiting, setIsRecruiting] = useState(true); // 모집 상태 관리
    const [isStudyEnd, setIsStudyEnd] = useState(false);
    const [curriculumText, setCurriculumText] = useState<string>("");
    const [currentMemberId, setCurrentMemberId] = useState<number | null>(null);

    if (!id) {
        // id가 없는 경우의 에러 처리 또는 리디렉션
        return <div>유효하지 않은 스터디 ID입니다.</div>;
    }
    const studyProjectId = parseInt(id, 10);

    const authContext = useContext(AuthContext);
    const location = useLocation();
    const state = location.state as {
        name: string;
        title: string;
        description: string;
        leader: string;
        period: string;
        tags: string[];
        type?: "study" | "project";
        studyLevel?: number;
    } | null;

    const [studyName, setStudyName] = useState<string>(
        state?.name || `스터디#${id}`
    );
    const [studyTitle, setStudyTitle] = useState<string>(
        state?.title || `스터디#${id} 소개가 없습니다.`
    );
    const [studyDescription, setStudyDescription] = useState<string>(
        state?.description || `스터디#${id}의 설명이 없습니다.`
    );
    const [studyLeader, setStudyLeader] = useState<string>(
        state?.leader || "스터디장이 지정되지 않았습니다."
    );
    const [studyPeriod, setStudyPeriod] = useState<string>(state?.period || "");
    const [studyLevel, setStudyLevel] = useState<number>(
        state?.studyLevel || 1
    );

    if (!authContext) {
        // 컨텍스트가 없는 경우의 처리 (예: null 반환 또는 로딩 상태 표시)
        return null;
    }

    // 기간 포맷팅 함수
    const formatPeriod = (period: string): string => {
        if (!period) return "기간 정보가 없습니다.";

        // "25.08.15~25.09.15" 형식을 "2025.08.15~2025.09.15" 형식으로 변환
        const parts = period.split("~");
        if (parts.length === 2) {
            const startDate = parts[0].trim();
            const endDate = parts[1].trim();

            // "25.08.15" -> "2025.08.15" 변환
            const formatDate = (dateStr: string) => {
                const dateParts = dateStr.split(".");
                if (dateParts.length === 3) {
                    const year =
                        dateParts[0].length === 2
                            ? `20${dateParts[0]}`
                            : dateParts[0];
                    const month = dateParts[1].padStart(2, "0");
                    const day = dateParts[2].padStart(2, "0");
                    return `${year}.${month}.${day}`;
                }
                return dateStr;
            };

            return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
        }

        return period;
    };
    const [studyTags, setStudyTags] = useState<any[]>(state?.tags || []);

    const menuItems = ["스터디 정보", "참여자", "활동 기록"];

    useEffect(() => {
        if (!state?.title) {
            setStudyTitle(`스터디#${id}`);
        }
        if (!state?.description) {
            setStudyDescription(`스터디#${id}의 설명이 없습니다.`);
        }
        if (!state?.leader) {
            setStudyLeader("스터디장이 지정되지 않았습니다.");
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
    const [members, setMembers] = useState<
        Array<{
            memberId: number;
            userId: string;
            nick: string;  // 닉네임
            memberType: string;
            memberStatus: string;
            joinedAt: string;
        }>
    >([]);
    const [maxMembers, setMaxMembers] = useState<number>(10);
    const [isLoading, setIsLoading] = useState(true);

    // 추가된 부분
    const { user } = authContext;
    const currentUserId = user?.nickname;

    const currentMember = useMemo(() => {
        if (!user || !user.nickname) return null; // 유저 정보나 userId가 없으면 null 반환
        return members.find((member) => member.userId === user.nickname); // userId로 멤버 찾기
    }, [members, user]);

    const memberId = currentMember ? currentMember.memberId : null;
    //

    // 편집 관련 상태
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(studyName);
    const [editTitle, setEditTitle] = useState(studyTitle);
    const [editDescription, setEditDescription] = useState(studyDescription);
    const [editPeriod, setEditPeriod] = useState(studyPeriod);
    const [editTags, setEditTags] = useState<
        Array<{ name: string; interestId: number }>
    >([]);
    const [editStudyLevel, setEditStudyLevel] = useState(studyLevel);
    const [isTagModalOpen, setIsTagModalOpen] = useState(false);
    const [tagSearchValue, setTagSearchValue] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null
    );

    // 태그 관련 상태
    const [interests, setInterests] = useState<InterestForFrontend[]>([]);
    const [interestsLoading, setInterestsLoading] = useState(false);
    const [interestsError, setInterestsError] = useState<string | null>(null);
    const [tagCategories, setTagCategories] = useState<
        Array<{ id: number; name: string; tags: string[] }>
    >([]);

    // 스터디 레벨 드롭다운 상태
    const [isLevelOpen, setIsLevelOpen] = useState(false);

    // 가입 신청 관련 상태
    const [applications, setApplications] = useState<
        StudyApplicationResponse[]
    >([]);
    const [isApplying, setIsApplying] = useState(false);
    const [applicationMessage, setApplicationMessage] = useState("");

    // 사용자 권한 확인
    const isLoggedIn = authContext?.isLoggedIn || false;

    // 백엔드에서 스터디 정보와 멤버 정보를 받아와서 설정
    useEffect(() => {
        const fetchStudyInfo = async () => {
            if (!id) return;

            setIsLoading(true);

            try {
                const studyProjectId = parseInt(id, 10);
                const studyData = await StudyApiService.getStudyProject(
                    studyProjectId
                );

                if (studyData) {
                    // 스터디 기본 정보 설정
                    setStudyName(studyData.studyProjectName || `스터디#${id}`);
                    setStudyTitle(
                        studyData.studyProjectTitle ||
                            `스터디#${id} 소개가 없습니다.`
                    );
                    setStudyDescription(
                        studyData.studyProjectDesc ||
                            `스터디#${id}의 설명이 없습니다.`
                    );
                    setStudyLevel(studyData.studyLevel || 1);
                    setStudyTags(studyData.tagNames || []);
                    setMaxMembers(studyData.studyProjectTotal || 10);
                    setIsRecruiting(studyData.isRecruiting === "recruitment");

                    // 기간 설정
                    if (
                        studyData.studyProjectStart &&
                        studyData.studyProjectEnd
                    ) {
                        console.log(
                            "원본 날짜 데이터:",
                            studyData.studyProjectStart,
                            studyData.studyProjectEnd
                        );

                        // 날짜 파싱 및 변환
                        const parseDate = (dateString: string) => {
                            // 이미 YYYY-MM-DD 형식인 경우
                            if (dateString.includes("T")) {
                                return dateString.split("T")[0];
                            }
                            // 다른 형식인 경우 Date 객체로 변환
                            const date = new Date(dateString);
                            if (isNaN(date.getTime())) {
                                console.error("날짜 파싱 실패:", dateString);
                                return dateString; // 파싱 실패 시 원본 반환
                            }
                            return date.toISOString().split("T")[0];
                        };

                        const startDateStr = parseDate(
                            studyData.studyProjectStart
                        );
                        const endDateStr = parseDate(studyData.studyProjectEnd);

                        console.log("변환된 날짜:", startDateStr, endDateStr);
                        setStudyPeriod(`${startDateStr} ~ ${endDateStr}`);
                    }

                    // JWT 토큰에서 사용자 ID 가져오기
                    const currentUserId = getUserIdFromToken();
                    console.log("JWT에서 추출한 사용자 ID:", currentUserId);

                    // 멤버 정보 설정
                    if (studyData.members) {
                        setMembers(studyData.members);

                        // 디버깅을 위한 로그
                        console.log(
                            "백엔드에서 받은 멤버 데이터:",
                            studyData.members
                        );
                        console.log("JWT에서 추출한 사용자 ID:", currentUserId);
                        console.log("스터디 생성자 ID:", studyData.userId);

                        // 현재 사용자의 멤버 정보 찾기
                        if (currentUserId) {
                            console.log(
                                "사용자 ID 비교 - 현재 사용자:",
                                currentUserId
                            );
                            console.log(
                                "사용자 ID 비교 - 멤버들:",
                                studyData.members.map((m) => ({
                                    userId: m.userId,
                                    memberType: m.memberType,
                                    nick: m.nick,
                                }))
                            );

                            // JWT에서 추출한 사용자 ID로 매치
                            const currentUser = studyData.members.find(
                                (member: {
                                    userId: string;
                                    memberType: string;
                                    nick: string;  // 커뮤니티에서 게시글 작성 시 제목에 아이디 대신 닉네임이 나와야 함.
                                }) => {
                                    // 정확한 매치
                                    const exactMatch =
                                        member.userId === currentUserId;
                                    // 대소문자 무시 매치
                                    const caseInsensitiveMatch =
                                        member.userId.toLowerCase() ===
                                        currentUserId.toLowerCase();
                                    // 공백 제거 후 매치
                                    const trimmedMatch =
                                        member.userId.trim() ===
                                        currentUserId.trim();

                                    console.log(
                                        `비교: ${member.userId} === ${currentUserId} = ${exactMatch}`
                                    );
                                    console.log(
                                        `대소문자 무시: ${member.userId.toLowerCase()} === ${currentUserId.toLowerCase()} = ${caseInsensitiveMatch}`
                                    );
                                    console.log(
                                        `공백 제거: ${member.userId.trim()} === ${currentUserId.trim()} = ${trimmedMatch}`
                                    );

                                    return (
                                        exactMatch ||
                                        caseInsensitiveMatch ||
                                        trimmedMatch
                                    );
                                }
                            );
                            console.log("찾은 현재 사용자:", currentUser);

                            if (currentUser) {
                                console.log(
                                    "멤버로 인식됨:",
                                    currentUser.memberType
                                );
                                setUserMemberType(currentUser.memberType);
                                setIsStudyMember(true);
                            } else {
                                console.log("멤버 목록에서 찾을 수 없음");

                                // 스터디 생성자인지 확인
                                if (currentUserId === studyData.userId) {
                                    console.log("스터디 생성자로 인식됨");
                                    setUserMemberType("leader");
                                    setIsStudyMember(true);
                                } else {
                                    console.log("스터디 생성자도 아님");
                                    setUserMemberType(null);
                                    setIsStudyMember(false);
                                }
                            }
                        }

                        // 리더의 닉네임 설정
                        const leader = studyData.members.find(
                            (member: { memberType: string; nick: string }) =>
                                member.memberType === "leader"
                        );
                        if (
                            leader &&
                            leader.nick &&
                            leader.nick.trim() !== ""
                        ) {
                            setStudyLeader(leader.nick);
                        } else {
                            setStudyLeader(
                                studyData.userId ||
                                    "리더가 지정되지 않았습니다."
                            );
                        }
                    } else {
                        setMembers([]);
                        console.log("멤버 목록이 비어있음");

                        // 스터디 생성자인지 확인
                        if (currentUserId === studyData.userId) {
                            console.log(
                                "스터디 생성자로 인식됨 (멤버 목록이 비어있음)"
                            );
                            setUserMemberType("leader");
                            setIsStudyMember(true);
                        } else {
                            setUserMemberType(null);
                            setIsStudyMember(false);
                        }

                        setStudyLeader(
                            studyData.userId || "리더가 지정되지 않았습니다."
                        );
                    }

                    // curText 설정
                    setCurriculumText(studyData.curText || "");
                }
            } catch (error) {
                console.error("스터디 정보 조회 실패:", error);
                setUserMemberType(null);
                setIsStudyMember(false);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudyInfo();
    }, [id, authContext?.user?.nickname]);

    // 권한 체크 (로딩 중이 아닐 때만)
    const isStudyLeader = !isLoading && userMemberType === "leader";
    const isStudyMemberUser = !isLoading && userMemberType === "member";
    const canAccessMemberFeatures =
        !isLoading &&
        (userMemberType === "leader" ||
            userMemberType === "member" ||
            isApplied);

    // 디버깅을 위한 콘솔 로그
    console.log("=== 디버깅 정보 ===");
    console.log("userMemberType:", userMemberType);
    console.log("isStudyLeader:", isStudyLeader);
    console.log("canAccessMemberFeatures:", canAccessMemberFeatures);
    console.log("현재 사용자 아이디:", authContext?.user?.nickname);

    console.log("스터디장:", studyLeader);
    console.log("스터디장 여부:", isStudyLeader);
    console.log("로그인 여부:", isLoggedIn);
    console.log("스터디 멤버 여부:", isStudyMember);
    console.log("가입 신청 상태 (isApplied):", isApplied);
    console.log("로딩 상태:", isLoading);
    console.log("==================");

    const handleApplyClick = async () => {
        if (!authContext?.isLoggedIn) {
            alert("로그인 후 이용해주세요!");
            return;
        }

        alert("가입 신청 기능은 현재 개발 중입니다.");
    };

    const handleRecruitmentToggle = async () => {
        if (!id) return;

        try {
            const newStatus = isRecruiting ? "complete" : "recruitment";
            await StudyApiService.updateStudyProjectStatus(
                parseInt(id, 10),
                newStatus
            );

            setIsRecruiting(!isRecruiting);
            alert(
                isRecruiting
                    ? "모집이 마감되었습니다."
                    : "모집이 다시 시작되었습니다."
            );
        } catch (error) {
            console.error("모집 상태 변경 실패:", error);
            alert("모집 상태 변경에 실패했습니다.");
        }
    };

    const handleStudyEnd = async () => {
        if (!id) return;

        if (confirm("스터디를 종료하시겠습니까?")) {
            try {
                console.log("스터디 종료 요청 시작:", id);
                await StudyApiService.updateStudyProjectStatus(
                    parseInt(id, 10),
                    "end"
                );
                setIsStudyEnd(true);
                alert("스터디가 종료되었습니다.");
                navigate("/");
            } catch (error) {
                console.error("스터디 종료 실패:", error);
                if (error instanceof Error) {
                    alert(`스터디 종료에 실패했습니다: ${error.message}`);
                } else {
                    alert("스터디 종료에 실패했습니다.");
                }
            }
        }
    };

    const handleEditStudy = () => {
        if (!isEditing) {
            // 편집 모드 시작
            setEditName(studyName);
            setEditTitle(studyTitle);
            setEditDescription(studyDescription);
            setEditPeriod(studyPeriod);

            // 기존 태그를 올바른 interestId로 초기화
            const initialTags = studyTags.map((tag) => {
                const interest = interests.find((i) => i.interestName === tag);
                return {
                    name: tag,
                    interestId: interest ? interest.interestId : 0,
                };
            });
            setEditTags(initialTags);

            setEditStudyLevel(studyLevel);
            setIsEditing(true);
        }
    };

    const handleSaveStudy = async () => {
        try {
            // 기간을 ISO 형식으로 변환
            const [startDate, endDate] = editPeriod.split(" ~ ");
            const startISO = new Date(startDate).toISOString();
            const endISO = new Date(endDate).toISOString();

            // 태그에서 interestIds 추출
            const interestIds = editTags.map((tag) => tag.interestId);

            console.log("=== 태그 저장 디버깅 ===");
            console.log("editTags:", editTags);
            console.log("interestIds:", interestIds);
            console.log("interests:", interests);

            const updateData = {
                studyProjectName: editName,
                studyProjectTitle: editTitle,
                studyProjectDesc: editDescription,
                studyLevel: editStudyLevel, // 수정된 레벨 사용
                typeCheck: "study", // 스터디 타입
                isRecruiting: isRecruiting ? "recruitment" : "closed",
                studyProjectStart: startISO,
                studyProjectEnd: endISO,
                studyProjectTotal: maxMembers,
                soltStart: new Date().toISOString(), // 기존 시간 유지
                soltEnd: new Date().toISOString(), // 기존 시간 유지
                interestIds: interestIds,
                dayIds: [], // 기존 요일 정보 유지
            };

            console.log("백엔드로 전송할 데이터:", updateData);

            // 백엔드 API 호출
            await StudyApiService.updateStudyProject(
                parseInt(id!, 10),
                updateData
            );

            // 로컬 상태 업데이트
            setStudyName(editName);
            setStudyTitle(editTitle);
            setStudyDescription(editDescription);
            setStudyPeriod(editPeriod);
            setStudyTags(editTags.map((tag) => tag.name));
            setStudyLevel(editStudyLevel);

            setIsEditing(false);
            alert("스터디 정보가 성공적으로 수정되었습니다.");
            window.location.reload();
        } catch (error) {
            console.error("스터디 수정 실패:", error);
            alert("스터디 수정에 실패했습니다.");
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    // 태그 모달 관련 함수들
    const handleOpenTagModal = () => {
        setIsTagModalOpen(true);
        setTagSearchValue("");
        setSelectedCategory(null);
    };

    const handleCloseTagModal = () => {
        setIsTagModalOpen(false);
        setTagSearchValue("");
        setSelectedCategory(null);
    };

    // 가입 신청 관련 함수들
    const handleApplyToStudy = async () => {
        if (!id || !authContext?.user?.nickname) {
            alert("로그인이 필요합니다.");
            return;
        }

        setIsApplying(true);
        try {
            const request = {
                studyProjectId: parseInt(id, 10),
                message: "열심히 참여하겠습니다!",
            };

            await applyToStudyProject(request);

            alert("가입 신청이 완료되었습니다!");
            setIsApplied(true);

            if (userMemberType === "leader") {
                loadApplications();
            }

            window.location.reload();
        } catch (error: any) {
            console.error("가입 신청 실패:", error);

            // 에러 메시지 텍스트를 직접 확인
            if (error.message.includes("이미 해당 스터디의 멤버입니다.")) {
                alert("이미 해당 스터디의 멤버입니다.");
                setUserMemberType("member");
                window.location.reload();
            } else {
                alert("가입 신청에 실패했습니다. 다시 시도해주세요.");
            }
        } finally {
            setIsApplying(false);
        }
    };

    const loadApplications = async () => {
        if (!id || userMemberType !== "leader") return;

        try {
            const studyProjectId = parseInt(id, 10);
            const applicationsData = await getStudyApplications(studyProjectId);
            setApplications(
                applicationsData.filter((app) => app.status === "PENDING")
            );
        } catch (error) {
            console.error("가입 신청 목록 로드 실패:", error);
        }
    };

    // 2. StudyDetailPage.tsx에서 신청 취소 함수 추가
    const handleCancelApplication = async () => {
        if (!id) return;

        if (confirm("가입 신청을 취소하시겠습니까?")) {
            try {
                await cancelStudyApplication(parseInt(id, 10));
                setIsApplied(false);
                // alert("가입 신청이 취소되었습니다.");
                window.location.reload();
            } catch (error: any) {
                console.error("신청 취소 실패:", error);
                // alert(error.message || "신청 취소에 실패했습니다.");
            }
        }
    };

    const handleProcessApplication = async (
        userId: string,
        status: "APPROVED" | "REJECTED",
        reason?: string
    ) => {
        if (!id) return;

        try {
            const request = {
                userId,
                status,
                ...(reason && { reason }),
            };

            await processStudyApplication(parseInt(id, 10), request);

            if (status === "APPROVED") {
                alert("가입 신청이 승인되었습니다.");
            } else {
                alert("가입 신청이 거절되었습니다.");
            }

            // 가입 신청 목록 새로고침
            loadApplications();

            // 승인된 경우 멤버 목록도 새로고침
            if (status === "APPROVED") {
                // 스터디 정보를 다시 불러와서 멤버 목록 업데이트
                const studyProjectId = parseInt(id, 10);
                const studyData = await StudyApiService.getStudyProject(
                    studyProjectId
                );
                if (studyData && studyData.members) {
                    setMembers(studyData.members);
                }
            }

            window.location.reload();
        } catch (error) {
            console.error("가입 신청 처리 실패:", error);
            alert("가입 신청 처리에 실패했습니다.");
        }
    };

    // 사용자의 가입 신청 상태 확인
    const checkUserApplicationStatus = async () => {
        if (
            !id ||
            !authContext?.user?.nickname ||
            userMemberType === "leader" ||
            userMemberType === "member"
        ) {
            console.log("가입 신청 상태 확인 건너뜀:", {
                id,
                nickname: authContext?.user?.nickname,
                userMemberType,
                reason: !id
                    ? "id 없음"
                    : !authContext?.user?.nickname
                    ? "로그인 안됨"
                    : "이미 멤버",
            });
            return;
        }

        try {
            console.log("가입 신청 상태 확인 시작:", {
                studyProjectId: id,
                userId: authContext?.user?.nickname,
            });
            const studyProjectId = parseInt(id, 10);
            const applicationStatus = await getUserApplicationStatus(
                studyProjectId
            );

            if (applicationStatus && applicationStatus.status === "PENDING") {
                setIsApplied(true);
                console.log(
                    "✅ 사용자 가입 신청 상태: 승인 대기 중",
                    applicationStatus
                );
            } else {
                setIsApplied(false);
                console.log(
                    "❌ 사용자 가입 신청 상태: 신청하지 않음 또는 처리됨",
                    applicationStatus
                );
            }
        } catch (error) {
            console.error("❌ 가입 신청 상태 확인 실패:", error);
            // 에러 발생 시 신청하지 않은 상태로 설정
            setIsApplied(false);
        }
    };

    const handleLeaveStudy = async () => {
    if (!id) return;

    if (confirm("스터디를 탈퇴하시겠습니까?")) {
        try {
            // await leaveStudyProject(parseInt(id, 10)); // 탈퇴 API 호출
            alert("스터디에서 탈퇴되었습니다.");
            window.location.reload();
        } catch (error: any) {
            console.error("스터디 탈퇴 실패:", error);
            alert("스터디 탈퇴에 실패했습니다.");
        }
    }
};

    // 태그 데이터 가져오기
    useEffect(() => {
        const fetchInterests = async () => {
            setInterestsLoading(true);
            setInterestsError(null);
            try {
                // 백엔드에서 실제 interests 데이터 가져오기
                const data = await InterestApiService.getInterestsByType(
                    "study"
                );
                setInterests(data);

                // 태그 카테고리도 설정 (UI용)
                const tagCategories = [
                    {
                        id: 1,
                        name: "프로그래밍 언어",
                        tags: [
                            "Python",
                            "JavaScript",
                            "HTML/CSS",
                            "Java",
                            "C#",
                            "Swift",
                            "Kotlin",
                            "C++",
                            "TypeScript",
                            "C",
                            "assembly",
                            "go",
                            "php",
                            "dart",
                            "rust",
                            "Ruby",
                        ],
                    },
                    {
                        id: 2,
                        name: "라이브러리 & 프레임워크",
                        tags: [
                            "React",
                            "Spring Boot",
                            "Spring",
                            "Node.js",
                            "Pandas",
                            "next.js",
                            "flutter",
                            "vue",
                            "flask",
                            "Django",
                            "Unity",
                        ],
                    },
                    {
                        id: 3,
                        name: "데이터베이스",
                        tags: ["SQL", "NOSQL", "DBMS/RDBMS"],
                    },
                    {
                        id: 4,
                        name: "플랫폼/환경",
                        tags: [
                            "iOS",
                            "Android",
                            "AWS",
                            "Docker",
                            "Linux",
                            "cloud",
                            "IoT",
                            "임베디드",
                        ],
                    },
                    {
                        id: 5,
                        name: "AI/데이터",
                        tags: [
                            "인공지능(AI)",
                            "머신러닝",
                            "딥러닝",
                            "빅데이터",
                            "데이터 리터러시",
                            "LLM",
                            "프롬프트 엔지니어링",
                            "ChatGPT",
                            "AI 활용(AX)",
                        ],
                    },
                ];
                setTagCategories(tagCategories);
            } catch (error) {
                console.error("태그 데이터 로드 실패:", error);
                setInterestsError("태그 데이터를 불러오는데 실패했습니다.");
            } finally {
                setInterestsLoading(false);
            }
        };

        fetchInterests();
    }, []);

    // 가입 신청 목록 로드 (리더인 경우)
    useEffect(() => {
        if (userMemberType === "leader" && id) {
            loadApplications();
        }
    }, [userMemberType, id]);

    // 사용자 가입 신청 상태 확인
    useEffect(() => {
        if (id && authContext?.user?.nickname && !isLoading && !isStudyMember) {
            checkUserApplicationStatus();
        } else if (isStudyMember) {
            // 스터디 멤버인 경우 신청 상태를 false로 설정
            setIsApplied(false);
        } else if (!authContext?.user?.nickname) {
            // 로그인하지 않은 경우 신청 상태를 false로 설정
            setIsApplied(false);
        }
    }, [
        id,
        authContext?.user?.nickname,
        isLoading,
        userMemberType,
        isStudyMember,
    ]);

    // 검색어와 카테고리 필터에 따른 태그 필터링
    const getFilteredTags = () => {
        if (
            interestsLoading ||
            interestsError ||
            !tagCategories ||
            tagCategories.length === 0
        ) {
            return [];
        }

        let filtered = tagCategories;

        // 검색어 필터링
        if (tagSearchValue.trim()) {
            filtered = filtered
                .map((category) => ({
                    ...category,
                    tags: category.tags.filter((tag) =>
                        tag.toLowerCase().includes(tagSearchValue.toLowerCase())
                    ),
                }))
                .filter((category) => category.tags.length > 0);
        }

        // 카테고리 필터링
        if (selectedCategory) {
            filtered = filtered.filter(
                (category) => category.id.toString() === selectedCategory
            );
        }

        return filtered;
    };

    const filteredTags = getFilteredTags();

    const handleTagSelect = (tag: string) => {
        if (editTags.some((t) => t.name === tag)) {
            setEditTags(editTags.filter((t) => t.name !== tag));
        } else {
            if (editTags.length < 5) {
                // interests 배열에서 해당 태그의 interestId 찾기
                const interest = interests.find((i) => i.interestName === tag);
                if (interest) {
                    setEditTags([
                        ...editTags,
                        { name: tag, interestId: interest.interestId },
                    ]);
                } else {
                    console.warn(
                        "태그에 해당하는 interest를 찾을 수 없습니다:",
                        tag
                    );
                    alert("태그 정보를 찾을 수 없습니다. 다시 시도해주세요.");
                }
            } else {
                alert("태그는 5개까지만 선택할 수 있습니다!");
            }
        }
    };

    const handleRemoveTag = (tagToRemove: {
        name: string;
        interestId: number;
    }) => {
        setEditTags(editTags.filter((tag) => tag.name !== tagToRemove.name));
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
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) =>
                                        setEditName(e.target.value)
                                    }
                                    className="text-2xl font-bold border-b-2 border-[#8B85E9] focus:outline-none"
                                />
                            ) : (
                                <h3 className="text-2xl font-bold">
                                    {studyName}
                                </h3>
                            )}
                            {/* 리더만 수정/저장/취소 버튼 표시 */}
                            {!isLoading && isStudyLeader && (
                                <div className="flex gap-2">
                                    {isEditing ? (
                                        <>
                                            <button
                                                onClick={handleSaveStudy}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                                저장
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors duration-200 flex items-center gap-2"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                                취소
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={handleEditStudy}
                                            className="px-4 py-2 bg-[#8B85E9] text-white rounded-lg text-sm font-medium hover:bg-[#7C76D8] transition-colors duration-200 flex items-center gap-2"
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                />
                                            </svg>
                                            수정
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="text-gray-700 mb-4">
                            <div className="flex items-center gap-2">
                                <Info className="w-4 h-4 text-gray-600" />
                                <span>스터디 소개</span>
                            </div>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) =>
                                        setEditTitle(e.target.value)
                                    }
                                    className="text-gray-800 block mt-1 border-b-2 border-[#8B85E9] focus:outline-none w-full"
                                />
                            ) : (
                                <span className="text-gray-800 block mt-1">
                                    {studyTitle}
                                </span>
                            )}
                        </div>
                        <div className="text-gray-700 mb-4">
                            <div className="flex items-center gap-2">
                                <Crown className="w-4 h-4 text-gray-600" />
                                <span>리더</span>
                            </div>
                            <span className="text-gray-800 block mt-1">
                                {studyLeader}
                            </span>
                        </div>
                        <div className="text-gray-700 mb-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-600" />
                                <span>스터디 기간</span>
                            </div>
                            {isEditing ? (
                                <div className="flex items-center gap-2 mt-1">
                                    <input
                                        type="date"
                                        value={editPeriod.split(" ~ ")[0] || ""}
                                        onChange={(e) => {
                                            const startDate = e.target.value;
                                            const endDate =
                                                editPeriod.split(" ~ ")[1] ||
                                                "";
                                            setEditPeriod(
                                                `${startDate} ~ ${endDate}`
                                            );
                                        }}
                                        className="text-gray-800 border-b-2 border-[#8B85E9] focus:outline-none"
                                    />
                                    <span className="text-gray-500">~</span>
                                    <input
                                        type="date"
                                        value={editPeriod.split(" ~ ")[1] || ""}
                                        onChange={(e) => {
                                            const startDate =
                                                editPeriod.split(" ~ ")[0] ||
                                                "";
                                            const endDate = e.target.value;
                                            setEditPeriod(
                                                `${startDate} ~ ${endDate}`
                                            );
                                        }}
                                        className="text-gray-800 border-b-2 border-[#8B85E9] focus:outline-none"
                                    />
                                </div>
                            ) : (
                                <span className="text-gray-800 block mt-1">
                                    {formatPeriod(studyPeriod)}
                                </span>
                            )}
                        </div>
                        {/* 스터디 레벨 */}
                        <div className="text-gray-700 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Star className="w-4 h-4 text-gray-600" />
                                <span className="font-medium">스터디 레벨</span>
                            </div>
                            {isEditing ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700 min-w-[80px]">
                                        스터디 레벨:
                                    </span>
                                    <div className="relative">
                                        <button
                                            onClick={() =>
                                                setIsLevelOpen(!isLevelOpen)
                                            }
                                            className={`px-4 py-2 rounded-xl bg-white text-gray-700 flex items-center justify-between border ${
                                                isLevelOpen
                                                    ? "border-2 border-[#8B85E9]"
                                                    : "border-2 border-gray-300"
                                            } focus:outline-none min-w-[120px] h-[40px]`}
                                        >
                                            <span>레벨 {editStudyLevel}</span>
                                            <svg
                                                className={`w-4 h-4 transition-transform ${
                                                    isLevelOpen
                                                        ? "rotate-180"
                                                        : ""
                                                }`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </button>

                                        {isLevelOpen && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-10 overflow-hidden">
                                                {[1, 2, 3].map(
                                                    (level, index) => (
                                                        <div
                                                            key={level}
                                                            onClick={() => {
                                                                setEditStudyLevel(
                                                                    level
                                                                );
                                                                setIsLevelOpen(
                                                                    false
                                                                );
                                                            }}
                                                            className={`px-4 py-2 cursor-pointer transition-colors hover:bg-gray-50 ${
                                                                index !== 2
                                                                    ? "border-b border-gray-100"
                                                                    : ""
                                                            }`}
                                                            style={{
                                                                backgroundColor:
                                                                    editStudyLevel ===
                                                                    level
                                                                        ? "#E8E6FF"
                                                                        : "#FFFFFF",
                                                                color:
                                                                    editStudyLevel ===
                                                                    level
                                                                        ? "#8B85E9"
                                                                        : "#374151",
                                                            }}
                                                        >
                                                            <div className="font-medium">
                                                                레벨 {level}
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <span
                                    className={`px-2 py-0.5 rounded-xl text-xs font-medium ${
                                        studyLevel === 1
                                            ? "bg-green-100 text-green-700"
                                            : studyLevel === 2
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-red-100 text-red-700"
                                    }`}
                                >
                                    스터디 레벨 {studyLevel}
                                </span>
                            )}
                        </div>

                        {/* 태그 */}
                        <div className="text-gray-700 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Tag className="w-4 h-4 text-gray-600" />
                                <span className="font-medium">태그</span>
                            </div>
                            <div className="mt-2 flex gap-2 flex-wrap">
                                {isEditing ? (
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <div className="flex flex-wrap gap-2 items-center">
                                            {/* 선택된 태그들 */}
                                            {editTags.map((tag, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm border-2 bg-[#8B85E9] text-white border-[#8B85E9]"
                                                >
                                                    <span>#{tag.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemoveTag(tag)
                                                        }
                                                        className="ml-1 hover:opacity-70 transition-opacity duration-200"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}

                                            {/* 태그 찾기 버튼 */}
                                            <button
                                                type="button"
                                                onClick={handleOpenTagModal}
                                                className="px-3 py-2 border-2 border-dashed border-[#8B85E9] text-[#8B85E9] rounded-lg hover:bg-[#8B85E9] hover:text-white transition-colors duration-200 flex items-center space-x-2 h-[40px]"
                                            >
                                                <Search className="w-5 h-5" />
                                                <span>태그 찾기</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {studyTags.length > 0 ? (
                                            studyTags.map(
                                                (
                                                    tag: string,
                                                    index: number
                                                ) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-0.5 rounded-xl text-xs bg-gray-100 text-gray-600"
                                                    >
                                                        #{tag}
                                                    </span>
                                                )
                                            )
                                        ) : (
                                            <span className="text-sm text-gray-500">
                                                태그 정보가 없습니다.
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                        <hr className="my-4" />

                        <div className="mb-4">
                            <h4
                                className="font-semibold mb-2"
                                style={{ color: "#8B85E9" }}
                            >
                                스터디 설명
                            </h4>
                            <div
                                className="bg-white border-2 rounded-xl p-4"
                                style={{ borderColor: "#8B85E9" }}
                            >
                                {isEditing ? (
                                    <textarea
                                        value={editDescription}
                                        onChange={(e) =>
                                            setEditDescription(e.target.value)
                                        }
                                        className="text-gray-700 text-sm sm:text-base leading-relaxed w-full h-32 resize-none border-none focus:outline-none"
                                        placeholder="스터디 설명을 입력하세요"
                                    />
                                ) : (
                                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                                        {studyDescription}
                                    </p>
                                )}
                            </div>
                        </div>
                        {/* 버튼 영역 */}
                        {!isEditing &&
                        !isLoading &&
                        isStudyLeader &&
                        !isStudyEnd ? (
                            <div className="flex gap-2 mt-3">
                                {/* 모집 중일 때만 '모집 마감' 버튼 표시 */}
                                {isRecruiting && (
                                    <button
                                        type="button"
                                        onClick={handleRecruitmentToggle}
                                        className="flex-1 px-4 py-2 rounded-lg text-white text-sm sm:text-base cursor-pointer transition-colors duration-200"
                                        style={{ backgroundColor: "#EF4444" }}
                                    >
                                        모집 마감
                                    </button>
                                )}

                                {/* 모집 마감된 경우 재시작 버튼 표시 */}
                                {!isRecruiting && (
                                    <button
                                        type="button"
                                        onClick={handleRecruitmentToggle}
                                        className="flex-1 px-4 py-2 rounded-lg text-white text-sm sm:text-base cursor-pointer transition-colors duration-200"
                                        style={{ backgroundColor: "#10B981" }}
                                    >
                                        모집 재시작
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={handleStudyEnd}
                                    className="flex-1 px-4 py-2 rounded-lg text-white text-sm sm:text-base cursor-pointer transition-colors duration-200"
                                    style={{ backgroundColor: "#6B7280" }}
                                >
                                    스터디 종료
                                </button>
                            </div>
                        ) : !isEditing &&
                          !isLoading &&
                          (userMemberType === "member" ||
                              userMemberType === null) ? (
                            // 일반 사용자이거나 멤버인 경우 (수정 모드가 아닐 때만 표시)
                            <div className="w-full mt-3">
                                {userMemberType === "member" ? (
    <button
        type="button"
        onClick={handleLeaveStudy}
        className="w-full px-4 py-2 rounded-lg text-white text-sm sm:text-base cursor-pointer hover:bg-red-700 transition-colors"
        style={{ backgroundColor: "#DC2626" }}
    >
        스터디 탈퇴
    </button>
) : userMemberType !== "leader" && (
    !isApplied ? (
        <button
            type="button"
            onClick={handleApplyToStudy}
            disabled={isApplying}
            className="w-full px-4 py-2 rounded-lg text-white text-sm sm:text-base cursor-pointer"
            style={{
                backgroundColor: isApplying
                    ? "#6B7280"
                    : "#8B85E9",
            }}
        >
            {isApplying
                ? "신청 중..."
                : "스터디 가입 신청"}
        </button>
    ) : (
        <button
            type="button"
            onClick={handleCancelApplication}
            className="w-full px-4 py-2 rounded-lg text-white text-sm sm:text-base cursor-pointer hover:bg-gray-700 transition-colors"
            style={{ backgroundColor: "#6B7280" }}
        >
            승인 대기 중
        </button>
    )
)}
                            </div>
                        ) : null}
                    </div>
                );
            case "과제 제출":
                // 로그인 및 스터디 멤버 권한 확인
                if (
                    !isLoggedIn ||
                    !currentMember ||
                    !(
                        currentMember.memberType === "leader" ||
                        currentMember.memberType === "member"
                    )
                ) {
                    return (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <p className="text-gray-500 mb-2">
                                    로그인이 필요합니다.
                                </p>
                                <p className="text-sm text-gray-400">
                                    스터디에 가입한 멤버만 접근할 수 있습니다.
                                </p>
                            </div>
                        </div>
                    );
                }
                // ✅ 권한 확인 후, Assignment 컴포넌트에 memberId를 전달합니다.
                return (
                    <Assignment
                        studyProjectId={studyProjectId}
                        memberId={memberId}
                    />
                );

            case "과제 피드백":
                if (
                    !isLoggedIn ||
                    !(
                        userMemberType === "leader" ||
                        userMemberType === "member"
                    )
                ) {
                    return (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <p className="text-gray-500 mb-2">
                                    로그인이 필요합니다.
                                </p>
                                <p className="text-sm text-gray-400">
                                    스터디에 가입한 멤버만 접근할 수 있습니다.
                                </p>
                            </div>
                        </div>
                    );
                }
                return (
                    <FeedBack
                        studyProjectId={parseInt(id!, 10)}
                        currentUserId={
                            currentMember?.userId ||
                            authContext?.user?.nickname ||
                            ""
                        }
                        members={members}
                    />
                );
            case "과제 / 일정 관리":
                if (
                    !isLoggedIn ||
                    !(
                        userMemberType === "leader" ||
                        userMemberType === "member"
                    )
                ) {
                    return (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <p className="text-gray-500 mb-2">
                                    로그인이 필요합니다.
                                </p>
                                <p className="text-sm text-gray-400">
                                    스터디에 가입한 멤버만 접근할 수 있습니다.
                                </p>
                            </div>
                        </div>
                    );
                }
                return (
                    <Schedule
                        isStudyLeader={isStudyLeader}
                        studyProjectId={parseInt(id!, 10)}
                        userId={authContext?.user?.nickname || ""}
                        memberId={0} // TODO: 실제 멤버 ID로 변경 필요
                    />
                );
            case "커리큘럼":
                return (
                    <Curriculum
                        curriculumText={curriculumText}
                        isStudyLeader={isStudyLeader}
                        studyProjectId={parseInt(id!, 10)}
                        onCurriculumUpdate={handleCurriculumUpdate} // 업데이트 함수도 전달
                    />
                );
            case "커뮤니티":
                if (
                    !isLoggedIn ||
                    !(userMemberType === "leader" || userMemberType === "member")
                ) {
                    return (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <p className="text-gray-500 mb-2">
                                    로그인이 필요합니다.
                                </p>
                                <p className="text-sm text-gray-400">
                                    스터디에 가입한 멤버만 접근할 수 있습니다.
                                </p>
                            </div>
                        </div>
                    );
                }

                // ✅ members 콘솔에 찍기
                console.log("Community로 전달되는 members:", members);

                return (
                    <Community
                        studyProjectId={parseInt(id!, 10)}
                        currentUserId={authContext?.user?.nickname || "나"}
                        members={members} // 이미 타입 정의가 되어 있어야 함
                    />
                );
        }
    };

    const handleCurriculumUpdate = (newText: string) => {
        setCurriculumText(newText);
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
                        isStudyMember={
                            !isLoading &&
                            (userMemberType === "leader" ||
                                userMemberType === "member")
                        }
                        isProject={false}
                        isStudyLeader={isStudyLeader}
                        userMemberType={userMemberType}
                        maxMembers={maxMembers}
                        members={members}
                        applications={applications}
                        onProcessApplication={handleProcessApplication}
                        studyProjectId={parseInt(id!, 10)} // 추가
                        onApplyToStudy={handleApplyToStudy} // 추가
                    />
                </ResponsiveSidebar>

                {/* 메인 콘텐츠 */}
                <ResponsiveMainContent padding="md">
                    {renderMainContent()}
                </ResponsiveMainContent>
            </ResponsiveContainer>
            <DraggableChatWidget studyProjectId={parseInt(id!, 10)} />

            {/* 태그 모달 */}
            {isTagModalOpen && (
                <div
                    className="fixed inset-0 bg-[rgba(0,0,0,0.1)] flex items-center justify-center z-50"
                    onClick={handleCloseTagModal}
                >
                    <div
                        className="bg-white rounded-lg p-4 w-full max-w-4xl mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-center items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                                태그 찾기
                            </h3>
                            <span className="ml-2 text-sm text-gray-500">
                                ({editTags.length}/5)
                            </span>
                        </div>

                        {/* 검색창 */}
                        <div className="mb-4">
                            <input
                                type="text"
                                value={tagSearchValue}
                                onChange={(e) =>
                                    setTagSearchValue(e.target.value)
                                }
                                placeholder="태그를 검색해주세요."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9]"
                                autoFocus
                            />
                        </div>

                        {/* 카테고리 필터 버튼들 */}
                        <div className="mb-4">
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => setSelectedCategory(null)}
                                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors duration-200 whitespace-nowrap ${
                                        selectedCategory === null
                                            ? "bg-[#8B85E9] text-white border-[#8B85E9]"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                    }`}
                                >
                                    전체
                                </button>
                                {tagCategories.map((category) => (
                                    <button
                                        key={category.id}
                                        type="button"
                                        onClick={() =>
                                            setSelectedCategory(
                                                category.id.toString()
                                            )
                                        }
                                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors duration-200 whitespace-nowrap ${
                                            selectedCategory ===
                                            category.id.toString()
                                                ? "bg-[#8B85E9] text-white border-[#8B85E9]"
                                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                        }`}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 태그 목록 */}
                        <div
                            className="max-h-60 overflow-y-auto pr-2"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* 로딩 상태 */}
                            {interestsLoading && (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B85E9]"></div>
                                    <span className="ml-2 text-gray-600">
                                        태그 데이터를 불러오는 중...
                                    </span>
                                </div>
                            )}

                            {/* 에러 상태 */}
                            {interestsError && (
                                <div className="flex items-center justify-center py-8">
                                    <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
                                    <span className="text-red-600">
                                        태그 데이터 로드 실패: {interestsError}
                                    </span>
                                </div>
                            )}

                            {/* 태그 목록 */}
                            {!interestsLoading &&
                            !interestsError &&
                            filteredTags.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredTags.map((category) => (
                                        <div
                                            key={category.id}
                                            className="border-b border-gray-200 pb-3 last:border-b-0"
                                        >
                                            <h4 className="font-semibold text-gray-800 mb-2 text-sm">
                                                {category.name}
                                            </h4>
                                            <div className="grid grid-cols-3 gap-2">
                                                {category.tags.map((tag) => {
                                                    const isSelected =
                                                        editTags.some(
                                                            (t) =>
                                                                t.name === tag
                                                        );

                                                    return (
                                                        <button
                                                            key={tag}
                                                            onClick={() =>
                                                                handleTagSelect(
                                                                    tag
                                                                )
                                                            }
                                                            className={`p-2 text-center rounded-lg border transition-colors duration-200 text-xs select-none ${
                                                                isSelected
                                                                    ? "bg-[#8B85E9] text-white border-[#8B85E9] cursor-pointer hover:opacity-80"
                                                                    : editTags.length >=
                                                                      5
                                                                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                                                    : "bg-white text-gray-700 border-gray-300 hover:bg-[#8B85E9] hover:text-white hover:border-[#8B85E9] cursor-pointer"
                                                            }`}
                                                        >
                                                            #{tag}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : !interestsLoading && !interestsError ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    <p>검색 결과가 없습니다.</p>
                                </div>
                            ) : null}
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleCloseTagModal}
                                className="px-4 py-2 bg-[#8B85E9] text-white rounded-lg hover:bg-[#7A74D8] transition-colors duration-200"
                            >
                                완료
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PageLayout>
    );
};

export default StudyDetailPage;
