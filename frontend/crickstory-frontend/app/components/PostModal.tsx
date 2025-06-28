'use client'
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrashIcon } from "@heroicons/react/24/outline";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";

export default function PostModal({ postId }: { postId: number }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
    const router = useRouter();
    // const deletePostWithId = deletePost.bind(null, postId);


    return (
        <div>
            <div className="flex items-center gap-6">
                <button className="p-1 hover:bg-gray-100 rounded-full" onClick={() => setIsOpen(true)}>
                    {/* <span className="sr-only">Post Options</span> */}
                    <EllipsisHorizontalIcon className="h-5 w-5" />
                </button>
            </div>

            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Post Options</h2>

                        <div className="space-y-3">
                            {/* Edit Option */}
                            <Link
                                href={`/posts/${postId}/edit`}
                                className="block w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                Edit Post
                            </Link>
                            {!isDeleteConfirm ? (
                                <button
                                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                    onClick={() => setIsDeleteConfirm(true)}
                                >
                                    <TrashIcon className="h-5 w-5" />
                                    <span>Delete</span>
                                </button>) : (
                                <div className="p-4 bg-red-50 rounded-lg">
                                    <p className="text-red-700 mb-4">Are you sure you want to delete this post?</p>
                                    <div className="flex justify-end gap-2">
                                        <form action={deletePostWithId} className="flex items-center gap-2 text-red-500 hover:text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
                                            <button
                                                type="submit"
                                                onClick={() => setIsDeleteConfirm(true)}

                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </form>
                                        <button
                                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                                            onClick={() => {
                                                setIsDeleteConfirm(false);
                                                // setIsOpen(false);
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )
                            }
                            {/* //                   <form action={deletePostWithId} className="flex items-center gap-2 text-red-500 hover:text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
            //   <button type="submit">
            //     <TrashIcon className="h-5 w-5" />
            //     <span>Delete</span>
            //   </button>
            // </form> */}

                        </div>

                        <button
                            onClick={() => {
                                setIsOpen(false);
                                setIsDeleteConfirm(false);
                            }}
                            className="mt-4 w-full bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}