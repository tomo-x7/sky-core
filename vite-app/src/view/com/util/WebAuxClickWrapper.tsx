import type React from "react";

const onMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
	// Only handle whenever it is the middle button
	if (e.button !== 1 || e.target.closest("a") || e.target.tagName === "A") {
		return;
	}

	e.target.dispatchEvent(new MouseEvent("click", { metaKey: true, bubbles: true }));
};

const onMouseDown = (e: React.MouseEvent) => {
	// Prevents the middle click scroll from enabling
	if (e.button !== 1) return;
	e.preventDefault();
};

export function WebAuxClickWrapper({ children }: React.PropsWithChildren) {
	return (
		<div onMouseDown={onMouseDown} onMouseUp={onMouseUp}>
			{children}
		</div>
	);
}
