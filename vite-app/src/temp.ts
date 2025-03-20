export interface ListRenderItemInfo<ItemT> {
	item: ItemT;

	index: number;

	separators: {
		highlight: () => void;
		unhighlight: () => void;
		updateProps: (select: "leading" | "trailing", newProps: any) => void;
	};
}
