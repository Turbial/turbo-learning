import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usePageTitle } from '../hooks/usePageTitle'
import { useAuth } from '../data/useAuth'
import { useToast } from '../contexts/ToastContext'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { Avatar } from '../components/ui/Avatar'

// ---- Types ----

type Category = 'all' | 'questions' | 'tips' | 'showcase' | 'general'

interface Post {
  id: string
  user_id: string
  title: string
  body: string
  category: string
  likes: number
  reply_count: number
  created_at: string
  profiles: { name: string }
}

interface Reply {
  id: string
  user_id: string
  post_id: string
  body: string
  created_at: string
  profiles: { name: string }
}

// ---- Helpers ----

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return mins + 'm ago'
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return hrs + 'h ago'
  return Math.floor(hrs / 24) + 'd ago'
}

const CATEGORY_TABS: { key: Category; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'questions', label: 'Questions ❓' },
  { key: 'tips', label: 'Tips 💡' },
  { key: 'showcase', label: 'Showcase 🎉' },
  { key: 'general', label: 'General 💬' },
]

const CATEGORY_BADGE: Record<string, string> = {
  questions: 'bg-blue-100 text-blue-700',
  tips: 'bg-yellow-100 text-yellow-700',
  showcase: 'bg-purple-100 text-purple-700',
  general: 'bg-gray-100 text-gray-600',
}

// ---- Main Component ----

