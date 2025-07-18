'use client';
import AddCommentInput from './AddCommentInput';
import CommentList from './CommentList';

export default function CommentSection({ postId }: { postId: number }) {
    return (
        <div className="flex flex-col h-full">
            {/* Scrollable comments */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <CommentList postId={postId} />
            </div>


            {/* Fixed input at bottom */}
            <div className="pt-2">
                <AddCommentInput postId={postId} />
            </div>
        </div>
    );
}
