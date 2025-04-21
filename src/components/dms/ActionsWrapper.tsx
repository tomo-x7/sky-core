import type { ChatBskyConvoDefs } from "@atproto/api";
import React from "react";
import { useMenuControl } from "#/components/Menu";
import { MessageMenu } from "#/components/dms/MessageMenu";

export function ActionsWrapper({
	message,
	isFromSelf,
	children,
}: {
	message: ChatBskyConvoDefs.MessageView;
	isFromSelf: boolean;
	children: React.ReactNode;
}) {
	const menuControl = useMenuControl();
	const viewRef = React.useRef(null);

	const [showActions, setShowActions] = React.useState(false);

	const onMouseEnter = React.useCallback(() => {
		setShowActions(true);
	}, []);

	const onMouseLeave = React.useCallback(() => {
		setShowActions(false);
	}, []);

	// We need to handle the `onFocus` separately because we want to know if there is a related target (the element
	// that is losing focus). If there isn't that means the focus is coming from a dropdown that is now closed.
	const onFocus = React.useCallback<React.FocusEventHandler>((e) => {
		if (e.nativeEvent.relatedTarget == null) return;
		setShowActions(true);
	}, []);

	return (
		<div
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			onFocus={onFocus}
			onBlur={onMouseLeave}
			style={{ flex: 1, flexDirection: "row" }}
			ref={viewRef}
		>
			{isFromSelf && (
				<div
					style={{
						marginRight: 20,
						justifyContent: "center",

						...{
							marginLeft: "auto",
						},
					}}
				>
					<MessageMenu
						message={message}
						control={menuControl}
						triggerOpacity={showActions || menuControl.isOpen ? 1 : 0}
					/>
				</div>
			)}
			<div
				style={{
					maxWidth: "80%",
				}}
			>
				{children}
			</div>
			{!isFromSelf && (
				<div
					style={{
						flexDirection: "row",
						alignItems: "center",
						marginLeft: 20,
					}}
				>
					<MessageMenu
						message={message}
						control={menuControl}
						triggerOpacity={showActions || menuControl.isOpen ? 1 : 0}
					/>
				</div>
			)}
		</div>
	);
}
