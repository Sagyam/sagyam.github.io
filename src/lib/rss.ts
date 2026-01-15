import type { BlogPost } from './types/blog';

const GRAPHQL_API = 'https://gql.hashnode.com/';
const PUBLICATION_HOST = 'blog.sagyamthapa.com.np';

type HashnodePost = {
  id: string;
  title: string;
  brief: string;
  url: string;
  publishedAt: string;
  tags?: Array<{ name: string }>;
  coverImage?: { url: string };
};

type GraphQLResponse = {
  data: {
    publication: {
      posts: {
        edges: Array<{
          node: HashnodePost;
        }>;
      };
    };
  };
};

export async function getBlogPosts(limit?: number): Promise<BlogPost[]> {
  try {
    const query = `
      query Publication {
        publication(host: "${PUBLICATION_HOST}") {
          posts(first: ${limit || 20}) {
            edges {
              node {
                id
                title
                brief
                url
                publishedAt
                tags {
                  name
                }
                coverImage {
                  url
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch(GRAPHQL_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
      next: { revalidate: 86400 }, // Revalidate once a day (24 * 60 * 60 seconds)
    });

    if (!response.ok) {
      console.error('Failed to fetch blog posts:', response.statusText);
      return [];
    }

    const result: GraphQLResponse = await response.json();

    if (!result.data?.publication?.posts?.edges) {
      console.error('Invalid GraphQL response structure');
      return [];
    }

    const blogPosts = result.data.publication.posts.edges.map(({ node }, index) => {
      const tags = node.tags?.map((tag) => tag.name) || [];
      return {
        id: node.id,
        title: node.title,
        summary: node.brief,
        link: node.url,
        publication: node.publishedAt,
        tech: tags,
        imageId: `blog-${index}`,
        imageUrl: node.coverImage?.url,
      };
    });

    return blogPosts;
  } catch (error) {
    console.error('Error fetching blog posts from GraphQL API:', error);
    return [];
  }
}
