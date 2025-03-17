import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useCallback, useEffect, useState } from "react";
import { Image, type ImageStyle, Pressable, TouchableWithoutFeedback } from "react-native";
import { RemoveScrollBar } from "react-remove-scroll-bar";

import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { colors, s } from "#/lib/styles";
import { useLightbox, useLightboxControls } from "#/state/lightbox";
import { Text } from "../util/text/Text";
import type { ImageSource } from "./ImageViewing/@types";
import ImageDefaultHeader from "./ImageViewing/components/ImageDefaultHeader";

export function Lightbox() {
	const { activeLightbox } = useLightbox();
	const { closeLightbox } = useLightboxControls();
	const isActive = !!activeLightbox;

	if (!isActive) {
		return null;
	}

	const initialIndex = activeLightbox.index;
	const imgs = activeLightbox.images;
	return (
		<>
			<RemoveScrollBar />
			<LightboxInner imgs={imgs} initialIndex={initialIndex} onClose={closeLightbox} />
		</>
	);
}

function LightboxInner({
	imgs,
	initialIndex = 0,
	onClose,
}: {
	imgs: ImageSource[];
	initialIndex: number;
	onClose: () => void;
}) {
	const [index, setIndex] = useState<number>(initialIndex);
	const [isAltExpanded, setAltExpanded] = useState(false);

	const canGoLeft = index >= 1;
	const canGoRight = index < imgs.length - 1;
	const onPressLeft = useCallback(() => {
		if (canGoLeft) {
			setIndex(index - 1);
		}
	}, [index, canGoLeft]);
	const onPressRight = useCallback(() => {
		if (canGoRight) {
			setIndex(index + 1);
		}
	}, [index, canGoRight]);

	const onKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			} else if (e.key === "ArrowLeft") {
				onPressLeft();
			} else if (e.key === "ArrowRight") {
				onPressRight();
			}
		},
		[onClose, onPressLeft, onPressRight],
	);

	useEffect(() => {
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [onKeyDown]);

	const { isTabletOrDesktop } = useWebMediaQueries();
	const btnStyle = React.useMemo(() => {
		return isTabletOrDesktop ? styles.btnTablet : styles.btnMobile;
	}, [isTabletOrDesktop]);
	const iconSize = React.useMemo(() => {
		return isTabletOrDesktop ? 32 : 24;
	}, [isTabletOrDesktop]);

	const img = imgs[index];
	const isAvi = img.type === "circle-avi" || img.type === "rect-avi";
	return (
		<div style={styles.mask}>
			<TouchableWithoutFeedback
				onPress={onClose}
				accessibilityRole="button"
				accessibilityLabel={"Close image viewer"}
				accessibilityHint={"Exits image view"}
				onAccessibilityEscape={onClose}
			>
				{isAvi ? (
					<div style={styles.aviCenterer}>
						<img
							src={img.uri}
							// @ts-ignore web-only
							style={
								{
									...styles.avi,
									borderRadius:
										img.type === "circle-avi" ? "50%" : img.type === "rect-avi" ? "10%" : 0,
								} as ImageStyle
							}
							alt={img.alt}
						/>
					</div>
				) : (
					<div style={styles.imageCenterer}>
						<Image
							accessibilityIgnoresInvertColors
							source={img}
							style={styles.image as ImageStyle}
							accessibilityLabel={img.alt}
							accessibilityHint=""
						/>
						{canGoLeft && (
							<button
								type="button"
								onClick={onPressLeft}
								style={{
									...styles.btn,
									...btnStyle,
									...styles.leftBtn,
									...styles.blurredBackground,
								}}
							>
								{/* @ts-ignore */}
								<FontAwesomeIcon icon="angle-left" style={styles.icon} size={iconSize} />
							</button>
						)}
						{canGoRight && (
							<button
								type="button"
								onClick={onPressRight}
								style={{
									...styles.btn,
									...btnStyle,
									...styles.rightBtn,
									...styles.blurredBackground,
								}}
							>
								{/* @ts-ignore */}
								<FontAwesomeIcon icon="angle-right" style={styles.icon} size={iconSize} />
							</button>
						)}
					</div>
				)}
			</TouchableWithoutFeedback>
			{img.alt ? (
				<div style={styles.footer}>
					<Pressable
						accessibilityLabel={"Expand alt text"}
						accessibilityHint={"If alt text is long, toggles alt text expanded state"}
						onPress={() => {
							setAltExpanded(!isAltExpanded);
						}}
					>
						<Text style={s.white} numberOfLines={isAltExpanded ? 0 : 3} ellipsizeMode="tail">
							{img.alt}
						</Text>
					</Pressable>
				</div>
			) : null}
			<div style={styles.closeBtn}>
				<ImageDefaultHeader onRequestClose={onClose} />
			</div>
		</div>
	);
}

const styles: Record<string, React.CSSProperties> = {
	mask: {
		position: "fixed",
		top: 0,
		left: 0,
		width: "100%",
		height: "100%",
		backgroundColor: "#000c",
	},
	imageCenterer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	image: {
		width: "100%",
		height: "100%",
		objectFit: "contain",
	},
	aviCenterer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	avi: {
		// @ts-ignore web-only
		maxWidth: "calc(min(400px, 100vw))",
		// @ts-ignore web-only
		maxHeight: "calc(min(400px, 100vh))",
		padding: 16,
		boxSizing: "border-box",
	},
	icon: {
		color: colors.white,
	},
	closeBtn: {
		position: "absolute",
		top: 10,
		right: 10,
	},
	btn: {
		position: "absolute",
		backgroundColor: "#00000077",
		justifyContent: "center",
		alignItems: "center",
	},
	btnTablet: {
		width: 50,
		height: 50,
		borderRadius: 25,
		left: 30,
		right: 30,
	},
	btnMobile: {
		width: 44,
		height: 44,
		borderRadius: 22,
		left: 20,
		right: 20,
	},
	leftBtn: {
		right: "auto",
		top: "50%",
	},
	rightBtn: {
		left: "auto",
		top: "50%",
	},
	footer: {
		padding: "24px 32px",
		backgroundColor: colors.black,
	},
	blurredBackground: {
		backdropFilter: "blur(10px)",
		WebkitBackdropFilter: "blur(10px)",
	},
};
