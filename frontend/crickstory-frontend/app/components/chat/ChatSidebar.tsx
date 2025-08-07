import SearchComponent from "../SearchComponent";
import ChatRoomList from "./ChatRoomList";

export default function ChatSidebar() {
    return (
        <div>
            {/* <SearchComponent /> */}
            <header className="sticky top-0 bg-white z-10 py-[18px]  text-lg font-semibold shadow-sm"
                style={{ boxShadow: " rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px" }}
            >
                Chat
            </header>
            <ChatRoomList />
        </div>
    )
}