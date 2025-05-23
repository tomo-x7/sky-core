import Picker from "@emoji-mart/react";
import { DismissableLayer } from "@radix-ui/react-dismissable-layer";
import { FocusScope } from "@radix-ui/react-focus-scope";
import React from "react";
import { Portal } from "#/components/Portal";
import { useWindowDimensions } from "#/components/hooks/useWindowDimensions";
import { textInputWebEmitter } from "#/view/com/composer/text-input/textInputWebEmitter";

const HEIGHT_OFFSET = 40;
const WIDTH_OFFSET = 100;
const PICKER_HEIGHT = 435 + HEIGHT_OFFSET;
const PICKER_WIDTH = 350 + WIDTH_OFFSET;

export type Emoji = {
	aliases?: string[];
	emoticons: string[];
	id: string;
	keywords: string[];
	name: string;
	native: string;
	shortcodes?: string;
	unified: string;
};

export interface EmojiPickerPosition {
	top: number;
	left: number;
	right: number;
	bottom: number;
	nextFocusRef: React.RefObject<HTMLElement | null> | null;
}

export interface EmojiPickerState {
	isOpen: boolean;
	pos: EmojiPickerPosition;
}

interface IProps {
	state: EmojiPickerState;
	close: () => void;
	/**
	 * If `true`, overrides position and ensures picker is pinned to the top of
	 * the target element.
	 */
	pinToTop?: boolean;
}

export function EmojiPicker({ state, close, pinToTop }: IProps) {
	const { height, width } = useWindowDimensions();

	const isShiftDown = React.useRef(false);

	const position = React.useMemo(() => {
		if (pinToTop) {
			return {
				top: state.pos.top - PICKER_HEIGHT + HEIGHT_OFFSET - 10,
				left: state.pos.left,
			};
		}

		const fitsBelow = state.pos.top + PICKER_HEIGHT < height;
		const fitsAbove = PICKER_HEIGHT < state.pos.top;
		const placeOnLeft = PICKER_WIDTH < state.pos.left;
		const screenYMiddle = height / 2 - PICKER_HEIGHT / 2;

		if (fitsBelow) {
			return {
				top: state.pos.top + HEIGHT_OFFSET,
			};
		} else if (fitsAbove) {
			return {
				bottom: height - state.pos.bottom + HEIGHT_OFFSET,
			};
		} else {
			return {
				top: screenYMiddle,
				left: placeOnLeft ? state.pos.left - PICKER_WIDTH : undefined,
				right: !placeOnLeft ? width - state.pos.right - PICKER_WIDTH : undefined,
			};
		}
	}, [state.pos, height, width, pinToTop]);

	React.useEffect(() => {
		if (!state.isOpen) return;

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Shift") {
				isShiftDown.current = true;
			}
		};
		const onKeyUp = (e: KeyboardEvent) => {
			if (e.key === "Shift") {
				isShiftDown.current = false;
			}
		};
		window.addEventListener("keydown", onKeyDown, true);
		window.addEventListener("keyup", onKeyUp, true);

		return () => {
			window.removeEventListener("keydown", onKeyDown, true);
			window.removeEventListener("keyup", onKeyUp, true);
		};
	}, [state.isOpen]);

	const onInsert = (emoji: Emoji) => {
		textInputWebEmitter.emit("emoji-inserted", emoji);

		if (!isShiftDown.current) {
			close();
		}
	};

	if (!state.isOpen) return null;

	return (
		<Portal>
			<FocusScope
				loop
				trapped
				onUnmountAutoFocus={(e) => {
					const nextFocusRef = state.pos.nextFocusRef;
					const node = nextFocusRef?.current;
					if (node) {
						e.preventDefault();
						node.focus();
					}
				}}
			>
				<button
					type="button"
					onClick={close}
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
					}}
				/>

				<div
					style={{
						top: 0,
						left: 0,
						right: 0,
						position: "fixed",
						width: "100%",
						height: "100%",
						alignItems: "center",
						zIndex: 10,
					}}
				>
					<div style={{ position: "absolute", ...position }}>
						<DismissableLayer onFocusOutside={(evt) => evt.preventDefault()} onDismiss={close}>
							<Picker
								data={async () => {
									return (await import("./EmojiPickerData.json")).default;
								}}
								onEmojiSelect={onInsert}
								autoFocus={true}
							/>
						</DismissableLayer>
					</div>
				</div>

				<button
					type="button"
					onClick={close}
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
					}}
				/>
			</FocusScope>
		</Portal>
	);
}