export default function Community() {
  usePageTitle('Community')

  const { user } = useAuth()
  const toast = useToast()
  const queryClient = useQueryClient()

  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // New post form state
  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')
  const [newCategory, setNewCategory] = useState<string>('general')

  // Reply form state
  const [replyBody, setReplyBody] = useState('')

  // ---- Queries ----

  const { data: posts, isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ['community_posts', activeCategory],
    queryFn: async () => {
      let q = supabase
        .from('community_posts')
        .select('*, profiles!inner(name)')
        .order('created_at', { ascending: false })

      if (activeCategory !== 'all') {
        q = q.eq('category', activeCategory)
      }

      const { data, error } = await q
      if (error) throw error
      return data as Post[]
    },
  })

  const { data: replies, isLoading: repliesLoading } = useQuery<Reply[]>({
    queryKey: ['community_replies', selectedPost?.id],
    enabled: !!selectedPost,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_replies')
        .select('*, profiles!inner(name)')
        .eq('post_id', selectedPost!.id)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as Reply[]
    },
  })

  // ---- Mutations ----

  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not logged in')
      const { error } = await supabase.from('community_posts').insert({
        user_id: user.id,
        title: newTitle.trim(),
        body: newBody.trim(),
        category: newCategory,
        likes: 0,
        reply_count: 0,
      })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Post created!')
      setNewTitle('')
      setNewBody('')
      setNewCategory('general')
      setShowCreateForm(false)
      queryClient.invalidateQueries({ queryKey: ['community_posts'] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create post')
    },
  })

  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.rpc('increment_post_likes', { post_id: postId })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community_posts'] })
      if (selectedPost) {
        queryClient.invalidateQueries({ queryKey: ['community_replies', selectedPost.id] })
        setSelectedPost(prev =>
          prev ? { ...prev, likes: prev.likes + 1 } : prev
        )
      }
    },
    onError: () => {
      toast.error('Failed to like post')
    },
  })

  const createReplyMutation = useMutation({
    mutationFn: async () => {
      if (!user || !selectedPost) throw new Error('Not logged in')
      const { error } = await supabase.from('community_replies').insert({
        user_id: user.id,
        post_id: selectedPost.id,
        body: replyBody.trim(),
      })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Reply posted!')
      setReplyBody('')
      queryClient.invalidateQueries({ queryKey: ['community_replies', selectedPost?.id] })
      queryClient.invalidateQueries({ queryKey: ['community_posts'] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to post reply')
    },
  })

  // ---- Render: Detail view ----

  if (selectedPost) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedPost(null)}
            className="border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium"
          >
            ← Back
          </button>
          <h1 className="font-bold text-gray-900 text-lg truncate">{selectedPost.title}</h1>
        </div>

        <Card>
          <div className="flex items-start gap-3 mb-4">
            <Avatar name={selectedPost.profiles?.name} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900 text-sm">{selectedPost.profiles?.name ?? 'Unknown'}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_BADGE[selectedPost.category] ?? 'bg-gray-100 text-gray-600'}`}>
                  {selectedPost.category}
                </span>
                <span className="text-xs text-gray-400">{timeAgo(selectedPost.created_at)}</span>
              </div>
              <h2 className="font-bold text-gray-900 mt-1">{selectedPost.title}</h2>
            </div>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedPost.body}</p>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => likePostMutation.mutate(selectedPost.id)}
              disabled={likePostMutation.isPending}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              <span>❤️</span>
              <span>{selectedPost.likes}</span>
            </button>
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              <span>💬</span>
              <span>{selectedPost.reply_count}</span>
            </span>
          </div>
        </Card>

        <div>
          <h2 className="font-bold text-gray-900 mb-4">Replies</h2>

          {repliesLoading && <Skeleton lines={3} />}

          {!repliesLoading && replies?.length === 0 && (
            <EmptyState
              icon="💬"
              title="No replies yet"
              description="Be the first to reply!"
            />
          )}

          {replies?.map(reply => (
            <Card key={reply.id} className="mb-3">
              <div className="flex items-start gap-3">
                <Avatar name={reply.profiles?.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm">{reply.profiles?.name ?? 'Unknown'}</span>
                    <span className="text-xs text-gray-400">{timeAgo(reply.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.body}</p>
                </div>
              </div>
            </Card>
          ))}

          {user && (
            <Card className="mt-4">
              <h3 className="font-bold text-gray-900 mb-3 text-sm">Add a reply</h3>
              <textarea
                rows={3}
                value={replyBody}
                onChange={e => setReplyBody(e.target.value)}
                placeholder="Write your reply…"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white resize-none"
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={() => createReplyMutation.mutate()}
                  disabled={!replyBody.trim() || createReplyMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createReplyMutation.isPending ? 'Posting…' : 'Post reply'}
                </button>
              </div>
            </Card>
          )}
        </div>
      </div>
    )
  }

  // ---- Render: List view ----

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Community</h1>
        {user && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
          >
            + New Post
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {CATEGORY_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveCategory(tab.key)}
            className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeCategory === tab.key
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Post list */}
      {postsLoading && <Skeleton lines={4} />}

      {!postsLoading && posts?.length === 0 && (
        <EmptyState
          icon="💬"
          title="No posts yet"
          description="Be the first to start a conversation!"
        />
      )}

      {posts?.map(post => (
        <Card
          key={post.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
        >
          <div
            onClick={() => setSelectedPost(post)}
            className="flex items-start gap-3"
          >
            <Avatar name={post.profiles?.name} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-semibold text-gray-900 text-sm">{post.profiles?.name ?? 'Unknown'}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_BADGE[post.category] ?? 'bg-gray-100 text-gray-600'}`}>
                  {post.category}
                </span>
                <span className="text-xs text-gray-400">{timeAgo(post.created_at)}</span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">{post.title}</h3>
              <p className="text-xs text-gray-500 line-clamp-2">
                {post.body.length > 100 ? post.body.slice(0, 100) + '…' : post.body}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
            <button
              onClick={e => {
                e.stopPropagation()
                likePostMutation.mutate(post.id)
              }}
              disabled={likePostMutation.isPending}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors"
            >
              <span>❤️</span>
              <span>{post.likes}</span>
            </button>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <span>💬</span>
              <span>{post.reply_count}</span>
            </span>
          </div>
        </Card>
      ))}

      {/* Create post overlay */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">New Post</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Body</label>
                <textarea
                  rows={4}
                  value={newBody}
                  onChange={e => setNewBody(e.target.value)}
                  placeholder="Share your thoughts, questions, or tips…"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                  <option value="questions">Questions ❓</option>
                  <option value="tips">Tips 💡</option>
                  <option value="showcase">Showcase 🎉</option>
                  <option value="general">General 💬</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowCreateForm(false)}
                className="border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => createPostMutation.mutate()}
                disabled={!newTitle.trim() || !newBody.trim() || createPostMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createPostMutation.isPending ? 'Posting…' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
