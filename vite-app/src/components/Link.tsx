import React from "react";

import { useNavigate } from "react-router-dom";
import { type TextStyleProp, atoms as a, useTheme } from "#/alf";
import { Button, type ButtonProps } from "#/components/Button";
import type { TextProps } from "#/components/Typography";
import { useInteractionState } from "#/components/hooks/useInteractionState";
import { BSKY_DOWNLOAD_URL } from "#/lib/constants";
import { useOpenLink } from "#/lib/hooks/useOpenLink";
import { shareUrl } from "#/lib/sharing";
import { isBskyDownloadUrl, isExternalUrl, linkRequiresWarning } from "#/lib/strings/url-helpers";
import { useModalControls } from "#/state/modals";

/**
 * Only available within a `Link`, since that inherits from `Button`.
 * `InlineLink` provides no context.
 */
export { useButtonContext as useLinkContext } from "#/components/Button";

type BaseLinkProps = {
	/**
	 * The React Navigation `StackAction` to perform when the link is pressed.
	 */
	action?: "replace" | "navigate";

	/**
	 * If true, will warn the user if the link text does not match the href.
	 *
	 * Note: atm this only works for `InlineLink`s with a string child.
	 */
	disableMismatchWarning?: boolean;

	/**
	 * Callback for when the link is pressed. Prevent default and return `false`
	 * to exit early and prevent navigation.
	 *
	 * DO NOT use this for navigation, that's what the `to` prop is for.
	 */

	onPress?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void | false;

	/**
	 * Web-only attribute. Sets `download` attr on web.
	 */
	download?: string;

	/**
	 * Whether the link should be opened through the redirect proxy.
	 */
	shouldProxy?: boolean;
	to: string;
	state?: undefined | Record<string | number, unknown>;
};

export function useLink({
	to,
	displayText,
	action = "navigate",
	disableMismatchWarning,
	onPress: outerOnPress,
	overridePresentation,
	shouldProxy,
}: BaseLinkProps & {
	displayText: string;
	overridePresentation?: boolean;
	shouldProxy?: boolean;
}) {
	// const navigation = useNavigationDeduped();
	// const { href } = useLinkProps<AllNavigatorParams>({
	// 	to: typeof to === "string" ? convertBskyAppUrlIfNeeded(sanitizeUrl(to)) : to,
	// });
	const isExternal = isExternalUrl(to);
	const { openModal, closeModal } = useModalControls();
	const openLink = useOpenLink();
	const navigate = useNavigate();

	const onPress = React.useCallback(
		(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
			const exitEarlyIfFalse = outerOnPress?.(e);

			if (exitEarlyIfFalse === false) return;

			const requiresWarning = Boolean(
				!disableMismatchWarning && displayText && isExternal && linkRequiresWarning(to, displayText),
			);

			e.preventDefault();

			if (requiresWarning) {
				openModal({
					name: "link-warning",
					text: displayText,
					href: to,
				});
			} else {
				if (isExternal) {
					openLink(to, overridePresentation, shouldProxy);
				} else {
					const shouldOpenInNewTab = shouldClickOpenNewTab(e);

					if (isBskyDownloadUrl(to)) {
						shareUrl(BSKY_DOWNLOAD_URL);
					} else if (shouldOpenInNewTab || to.startsWith("http") || to.startsWith("mailto")) {
						openLink(to);
					} else {
						closeModal(); // close any active modals

						if (action === "replace") {
							navigate(to);
						} else if (action === "navigate") {
							navigate(to, { replace: true });
						} else {
							throw Error("Unsupported navigator action.");
						}
					}
				}
			}
		},
		[
			outerOnPress,
			disableMismatchWarning,
			displayText,
			isExternal,
			openModal,
			openLink,
			closeModal,
			action,
			navigate,
			overridePresentation,
			shouldProxy,
			to,
		],
	);

	// const onLongPress = React.useCallback(
	// 	(e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement, MouseEvent>) => {
	// 		const exitEarlyIfFalse = outerOnLongPress?.(e);
	// 		if (exitEarlyIfFalse === false) return;
	// 		return undefined;
	// 	},
	// 	[outerOnLongPress],
	// );

	return {
		isExternal,
		to,
		onPress,
	};
}

export type LinkProps = Omit<BaseLinkProps, "disableMismatchWarning"> & Omit<ButtonProps, "onPress" | "disabled">;

/**
 * A interactive element that renders as a `<a>` tag on the web. On mobile it
 * will translate the `href` to navigator screens and params and dispatch a
 * navigation action.
 *
 * Intended to behave as a web anchor tag. For more complex routing, use a
 * `Button`.
 */
export function Link({
	children,
	to,
	action = "navigate",
	onPress: outerOnPress,
	download,
	shouldProxy,
	...rest
}: LinkProps) {
	const {
		to: href,
		isExternal,
		onPress,
	} = useLink({
		to,
		displayText: typeof children === "string" ? children : "",
		action,
		onPress: outerOnPress,
		shouldProxy: shouldProxy,
	});

	return (
		<Button
			{...rest}
			style={{
				...a.justify_start,
				...rest.style,
			}}
			// TODO
			// href={href}
			onPress={download ? undefined : onPress}
			{...{
				hrefAttrs: {
					target: download ? undefined : isExternal ? "blank" : undefined,
					rel: isExternal ? "noopener noreferrer" : undefined,
					download,
				},
				dataSet: {
					// no underline, only `InlineLink` has underlines
					noUnderline: "1",
				},
			}}
		>
			{children}
		</Button>
	);
}

