'use client';

import { useState, useEffect } from "react";
import axios from "@/app/utils/axios";
import useChatSocket from "@/app/hooks/useChatSocket";

export default function MessageInput({ roomId }: { roomId: number }) {
    const [text, setText] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [previewURL, setPreviewURL] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { sendMessage } = useChatSocket(roomId);

    //  Create image preview URL when file changes
    useEffect(() => {
        if (file && file.type.startsWith("image/")) {
            const objectUrl = URL.createObjectURL(file);
            setPreviewURL(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setPreviewURL(null);
        }
    }, [file]);

    const handleSendText = () => {
        const trimmed = text.trim();
        if (!trimmed || loading) return;

        sendMessage({ message: trimmed, message_type: "text" });
        setText("");
    };

    const uploadFile = async () => {
        if (!file || loading) return;

        const form = new FormData();
        form.append("file", file);
        form.append("room_id", String(roomId));

        try {
            setLoading(true);
            const res = await axios.post("/api/chat/upload/", form);
            sendMessage({
                message: "",
                message_type: res.data.message_type,
                file_url: res.data.file_url,
            });
            setFile(null);
            setPreviewURL(null);
        } catch (err) {
            console.error("File upload failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = () => {
        if (file) uploadFile();
        else handleSendText();
    };

    return (
        <div className="flex flex-col gap-2 p-3 border-t bg-white w-full items-center">
            {file && (
                <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-100 w-full max-w-xl relative">
                    {previewURL ? (
                        <img
                            src={previewURL}
                            alt="Preview"
                            className="w-14 h-14 rounded-lg object-cover border"
                        />
                    ) : (
                        <div className="w-14 h-14 flex items-center justify-center bg-gray-300 rounded-lg text-gray-600 text-sm">
                            📎
                        </div>
                    )}
                    <div className="flex-1 text-sm truncate">
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </div>
                    <button
                        className="text-red-500 text-sm"
                        onClick={() => {
                            setFile(null);
                            setPreviewURL(null);
                        }}
                        disabled={loading}
                    >
                        ❌
                    </button>
                </div>
            )}

            <div className="flex gap-2 w-full max-w-xl items-center">
                <input
                    type="text"
                    className="flex-1 border px-3 py-2 rounded-2xl outline-none"
                    placeholder="Type a message"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={loading}
                />

                <label className="px-3 py-2 bg-gray-200 text-sm rounded-2xl cursor-pointer">
                    📎
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                </label>

                <button
                    onClick={handleSend}
                    className={`px-4 py-2 rounded-2xl text-white ${loading ? "bg-gray-400" : "bg-blue-500"}`}
                    disabled={loading}
                >
                    {loading ? "Sending..." : "Send"}
                </button>
            </div>
        </div>
    );
}
