import React, { type ComponentProps } from "react";

import { useDraggableScroll } from "#/lib/hooks/useDraggableScrollView";

export const DraggableScrollView = React.forwardRef<HTMLDivElement, ComponentProps<"div">>(
	function DraggableScrollView(props, ref) {
		const { refs } = useDraggableScroll({
			outerRef: ref,
			cursor: "grab", // optional, default
		});

		return (
			<div
				// ScrollView
				ref={refs}
				// horizontal
				{...props}
			/>
		);
	},
);
