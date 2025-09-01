import React, { useState } from "react";
import Comments from "./Comments";

interface CommentsSectionProps {
    postId: number;
    postType: "free" | "study" | "assignment";
    initialExpanded?: boolean;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({
    postId,
    postType,
    initialExpanded = false,
}) => {
    const [isExpanded, setIsExpanded] = useState(initialExpanded);

    const handleToggle = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            <Comments
                postId={postId}
                postType={postType}
                isExpanded={isExpanded}
                onToggle={handleToggle}
            />
        </div>
    );
};

export default CommentsSection;
