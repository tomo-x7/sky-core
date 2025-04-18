export enum PostEmbedViewContext {
	ThreadHighlighted = "ThreadHighlighted",
	Feed = "Feed",
	FeedEmbedRecordWithMedia = "FeedEmbedRecordWithMedia",
}

export enum QuoteEmbedViewContext {
	// biome-ignore lint/style/useLiteralEnumMembers: <explanation>
	FeedEmbedRecordWithMedia = PostEmbedViewContext.FeedEmbedRecordWithMedia,
}
