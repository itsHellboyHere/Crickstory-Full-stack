'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from '@/app/utils/axios'
import { useAuth } from '@/app/context/AuthContext'
import { ViewedProfileProvider, useViewedProfile } from '@/app/context/ViewedProfileContext'

import ProfileHeader from '@/app/components/ProfileHeader'
import TabbedPostSection from '@/app/components/TabbedPostSection'
import ProfilePostSkeleton from '@/app/components/ProfilePostSkeleton'
import styles from '../../../css/Postprofile.module.css'

function ProfilePageContent() {
  const { username } = useParams()
  const { user: currentUser } = useAuth()
  const { profile, setProfile } = useViewedProfile()

  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState([])
  const [postNextUrl, setPostNextUrl] = useState<string | null>(null)
  const [savedPosts, setSavedPosts] = useState([])
  const [savedNextUrl, setSavedNextUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true)

        const res = await axios.get(`/api/user/profiles/${username}/`)
        const data = res.data
        setProfile(data)

        const isMe = data.is_me
        const isFollowing = data.is_following
        const isPrivate = data.is_private

        if (!isPrivate || isMe || isFollowing) {
          const postRes = await axios.get(`/api/posts/user/${username}/`)
          setPosts(postRes.data.results)
          setPostNextUrl(postRes.data.next)
        }

        if (isMe) {
          const savedRes = await axios.get(`/api/posts/saved-posts/`)
          setSavedPosts(savedRes.data.results)
          setSavedNextUrl(savedRes.data.next)
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err)
      } finally {
        setLoading(false)
      }
    }

    if (username) fetchAll()
  }, [username, setProfile])

  const isMe = profile?.is_me
  const isPrivate = profile?.is_private
  const isFollowing = profile?.is_following
  const canViewPosts = !isPrivate || isMe || isFollowing

  return (
    <main className={styles.container}>
      <ProfileHeader loading={loading} />
      {loading ? (
        <ProfilePostSkeleton count={6} />
      ) : canViewPosts ? (
        <TabbedPostSection
          initialPosts={posts}
          postNextUrl={postNextUrl}
          initialSavedPosts={savedPosts}
          savedNextUrl={savedNextUrl}
          isCurrentUser={!!isMe}
          geistSansClass="font-sans"
        />
      ) : (
        <div className="text-center mt-10 text-gray-500">
          This account is <strong>Private</strong>
          {profile?.has_requested && <p className="mt-2 text-sm">Follow request sent</p>}
        </div>
      )}
    </main>
  )
}

export default function ProfilePageWrapper() {
  return (
    <ViewedProfileProvider>
      <ProfilePageContent />
    </ViewedProfileProvider>
  )
}
