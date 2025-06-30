import AvatarUpload from "@/app/components/AvatarUpload";
import ProfileInfoForm from "@/app/components/ProfileInfoForm";

export default async function ProfileSettingsPage() {
    return (
        <main className="max-w-2xl mx-auto  px-4 sm:px-4">
            <h1 className="text-3xl font-bold text-gray-600 dark:text-white mb-6">
                Profile Settings
            </h1>
            <div className="space-y-8">

                <AvatarUpload />
                <div className="text-gray-500  text-sm mb-4">
                    Update your profile information below.
                </div>
                <ProfileInfoForm />

            </div>
        </main>
    )
} 