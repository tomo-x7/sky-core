export function Modal({
	visible = false,
	onClose,
	presentationStyle = "formSheet",
	style,
	children,
}: React.PropsWithChildren<{
	visible?: boolean;
	onClose?: () => void;
	presentationStyle?: "formSheet" | "fullScreen";
	style?: React.CSSProperties;
}>) {
	if (!visible) return null;

	// formSheetスタイルを設定
	const modalStyle: React.CSSProperties = {
		position: "fixed",
		top: presentationStyle === "formSheet" ? "20%" : "0", // formSheetなら20%の位置
		left: "50%",
		transform: "translateX(-50%)",
		width: presentationStyle === "formSheet" ? "80%" : "100%", // formSheetなら80%の幅
		maxWidth: "600px", // 最大幅
		backgroundColor: "white",
		borderRadius: "8px",
		boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
		padding: "20px",
		zIndex: 1000,
		...style, // 引数で渡されたスタイルを追加
	};

	// 背景を暗くしてクリックで閉じる機能を実装
	const backdropStyle: React.CSSProperties = {
		position: "fixed",
		top: "0",
		left: "0",
		right: "0",
		bottom: "0",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		zIndex: 999,
	};

	return (
		<>
			<div style={backdropStyle} onClick={onClose} />
			<div style={modalStyle}>
				<button
					onClick={onClose}
					style={{
						position: "absolute",
						top: "10px",
						right: "10px",
						background: "transparent",
						border: "none",
						fontSize: "20px",
						cursor: "pointer",
					}}
					type="button"
				>
					x
				</button>
				{children}
			</div>
		</>
	);
}
