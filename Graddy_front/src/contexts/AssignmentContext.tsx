import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toKoreanLocaleString } from '../utils/timeUtils';

export interface AssignmentSubmission {
    id: string;
    assignmentName: string;
    content: string;
    submittedAt: string;
    submittedBy: string;
    status: 'submitted' | 'reviewed';
    attachment?: {
        fileName: string;
        fileSize: string;
        fileType: string;
    };
}

interface AssignmentContextType {
    submissions: AssignmentSubmission[];
    submitAssignment: (assignmentName: string, content: string, submittedBy: string, attachment?: { fileName: string; fileSize: string; fileType: string }) => void;
    getSubmissionByAssignment: (assignmentName: string) => AssignmentSubmission | undefined;
}

const AssignmentContext = createContext<AssignmentContextType | undefined>(undefined);

export const useAssignmentContext = () => {
    const context = useContext(AssignmentContext);
    if (!context) {
        throw new Error('useAssignmentContext must be used within an AssignmentProvider');
    }
    return context;
};

interface AssignmentProviderProps {
    children: ReactNode;
}

export const AssignmentProvider: React.FC<AssignmentProviderProps> = ({ children }) => {
    const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);

    const submitAssignment = (assignmentName: string, content: string, submittedBy: string, attachment?: { fileName: string; fileSize: string; fileType: string }) => {
        const newSubmission: AssignmentSubmission = {
            id: Date.now().toString(),
            assignmentName,
            content,
            submittedAt: toKoreanLocaleString(),
            submittedBy,
            status: 'submitted',
            attachment
        };

        setSubmissions(prev => [...prev, newSubmission]);
    };

    const getSubmissionByAssignment = (assignmentName: string) => {
        return submissions.find(submission => submission.assignmentName === assignmentName);
    };

    const value: AssignmentContextType = {
        submissions,
        submitAssignment,
        getSubmissionByAssignment
    };

    return (
        <AssignmentContext.Provider value={value}>
            {children}
        </AssignmentContext.Provider>
    );
};
