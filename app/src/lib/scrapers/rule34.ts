import type { Scraper } from './_types.js';

export interface Rule34ApiPost {
	id: string;
	image: string;
	file_url: string;
	preview_url: string;
	tags: string;
}

function requireEnv(): { apiKey: string; userId: string } {
	const apiKey = process.env.RULE34_API_KEY;
	const userId = process.env.RULE34_USER_ID;
	if (!apiKey || !userId) {
		throw new Error('RULE34_API_KEY and RULE34_USER_ID environment variables must be set');
	}
	return { apiKey, userId };
}

function extractPostId(pageUrl: string): string {
	const id = new URL(pageUrl).searchParams.get('id');
	if (!id) throw new Error(`Could not extract post ID from URL: ${pageUrl}`);
	return id;
}

async function fetchApiPost(
	postId: string,
	apiKey: string,
	userId: string,
	signal?: AbortSignal
): Promise<Rule34ApiPost> {
	const apiUrl = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&id=${postId}&api_key=${apiKey}&user_id=${userId}`;
	const response = await fetch(apiUrl, { signal });

	if (response.status === 401 || response.status === 403) {
		throw new Error('rule34 API authentication failed — check RULE34_API_KEY and RULE34_USER_ID');
	}
	if (!response.ok) {
		throw new Error(`rule34 API returned ${response.status} ${response.statusText}`);
	}

	const posts = (await response.json()) as Rule34ApiPost[];
	if (!Array.isArray(posts) || posts.length === 0) {
		throw new Error(`rule34 API returned no post for ID ${postId}`);
	}

	return posts[0];
}

export const scraper: Scraper = {
	name: 'rule34',
	matches: (url) => url.hostname === 'rule34.xxx',
	scrape: async (pageUrl, signal) => {
		const { apiKey, userId } = requireEnv();
		const postId = extractPostId(pageUrl);
		const post = await fetchApiPost(postId, apiKey, userId, signal);

		return {
			external: {
				id: post.id,
				imageUrl: post.file_url,
				thumbnailUrl: post.preview_url,
				title: post.image,
				tags: post.tags.split(' ').filter(Boolean),
			},
		};
	},
};
