interface FuzzySearchOptions<T> {
	getSearchText(item: T): string
}

// TODO(david): actually fuzzy searching
// TODO(david): return match ranges for highlighting
// TODO(david): rank matches
export function fuzzySearch<T>(
	items: T[],
	searchValue: string,
	options: FuzzySearchOptions<T>,
): T[] {
	return items.filter((item) => {
		const searchText = options.getSearchText(item)
		return searchText.includes(searchValue)
	})
}
