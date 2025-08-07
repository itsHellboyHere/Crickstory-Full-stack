import ChatHeader from "@/app/components/chat/ChatHeader";
import MessageInput from "@/app/components/chat/MessageInput";
import MessageList from "@/app/components/chat/MessageList";


export default async function ChatRoomPage(props: { params: Promise<{ roomId: number }> }) {
    const { roomId } = await props.params

    return (
        <div className="flex flex-col h-[92vh] md:h-[100vh]">
            <ChatHeader roomId={roomId} />
            <MessageList roomId={roomId} />
            <MessageInput roomId={roomId} />
        </div>
    )
}