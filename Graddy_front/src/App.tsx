import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import "./App.css";
import ErrorFallback from "./pages/error/ErrorFallback";
import LoadingOverlay from "./components/shared/LoadingOverlay";
import DeleteModal from "./components/modal/DeleteModal";
import MainPage from "./pages/mainPage";
import { TestModal } from "./pages/TestModal";
import { TestDropdown } from "./pages/TestDropdown,";
import { TestAutoCompleteSearch } from "./pages/TestAutoComplete";

function App() {
    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense fallback={<LoadingOverlay />}>
                <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/delete" element={<DeleteModal />} />
                    <Route path="/modal" element={<TestModal />} />
                    <Route path="/dropdown" element={<TestDropdown />} />
                    <Route path="/autocomplete" element={<TestAutoCompleteSearch />} />
                </Routes>
            </Suspense>
        </ErrorBoundary>
    );
}

export default App;
