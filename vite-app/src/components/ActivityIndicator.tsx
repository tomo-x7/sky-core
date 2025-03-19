const ActivityIndicator = ({
	size = 24,
	color = "#000",
	style,
}: { size?: number; color?: string; style?: React.CSSProperties }) => {
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
					animation: "spin 1s linear infinite",
				}}
			/>
			<style>
				{`@keyframes spin {
  						0% { transform: rotate(0deg); }
  						100% { transform: rotate(360deg); }
				}`}
			</style>
		</>
	);
};

export default ActivityIndicator;
