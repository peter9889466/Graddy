import React, { useMemo, useState } from 'react'
import PageLayout from '../components/layout/PageLayout'
import ResponsiveContainer from '../components/layout/ResponsiveContainer'
import ResponsiveMainContent from '../components/layout/ResponsiveMainContent'
import { CommunityProvider, useCommunityContext, PostType } from '../contexts/CommunityContext'
import Comments from '../components/community/Comments'
import CreatePostModal from '../components/community/CreatePostModal'
import { useModal } from '../hooks/useModal'

const SearchAndCreate: React.FC = () => {
	const { posts, createPost } = useCommunityContext()
	const [typeFilter, setTypeFilter] = useState<'all' | PostType>('all')
	const [searchField, setSearchField] = useState<'title' | 'author'>('title')
	const [query, setQuery] = useState('')
	const { isOpen, openModal, closeModal } = useModal()

	const filtered = useMemo(() => {
		return posts.filter(p => {
			const typeOk = typeFilter === 'all' || p.type === typeFilter
			const field = searchField === 'title' ? p.title : p.author
			const q = query.trim().toLowerCase()
			const fieldOk = q === '' || field.toLowerCase().includes(q)
			return typeOk && fieldOk
		})
	}, [posts, typeFilter, searchField, query])

	const handleCreate = (data: { title: string; author: string; content: string; type: PostType }) => {
		createPost(data)
	}

	return (
		<div className="space-y-6">
			<div className="rounded-xl" >
				<h2 className="text-lg font-semibold mb-3" style={{ color: '#8B85E9' }}>검색</h2>
				<div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
					<select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className=" rounded-lg px-3 py-2">
						<option value="all">전체</option>
						<option value="project">프로젝트</option>
						<option value="study">스터디</option>
					</select>
					<select value={searchField} onChange={e => setSearchField(e.target.value as any)} className=" rounded-lg px-3 py-2">
						<option value="title">제목</option>
						<option value="author">작성자</option>
					</select>
					<input value={query} onChange={e => setQuery(e.target.value)} placeholder="검색어를 입력하세요" className=" rounded-lg px-3 py-2 col-span-1 sm:col-span-2" />
				</div>
			</div>

			<div className="rounded-xl " style={{backgroundColor: '#F9F9FF' }}>
				<h2 className="text-lg font-semibold mb-3 mt-3 ml-3" style={{ color: '#8B85E9' }}>게시글 목록</h2>
				<ul className="space-y-4">
					{filtered.map(p => (
						<li key={p.id} className="py-3 space-y-3">
							<div className="flex items-center justify-between">
								<div>
									<span className="text-xs px-2 py-0.5 rounded-full mr-2" style={{ color: '#8B85E9', backgroundColor: '#E8E6FF' }}>{p.type === 'project' ? '프로젝트' : '스터디'}</span>
									<span className="font-semibold">{p.title}</span>
								</div>
								<span className="text-sm text-gray-500">{p.author}</span>
							</div>
							<p className="text-gray-600 mt-1 text-sm whitespace-pre-line">{p.content}</p>
							<Comments postId={p.id} />
						</li>
					))}
					{filtered.length === 0 && (
						<li className="py-6 text-center text-gray-500">게시글이 없습니다.</li>
					)}
				</ul>
			</div>

			<div className="rounded-xl">
				<button onClick={openModal} className="px-4 py-2 rounded-lg text-white" style={{ backgroundColor: '#8B85E9' }}>게시글 작성</button>
				<CreatePostModal isOpen={isOpen} onClose={closeModal} onCreate={handleCreate} />
			</div>
		</div>
	)
}

const CommunityPageInner: React.FC = () => {
	return (
		<PageLayout>
			<ResponsiveContainer variant="default">
				<ResponsiveMainContent padding="md">
					<SearchAndCreate />
				</ResponsiveMainContent>
			</ResponsiveContainer>
		</PageLayout>
	)
}

export const CommunityPage = () => {
	return (
		<CommunityProvider>
			<CommunityPageInner />
		</CommunityProvider>
	)
}
