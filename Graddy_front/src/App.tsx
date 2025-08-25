// src/App.tsx

import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import "./App.css";
import ErrorFallback from "./pages/error/ErrorFallback";
import LoadingOverlay from "./components/shared/LoadingOverlay";
import DeleteModal from "./components/modal/DeleteModal";
import { MyPage } from "./pages/MyPage";
import { TestModal } from "./pages/TestModal";
import { TestDropdown } from "./pages/TestDropdown";
import { TestAutoCompleteSearch } from "./pages/TestAutoComplete";
import Join from "./pages/Join";
import Join2 from "./pages/Join2";
import Login from "./pages/Login";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { StudySearchPage } from "./pages/StudySearchPage";
import { AuthProvider } from "./contexts/AuthContext"; // AuthProvider import
import { AssignmentProvider } from "./contexts/AssignmentContext"; // AssignmentProvider import
import MainPage from "./pages/MainPage";
import StudyDetailPage from "./pages/StudyDetailPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import StudyCreate from "./pages/StudyCreate";
import Join3 from "./pages/Join3";
import FindAccount from "./pages/FindAccount";
import { Ranking } from "./pages/Ranking";
import { CommunityPage } from "./pages/CommunityPage";
import ApiTestComponent from "./components/examples/ApiTestComponent";
import CommunityCreate from "./pages/CommunityCreate";

function App() {
    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <AuthProvider>
                <AssignmentProvider>
                    <div className="min-h-screen flex flex-col">
                    <Header />
                    <main className="flex-1">
                        <Suspense fallback={<LoadingOverlay />}>
                            <Routes>
                                <Route path="/" element={<MainPage />} />
                                <Route path="/mypage" element={<MyPage />} />
                                <Route
                                    path="/delete"
                                    element={<DeleteModal />}
                                />
                                <Route path="/modal" element={<TestModal />} />
                                <Route
                                    path="/dropdown"
                                    element={<TestDropdown />}
                                />
                                <Route
                                    path="/autocomplete"
                                    element={<TestAutoCompleteSearch />}
                                />
                                <Route path="/join" element={<Join />} />
                                <Route path="/join2" element={<Join2 />} />
                                <Route path="/join3" element={<Join3 />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/findAcc" element={<FindAccount />} />
                                <Route path="/ranking" element={<Ranking />} />
                                <Route path="/community" element={<CommunityPage />} />
                                <Route path="/community/create" element={<CommunityCreate />} />
                                <Route
                                    path="/search"
                                    element={<StudySearchPage />}
                                />
                                <Route path="/api-test" element={<ApiTestComponent />} />
                                <Route
                                    path="/study/create"
                                    element={<StudyCreate />}
                                />
                                <Route path="/study/:id"
                                element={<StudyDetailPage/>}/>
                                <Route path="/project/:id"
                                element={<ProjectDetailPage/>}/>
                            </Routes>
                        </Suspense>
                    </main>
                    <Footer />
                </div>
                </AssignmentProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;
