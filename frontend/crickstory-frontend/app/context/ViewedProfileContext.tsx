'use client'

import { createContext, useContext, useState } from "react"


type ViewedProfile = {
    username: string
    image?: string
    name?: string
    bio?: string
    is_private: boolean
    is_following: boolean
    has_requested: boolean
    is_me: boolean
}

type ContextType = {
    profile: ViewedProfile | null
    setProfile: (p: ViewedProfile | null) => void
    updateProfile: (partial: Partial<ViewedProfile>) => void
}

const ViewedProfileContext = createContext<ContextType | undefined>(undefined)

export const ViewedProfileProvider = ({ children }: { children: React.ReactNode }) => {
    const [profile, setProfile] = useState<ViewedProfile | null>(null)

    const updateProfile = (partial: Partial<ViewedProfile>) => {
        if (!profile) return;
        setProfile({ ...profile, ...partial })
    }
    return (
        <ViewedProfileContext.Provider value={{ profile, setProfile, updateProfile }}>
            {children}
        </ViewedProfileContext.Provider>
    )
}
export const useViewedProfile = () => {
    const context = useContext(ViewedProfileContext)
    if (!context) throw new Error('useViewedProfile must be used within ViewedProfileProvider')
    return context
}