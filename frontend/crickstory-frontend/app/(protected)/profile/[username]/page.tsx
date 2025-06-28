'use client';

import ProfileHeader from '@/app/components/ProfileHeader';
import styles from '../../../css/Postprofile.module.css';
import { useAuth } from '@/app/context/AuthContext';
import { useEffect, useState } from 'react';
import { Post, PostsResponse } from '@/types/next-auth';
import { useParams } from 'next/navigation';
import axios from '@/app/utils/axios';
import ProfilePostSkeleton from '@/app/components/ProfilePostSkeleton';
import TabbedPostSection from '@/app/components/TabbedPostSection'; // ✅ Make sure it's imported

export default function ProfilePage() {
  const { username } = useParams();
  const { user } = useAuth();
  const isCurrentUser = user?.username === username;

  const [posts, setPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [postNextUrl, setPostNextUrl] = useState<string | null>(null);
  const [savedNextUrl, setSavedNextUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);

        const userPostsPromise = axios.get<PostsResponse>(
          `/api/posts/user/${username}/`
        );
        const savedPostsPromise = isCurrentUser
          ? axios.get<PostsResponse>('/api/posts/saved-posts/')
          : null;

        const [userPostsRes, savedPostsRes] = await Promise.all([
          userPostsPromise,
          savedPostsPromise,
        ]);

        // ✅ Posts
        setPosts(userPostsRes.data.results);
        setPostNextUrl(userPostsRes.data.next);

        // ✅ Saved Posts (if current user)
        if (isCurrentUser && savedPostsRes) {
          setSavedPosts(savedPostsRes.data.results);
          setSavedNextUrl(savedPostsRes.data.next);
        }
      } catch (error) {
        console.error('Error fetching profile data', error);
      } finally {
        setLoading(false);
      }
    }

    if (username) {
      fetchPosts();
    }
  }, [username, isCurrentUser]);

  return (
    <main className={styles.container}>
      <ProfileHeader />
      <div className="">
        {loading ? (
          <ProfilePostSkeleton count={6} />
        ) : (
          <TabbedPostSection
            initialPosts={posts}
            initialSavedPosts={savedPosts}
            postNextUrl={postNextUrl}
            savedNextUrl={savedNextUrl}
            isCurrentUser={isCurrentUser}
            geistSansClass="font-sans"
          />
        )}
      </div>
    </main>
  );
}
