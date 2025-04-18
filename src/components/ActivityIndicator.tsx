const id = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(6))));
export const ActivityIndicator = ({
	size = 24,
	color = "#000",
	style,
}: { size?: number | "large"; color?: string; style?: React.CSSProperties }) => {
	// TODO 数字決める
	if (size === "large") size = 24;
	return (
		<>
			<div
				style={{
					...style,
					width: size,
					height: size,
					borderRadius: "50%",
					border: `3px solid ${color}`,
					borderTop: "3px solid transparent",
					animation: `spin_${id} 1s linear infinite`,
				}}
			/>
			<style>
				{`@keyframes spin_${id} {
  						0% { transform: rotate(0deg); }
  						100% { transform: rotate(360deg); }
				}`}
			</style>
		</>
	);
};
