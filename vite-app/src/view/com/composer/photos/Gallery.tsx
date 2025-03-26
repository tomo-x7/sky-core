import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

import { useTheme } from "#/alf";
import * as Dialog from "#/components/Dialog";
import { Text } from "#/components/Typography";
import { useOnLayout } from "#/components/hooks/useOnLayout";
import { Keyboard } from "#/lib/Keyboard";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import type { Dimensions } from "#/lib/media/types";
import { colors, s } from "#/lib/styles";
import type { ComposerImage } from "#/state/gallery";
import type { PostAction } from "../state/composer";
import { EditImageDialog } from "./EditImageDialog";
import { ImageAltTextDialog } from "./ImageAltTextDialog";

const IMAGE_GAP = 8;

interface GalleryProps {
	images: ComposerImage[];
	dispatch: (action: PostAction) => void;
}

export let Gallery = (props: GalleryProps): React.ReactNode => {
	const [containerInfo, setContainerInfo] = React.useState<Dimensions>();

	const onLayout = (evt: DOMRect) => {
		const { width, height } = evt;
		setContainerInfo({
			width,
			height,
		});
	};
	const ref = useOnLayout(onLayout);
	return <div ref={ref}>{containerInfo ? <GalleryInner {...props} containerInfo={containerInfo} /> : undefined}</div>;
};
Gallery = React.memo(Gallery);

interface GalleryInnerProps extends GalleryProps {
	containerInfo: Dimensions;
}

const GalleryInner = ({ images, containerInfo, dispatch }: GalleryInnerProps) => {
	const { isMobile } = useWebMediaQueries();

	const { altTextControlStyle, imageControlsStyle, imageStyle } = React.useMemo(() => {
		const side =
			images.length === 1 ? 250 : (containerInfo.width - IMAGE_GAP * (images.length - 1)) / images.length;

		const isOverflow = isMobile && images.length > 2;

		return {
			altTextControlStyle: isOverflow
				? { left: 4, bottom: 4 }
				: !isMobile && images.length < 3
					? { left: 8, top: 8 }
					: { left: 4, top: 4 },
			imageControlsStyle: {
				display: "flex" as const,
				flexDirection: "row" as const,
				position: "absolute" as const,
				...(isOverflow
					? { top: 4, right: 4, gap: 4 }
					: !isMobile && images.length < 3
						? { top: 8, right: 8, gap: 8 }
						: { top: 4, right: 4, gap: 4 }),
				zIndex: 1,
			},
			imageStyle: {
				height: side,
				width: side,
			},
		};
	}, [images.length, containerInfo, isMobile]);

	return images.length !== 0 ? (
		<>
			<div style={styles.gallery}>
				{images.map((image) => {
					return (
						<GalleryItem
							key={image.source.id}
							image={image}
							altTextControlStyle={altTextControlStyle}
							imageControlsStyle={imageControlsStyle}
							imageStyle={imageStyle}
							onChange={(next) => {
								dispatch({ type: "embed_update_image", image: next });
							}}
							onRemove={() => {
								dispatch({ type: "embed_remove_image", image });
							}}
						/>
					);
				})}
			</div>
			<AltTextReminder />
		</>
	) : null;
};

type GalleryItemProps = {
	image: ComposerImage;
	altTextControlStyle?: React.CSSProperties;
	imageControlsStyle?: React.CSSProperties;
	imageStyle?: React.CSSProperties;
	onChange: (next: ComposerImage) => void;
	onRemove: () => void;
};

const GalleryItem = ({
	image,
	altTextControlStyle,
	imageControlsStyle,
	imageStyle,
	onChange,
	onRemove,
}: GalleryItemProps): React.ReactNode => {
	const t = useTheme();

	const altTextControl = Dialog.useDialogControl();
	const editControl = Dialog.useDialogControl();

	const onImageEdit = () => {
		editControl.open();
	};

	const onAltTextEdit = () => {
		Keyboard.dismiss();
		altTextControl.open();
	};

	return (
		<div style={imageStyle}>
			<button
				type="button"
				onClick={onAltTextEdit}
				style={{
					...styles.altTextControl,
					...altTextControlStyle,
				}}
			>
				{image.alt.length !== 0 ? (
					<FontAwesomeIcon icon="check" /*size={10}*/ size="xl" style={{ color: t.palette.white }} />
				) : (
					<FontAwesomeIcon icon="plus" /*size={10}*/ size="xl" style={{ color: t.palette.white }} />
				)}
				<Text style={styles.altTextControlLabel}>ALT</Text>
			</button>
			<div style={imageControlsStyle}>
				<button type="button" onClick={onImageEdit} style={styles.imageControl}>
					<FontAwesomeIcon icon="pen" /*size={12}*/ size="xl" style={{ color: colors.white }} />
				</button>
				<button type="button" onClick={onRemove} style={styles.imageControl}>
					<FontAwesomeIcon icon="xmark" /*size={12}*/ size="xl" style={{ color: colors.white }} />
				</button>
			</div>
			<button type="button" onClick={onAltTextEdit} style={styles.altTextHiddenRegion} />
			<img
				style={{
					...styles.image,
					...imageStyle,
				}}
				src={(image.transformed ?? image.source).path}
			/>
			<ImageAltTextDialog control={altTextControl} image={image} onChange={onChange} />
			<EditImageDialog control={editControl} image={image} onChange={onChange} />
		</div>
	);
};

export function AltTextReminder() {
	const t = useTheme();
	return (
		<div style={styles.reminder}>
			<div
				style={{
					...styles.infoIcon,
					...t.atoms.bg_contrast_25,
				}}
			>
				<FontAwesomeIcon icon="info" /*size={12}*/ size="xl" color={t.atoms.text.color} />
			</div>
			<Text
				type="sm"
				style={{
					...t.atoms.text_contrast_medium,
					...s.flex1,
				}}
			>
				Alt text describes images for blind and low-vision users, and helps give context to everyone.
			</Text>
		</div>
	);
}

const styles: Record<string, React.CSSProperties> = {
	gallery: {
		flex: 1,
		flexDirection: "row",
		gap: IMAGE_GAP,
		marginTop: 16,
	},
	image: {
		objectFit: "cover",
		borderRadius: 8,
	},
	imageControl: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: "rgba(0, 0, 0, 0.75)",
		alignItems: "center",
		justifyContent: "center",
	},
	altTextControl: {
		position: "absolute",
		zIndex: 1,
		borderRadius: 6,
		backgroundColor: "rgba(0, 0, 0, 0.75)",
		padding: "3px 8px",
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	altTextControlLabel: {
		color: "white",
		fontSize: 12,
		fontWeight: "600",
		letterSpacing: 1,
	},
	altTextHiddenRegion: {
		position: "absolute",
		left: 4,
		right: 4,
		bottom: 4,
		top: 30,
		zIndex: 1,
	},

	reminder: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		borderRadius: 8,
		paddingTop: 14,
		paddingBottom: 14,
	},
	infoIcon: {
		width: 22,
		height: 22,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
};
