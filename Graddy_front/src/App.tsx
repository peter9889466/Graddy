import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import "./App.css";
import ErrorFallback from "./pages/error/ErrorFallback";
import LoadingOverlay from "./components/shared/LoadingOverlay";
import DeleteModal from "./components/modal/DeleteModal";
import MainPage from "./pages/MainPage";
import { MyPage } from "./pages/MyPage";
import { TestModal } from "./pages/TestModal";
import { TestDropdown } from "./pages/TestDropdown,";
import { TestAutoCompleteSearch } from "./pages/TestAutoComplete";
import Join from "./pages/Join";
import Join2 from "./pages/Join2";
import Login from "./pages/Login";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { StudySearchPage } from "./pages/StudySearchPage";

function App() {
    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                    <Suspense fallback={<LoadingOverlay />}>
                        <Routes>
                            <Route path="/" element={<MainPage />} />
                            <Route path="/mypage" element={<MyPage />} />
                            <Route path="/delete" element={<DeleteModal />} />
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
                            <Route path="/login" element={<Login />} />
                            <Route
                                path="/search"
                                element={<StudySearchPage />}
                            />
                        </Routes>
                    </Suspense>
                </main>
                <Footer />
            </div>
        </ErrorBoundary>
    );
}

export default App;
