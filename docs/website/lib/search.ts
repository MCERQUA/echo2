export interface SearchResult {
  title: string
  content: string
  url: string
  type: 'core' | 'procedure' | 'program'
}

export async function searchContent(query: string): Promise<SearchResult[]> {
  // This will be replaced with actual search implementation
  return []
}

export function buildSearchIndex() {
  // This will be implemented to build the search index
}