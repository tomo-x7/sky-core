import { sanitizeUrl } from "@braintree/sanitize-url";
import React, { type JSX, memo, useMemo } from "react";
import { type NavigateFunction, useNavigate } from "react-router-dom";
import { Text } from "#/components/Typography";
import type { TypographyVariant } from "#/lib/ThemeContext";
import { useOpenLink } from "#/lib/hooks/useOpenLink";
import { convertBskyAppUrlIfNeeded, isExternalUrl, linkRequiresWarning } from "#/lib/strings/url-helpers";
import { useModalControls } from "#/state/modals";
import { WebAuxClickWrapper } from "#/view/com/util/WebAuxClickWrapper";
import { router } from "../../../routes";
import { PressableWithHover, PressableWithoutHover } from "./PressableWithHover";

type Event = React.MouseEvent<HTMLAnchorElement, MouseEvent>;

interface Props {
	style?: React.CSSProperties;
	href?: string;
	title?: string;
	children?: React.ReactNode;
	hoverStyle?: React.CSSProperties;
	noFeedback?: boolean;
	asAnchor?: boolean;
	dataset?: object | undefined;
	anchorNoUnderline?: boolean;
	navigationAction?: "push" | "replace" | "navigate";
	onPointerEnter?: () => void;
	onPointerLeave?: () => void;
	onBeforePress?: () => void;
}

export const Link = memo(function Link({
	style,
	href,
	title,
	children,
	noFeedback,
	asAnchor,
	anchorNoUnderline,
	navigationAction,
	onBeforePress,
	...props
}: Props) {
	const { closeModal } = useModalControls();
	// const navigation = useNavigationDeduped();
	const anchorHref = asAnchor ? sanitizeUrl(href) : undefined;
	const openLink = useOpenLink();
	const navigate = useNavigate();

	const onPress = React.useCallback(
		(e?: React.MouseEvent<HTMLAnchorElement>) => {
			onBeforePress?.();
			if (typeof href === "string") {
				return onPressInner(closeModal, navigate, sanitizeUrl(href), navigationAction, openLink, e);
			}
		},
		[closeModal, navigate, navigationAction, href, openLink, onBeforePress],
	);

	if (noFeedback) {
		return (
			<WebAuxClickWrapper>
				<a
					// biome-ignore lint/a11y/useValidAnchor: <explanation>
					onClick={onPress}
					{...props}
				>
					<a style={style} href={anchorHref}>
						{children ? children : <Text>{title || "link"}</Text>}
					</a>
				</a>
			</WebAuxClickWrapper>
		);
	}

	if (anchorNoUnderline) {
		props.dataset = { ...props.dataset, noUnderline: 1 };
	}

	const Com = props.hoverStyle ? PressableWithHover : PressableWithoutHover;
	return (
		<Com style={style} onPress={onPress} href={anchorHref} {...props} {...parseDataset(props.dataset)}>
			{children ? children : <Text>{title || "link"}</Text>}
		</Com>
	);
});

function parseDataset(dataset: object | undefined) {
	if (dataset == null) return {};
	const result: Record<string, unknown> = {};
	for (const [k, v] of Object.entries(dataset)) {
		result[`data-${k}`] = v;
	}
	return result;
}

