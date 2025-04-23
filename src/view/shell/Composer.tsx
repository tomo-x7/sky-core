import { DismissableLayer } from "@radix-ui/react-dismissable-layer";
import { useFocusGuards } from "@radix-ui/react-focus-guards";
import { FocusScope } from "@radix-ui/react-focus-scope";
import React from "react";
import { RemoveScrollBar } from "react-remove-scroll-bar";

import { useBreakpoints, useTheme } from "#/alf";
import { useA11y } from "#/state/a11y";
import { useModals } from "#/state/modals";
import { type ComposerOpts, useComposerState } from "#/state/shell/composer";
import {
	EmojiPicker,
	type EmojiPickerPosition,
	type EmojiPickerState,
} from "#/view/com/composer/text-input/web/EmojiPicker.web";
import { ComposePost, useComposerCancelRef } from "../com/composer/Composer";

const BOTTOM_BAR_HEIGHT = 61;

export function Composer(props: { winHeight: number }) {
	const state = useComposerState();
	const isActive = !!state;

	// rendering
	// =

	if (!isActive) {
		return null;
	}

	return (
		<>
			<RemoveScrollBar />
			<Inner state={state} />
		</>
	);
}

function Inner({ state }: { state: ComposerOpts }) {
	const ref = useComposerCancelRef();
	const { isModalActive } = useModals();
	const t = useTheme();
	const { gtMobile } = useBreakpoints();
	const { reduceMotionEnabled } = useA11y();
	const [pickerState, setPickerState] = React.useState<EmojiPickerState>({
		isOpen: false,
		pos: { top: 0, left: 0, right: 0, bottom: 0, nextFocusRef: null },
	});

	const onOpenPicker = React.useCallback((pos: EmojiPickerPosition | undefined) => {
		if (!pos) return;
		setPickerState({
			isOpen: true,
			pos,
		});
	}, []);

	const onClosePicker = React.useCallback(() => {
		setPickerState((prev) => ({
			...prev,
			isOpen: false,
		}));
	}, []);

	useFocusGuards();

	return (
		<FocusScope loop trapped asChild>
			<DismissableLayer
				// biome-ignore lint/a11y/useSemanticElements: <explanation>
				role="dialog"
				aria-modal
				style={{
					position: "fixed",
					inset: 0,
					backgroundColor: "#000c",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					animation: reduceMotionEnabled ? undefined : "fade-in",
				}}
				onFocusOutside={(evt) => evt.preventDefault()}
				onInteractOutside={(evt) => evt.preventDefault()}
				onDismiss={() => {
					// TEMP: remove when all modals are ALF'd -sfn
					if (!isModalActive) {
						ref.current?.onPressCancel();
					}
				}}
			>
				<div
					style={{
						...styles.container,
						...(!gtMobile && styles.containerMobile),
						...t.atoms.bg,
						...t.atoms.border_contrast_medium,
						...(!reduceMotionEnabled && {
							animation: "zoomIn ease-out 0.1s, fadeIn ease-out 0.1s",
							animationDelay: "0.1s",
							animationFillMode: "backwards",
						}),
					}}
				>
					<ComposePost
						cancelRef={ref}
						replyTo={state.replyTo}
						quote={state.quote}
						onPost={state.onPost}
						mention={state.mention}
						openEmojiPicker={onOpenPicker}
						text={state.text}
						imageUris={state.imageUris}
					/>
				</div>
				<EmojiPicker state={pickerState} close={onClosePicker} />
			</DismissableLayer>
		</FocusScope>
	);
}

const styles = {
	container: {
		marginTop: 50,
		maxWidth: 600,
		width: "100%",
		paddingTop: 0,
		paddingBottom: 0,
		borderRadius: 8,
		marginBottom: 0,
		borderWidth: 1,
		maxHeight: "calc(100% - (40px * 2))",
		overflow: "hidden",
	},
	containerMobile: {
		borderRadius: 0,
		marginBottom: BOTTOM_BAR_HEIGHT,
		maxHeight: `calc(100% - ${BOTTOM_BAR_HEIGHT}px)`,
	},
} satisfies Record<string, React.CSSProperties>;
