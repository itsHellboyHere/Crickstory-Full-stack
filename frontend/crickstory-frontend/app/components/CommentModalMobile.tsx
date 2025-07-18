'use client';
import React, { useEffect, useRef } from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    useDisclosure
} from '@heroui/react';
import CommentList from './CommentList';
import AddCommentInput from './AddCommentInput';

export default function CommentModalMobile({ postId }: { postId: number }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const onCloseRef = useRef<() => void>(() => { });

    // ✅ Auto-close modal on resize to md+
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768 && isOpen) {
                onCloseRef.current?.();
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isOpen]);

    return (
        <>  <div className='flex items-center justify-center'>
            <button
                onClick={onOpen}
                className="button-comment"
            >
                <span className="button-content">View all Comments </span>
            </button>
        </div>

            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                backdrop="blur"
                className="!max-w-full !max-h-screen rounded-none"
                size="full"
                placement="auto"

                motionProps={{
                    variants: {
                        enter: {
                            y: 0,
                            opacity: 1,
                            transition: { duration: 0.1, ease: 'easeOut' },
                        },
                        exit: {
                            y: 20,
                            opacity: 0,
                            transition: { duration: 0.2, ease: 'easeIn' },
                        },
                    },
                }}
            >
                <ModalContent className="h-screen bg-white  rounded-none  shadow-sm">
                    {(onClose) => {
                        onCloseRef.current = onClose;
                        // console.log(onCloseRef.current)
                        return (
                            <>
                                <ModalHeader className="sticky top-0 z-10 bg-white border-b flex justify-between items-center p-4">
                                    <span className="font-semibold text-lg">Comments</span>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-500 hover:text-gray-700 transition-colors text-xl"
                                    >
                                        ✕
                                    </button>
                                </ModalHeader>

                                <ModalBody className="backdrop-blur-xl flex flex-col  h-full overflow-hidden px-2 ">
                                    {/* <div className="flex-1 px-4 scrollbar-hide"> */}
                                    <CommentList postId={postId} />
                                    {/* </div> */}
                                    <div className="sticky bottom-0  bg-white p-3">
                                        <AddCommentInput postId={postId} />
                                    </div>
                                </ModalBody >
                            </>
                        );
                    }}
                </ModalContent>
            </Modal >
        </>
    );
}