export const TextLink = memo(function TextLink({
	type = "md",
	style,
	href,
	text,
	numberOfLines,
	lineHeight,
	dataset,
	title,
	onPress: onPressOuter,
	onBeforePress,
	disableMismatchWarning,
	navigationAction,
	anchorNoUnderline,
	...orgProps
}: {
	type?: TypographyVariant;
	style?: React.CSSProperties;
	href: string;
	text: string | JSX.Element | React.ReactNode;
	numberOfLines?: number;
	lineHeight?: number;
	dataset?: any;
	title?: string;
	disableMismatchWarning?: boolean;
	navigationAction?: "push" | "replace" | "navigate";
	anchorNoUnderline?: boolean;
	onBeforePress?: () => void;
	onPress?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
	// const { ...props } = useLinkProps({ to: sanitizeUrl(href) });
	// const navigation = useNavigationDeduped();
	const { openModal, closeModal } = useModalControls();
	const openLink = useOpenLink();
	const navigate = useNavigate();

	if (!disableMismatchWarning && typeof text !== "string") {
		console.error("Unable to detect mismatching label");
	}

	if (anchorNoUnderline) {
		dataset = dataset ?? {};
		dataset.noUnderline = 1;
	}

	const onPress = React.useCallback(
		(e?: React.MouseEvent<HTMLAnchorElement>) => {
			const requiresWarning =
				!disableMismatchWarning && linkRequiresWarning(href, typeof text === "string" ? text : "");
			if (requiresWarning) {
				e?.preventDefault?.();
				openModal({
					name: "link-warning",
					text: typeof text === "string" ? text : "",
					href,
				});
			}
			if (href !== "#" && e != null && isModifiedEvent(e)) {
				// Let the browser handle opening in new tab etc.
				return;
			}
			onBeforePress?.();
			if (onPressOuter) {
				e?.preventDefault?.();
				// @ts-expect-error function signature differs by platform -prf
				return onPressOuter();
			}
			return onPressInner(closeModal, navigate, sanitizeUrl(href), navigationAction, openLink, e);
		},
		[
			onBeforePress,
			onPressOuter,
			closeModal,
			openModal,
			navigate,
			href,
			text,
			disableMismatchWarning,
			navigationAction,
			openLink,
		],
	);
	const hrefAttrs = useMemo(() => {
		const isExternal = isExternalUrl(href);
		if (isExternal) {
			return {
				target: "_blank",
				rel: "noopener noreferrer",
			};
		}
		return {};
	}, [href]);

	return (
		<Text
			type={type}
			style={style}
			numberOfLines={numberOfLines}
			lineHeight={lineHeight}
			dataset={dataset}
			title={title}
			{...orgProps}
		>
			<a href={href} onClick={onPress} {...hrefAttrs}>
				{text}
			</a>
		</Text>
	);
});

/**
 * Only acts as a link on desktop web
 */
interface TextLinkOnWebOnlyProps {
	type?: TypographyVariant;
	style?: React.CSSProperties;
	href: string;
	text: string | JSX.Element;
	numberOfLines?: number;
	lineHeight?: number;
	accessible?: boolean;
	accessibilityLabel?: string;
	accessibilityHint?: string;
	title?: string;
	navigationAction?: "push" | "replace" | "navigate";
	disableMismatchWarning?: boolean;
	onBeforePress?: () => void;
	onPointerEnter?: () => void;
	anchorNoUnderline?: boolean;
}
export const TextLinkOnWebOnly = memo(function DesktopWebTextLink({
	type = "md",
	style,
	href,
	text,
	numberOfLines,
	lineHeight,
	navigationAction,
	disableMismatchWarning,
	onBeforePress,
	...props
}: TextLinkOnWebOnlyProps) {
	return (
		<TextLink
			type={type}
			style={style}
			href={href}
			text={text}
			numberOfLines={numberOfLines}
			lineHeight={lineHeight}
			title={props.title}
			navigationAction={navigationAction}
			disableMismatchWarning={disableMismatchWarning}
			onBeforePress={onBeforePress}
			{...props}
		/>
	);
});

const EXEMPT_PATHS = ["/robots.txt", "/security.txt", "/.well-known/"];

// NOTE
// we can't use the onPress given by useLinkProps because it will
// match most paths to the HomeTab routes while we actually want to
// preserve the tab the app is currently in
//
// we also have some additional behaviors - closing the current modal,
// converting bsky urls, and opening http/s links in the system browser
//
// this method copies from the onPress implementation but adds our
// needed customizations
// -prf
function onPressInner(
	// biome-ignore lint/style/useDefaultParameterLast: <explanation>
	closeModal = () => {},
	navigate: NavigateFunction,
	href: string,
	// biome-ignore lint/style/useDefaultParameterLast: <explanation>
	navigationAction: "push" | "replace" | "navigate" | undefined = "push",
	openLink: (href: string) => void,
	e?: React.MouseEvent<HTMLAnchorElement>,
) {
	let shouldHandle = false;
	const isLeftClick = e?.button == null || e?.button === 0;
	const isMiddleClick = e?.button === 1;
	const isMetaKey = e?.metaKey || e?.altKey || e?.ctrlKey || e?.shiftKey;
	const newTab = isMetaKey || isMiddleClick;

	if (!e) {
		shouldHandle = true;
	} else if (
		!e.defaultPrevented && // onPress prevented default
		(isLeftClick || isMiddleClick) && // ignore everything but left and middle clicks
		[undefined, null, "", "self"].includes(e.currentTarget?.target) // let browser handle "target=_blank" etc.
	) {
		e.preventDefault();
		shouldHandle = true;
	}

	if (shouldHandle) {
		href = convertBskyAppUrlIfNeeded(href);
		if (
			newTab ||
			href.startsWith("http") ||
			href.startsWith("mailto") ||
			EXEMPT_PATHS.some((path) => href.startsWith(path))
		) {
			openLink(href);
		} else {
			closeModal(); // close any active modals

			const [routeName, params] = router.matchPath(href);
			if (navigationAction === "push") {
				navigate(href);
				// navigation.dispatch(StackActions.push(routeName, params));
			} else if (navigationAction === "replace") {
				navigate(href, { replace: true });
				// navigation.dispatch(StackActions.replace(routeName, params));
			} else if (navigationAction === "navigate") {
				// const state = navigation.getState();
				// const tabState = getTabState(state, routeName);
				// if (tabState === TabState.InsideAtRoot) {
				// 	emitSoftReset();
				// } else {
				navigate(href);
				// navigation.navigate(routeName, params);
				// }
			} else {
				throw Error("Unsupported navigator action.");
			}
		}
	}
}

function isModifiedEvent(e: React.MouseEvent): boolean {
	const eventTarget = e.currentTarget as HTMLAnchorElement;
	const target = eventTarget.getAttribute("target");
	return (
		(target && target !== "_self") ||
		e.metaKey ||
		e.ctrlKey ||
		e.shiftKey ||
		e.altKey ||
		(e.nativeEvent && e.nativeEvent.which === 2)
	);
}