export type InlineLinkProps = React.PropsWithChildren<
	BaseLinkProps &
		TextStyleProp &
		Pick<TextProps, "selectable"> &
		Pick<ButtonProps, "label"> & {
			disableUnderline?: boolean;
			title?: TextProps["title"];
			overridePresentation?: boolean;
		}
>;

export function InlineLinkText({
	children,
	to,
	action = "navigate",
	disableMismatchWarning,
	style,
	onPress: outerOnPress,
	download,
	selectable,
	label,
	disableUnderline,
	overridePresentation,
	shouldProxy,
	...rest
}: InlineLinkProps) {
	const t = useTheme();
	const stringChildren = typeof children === "string";
	const {
		to: href,
		isExternal,
		onPress,
	} = useLink({
		to,
		displayText: stringChildren ? children : "",
		action,
		disableMismatchWarning,
		onPress: outerOnPress,
		overridePresentation,
		shouldProxy: shouldProxy,
	});
	const { state: hovered, onIn: onHoverIn, onOut: onHoverOut } = useInteractionState();
	const flattenedStyle = style || {};

	return (
		<a
			unselectable={selectable ? "off" : "on"}
			{...rest}
			style={{
				...{ color: t.palette.primary_500 },

				...(hovered &&
					!disableUnderline && {
						...{
							outline: 0,
							textDecorationLine: "underline",
							textDecorationColor: flattenedStyle.color ?? t.palette.primary_500,
						},
					}),

				...flattenedStyle,
			}}
			onClick={download ? undefined : onPress}
			onMouseEnter={onHoverIn}
			onMouseLeave={onHoverOut}
			href={href}
			{...{
				hrefAttrs: {
					target: download ? undefined : isExternal ? "blank" : undefined,
					rel: isExternal ? "noopener noreferrer" : undefined,
					download,
				},
				dataSet: {
					// default to no underline, apply this ourselves
					noUnderline: "1",
				},
			}}
		>
			{children}
		</a>
	);
}

export function WebOnlyInlineLinkText({ children, to, onPress, ...props }: Omit<InlineLinkProps, "onLongPress">) {
	return (
		<InlineLinkText {...props} to={to} onPress={onPress}>
			{children}
		</InlineLinkText>
	);
}

/**
 * Utility to create a static `onPress` handler for a `Link` that would otherwise link to a URI
 *
 * Example:
 *   `<Link {...createStaticClick(e => {...})} />`
 */
export function createStaticClick(onPressHandler: Exclude<BaseLinkProps["onPress"], undefined>): {
	to: BaseLinkProps["to"];
	onPress: Exclude<BaseLinkProps["onPress"], undefined>;
} {
	return {
		to: "#",
		onPress(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
			e.preventDefault();
			onPressHandler(e);
			return false;
		},
	};
}

/**
 * Utility to create a static `onPress` handler for a `Link`, but only if the
 * click was not modified in some way e.g. `Cmd` or a middle click.
 *
 * On native, this behaves the same as `createStaticClick` because there are no
 * options to "modify" the click in this sense.
 *
 * Example:
 *   `<Link {...createStaticClick(e => {...})} />`
 */
export function createStaticClickIfUnmodified(onPressHandler: Exclude<BaseLinkProps["onPress"], undefined>): {
	onPress: Exclude<BaseLinkProps["onPress"], undefined>;
} {
	return {
		onPress(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
			if (!isModifiedClickEvent(e)) {
				e.preventDefault();
				onPressHandler(e);
				return false;
			}
		},
	};
}

/**
 * Determines if the click event has a meta key pressed, indicating the user
 * intends to deviate from default behavior.
 */
export function isClickEventWithMetaKey(e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement, MouseEvent>) {
	const event = e;
	return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;
}

/**
 * Determines if the web click target is anything other than `_self`
 */
export function isClickTargetExternal(e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement, MouseEvent>) {
	const event = e;
	const el = event.currentTarget as HTMLAnchorElement;
	return el?.target && el.target !== "_self";
}

/**
 * Determines if a click event has been modified in some way from its default
 * behavior, e.g. `Cmd` or a middle click.
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button}
 */
export function isModifiedClickEvent(e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>): boolean {
	const event = e;
	const isPrimaryButton = event.button === 0;
	return isClickEventWithMetaKey(e) || isClickTargetExternal(e) || !isPrimaryButton;
}

/**
 * Determines if a click event has been modified in a way that should indiciate
 * that the user intends to open a new tab.
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button}
 */
export function shouldClickOpenNewTab(e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement, MouseEvent>) {
	const event = e;
	const isMiddleClick = event.button === 1;
	return isClickEventWithMetaKey(e) || isClickTargetExternal(e) || isMiddleClick;
}
