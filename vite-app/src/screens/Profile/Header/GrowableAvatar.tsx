import type React from "react";

export function GrowableAvatar({
	children,
	style,
}: {
	children: React.ReactNode;
	style?: React.CSSProperties;
}) {
	return <div style={style}>{children}</div>;
}
