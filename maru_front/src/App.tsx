import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import "./App.css";
import ErrorFallback from "./pages/error/ErrorFallback";
import LoadingOverlay from "./components/shared/LoadingOverlay";
import { MainPage } from "./pages/MainPage";

function App() {
    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense fallback={<LoadingOverlay />}>
                <Routes>
                    <Route path="/" element={<MainPage />} />
                </Routes>
            </Suspense>
        </ErrorBoundary>
    );
}

export default App;
