import { useStartConversation } from '@/app/hooks/useStartRoom';
import { useRouter } from 'next/navigation';
import { useViewedProfile } from '@/app/context/ViewedProfileContext';
import toast from 'react-hot-toast';
export default function MessageButton() {
    const { profile } = useViewedProfile();
    const router = useRouter();
    const { mutate: startConversation, isPending } = useStartConversation();

    const handleMessage = () => {
        if (!profile) return;
        console.log("profile ", profile)
        startConversation(profile.user_id, {
            onSuccess: (data) => {
                if (data.id) {
                    router.push(`/chat/${data.id}`);
                } else if (data.message_request) {
                    toast.success('Message request sent');
                }
            },
            onError: (err: any) => {
                toast.error('Failed to start conversation', err);
            },
        });
    };

    return (
        <button
            onClick={handleMessage}
            disabled={isPending}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-400"
        >
            {isPending ? 'Messaging...' : 'Message'}
        </button>
    );
}
