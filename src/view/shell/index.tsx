import { useEffect, useLayoutEffect, useState } from "react";
import { RemoveScrollBar } from "react-remove-scroll-bar";
import { OutletWrapper } from "#/Navigation";
import { select, useTheme } from "#/alf";
import { Outlet as PortalOutlet } from "#/components/Portal";
import { MutedWordsDialog } from "#/components/dialogs/MutedWords";
import { SigninDialog } from "#/components/dialogs/Signin";
import { useColorSchemeStyle } from "#/lib/hooks/useColorSchemeStyle";
import { useIntentHandler } from "#/lib/hooks/useIntentHandler";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { colors } from "#/lib/styles";
import { useIsDrawerOpen, useSetDrawerOpen } from "#/state/shell";
import { useComposerKeyboardShortcut } from "#/state/shell/composer/useComposerKeyboardShortcut";
import { useCloseAllActiveElements } from "#/state/util";
import { Lightbox } from "#/view/com/lightbox/Lightbox";
import { ModalsContainer } from "#/view/com/modals/Modal";
import { ErrorBoundary } from "#/view/com/util/ErrorBoundary";
import { Composer } from "./Composer";
import { DrawerContent } from "./Drawer";

function ShellInner() {
	const t = useTheme();
	const isDrawerOpen = useIsDrawerOpen();
	const setDrawerOpen = useSetDrawerOpen();
	const { isDesktop } = useWebMediaQueries();
	const closeAllActiveElements = useCloseAllActiveElements();
	const showDrawer = !isDesktop && isDrawerOpen;
	const [showDrawerDelayedExit, setShowDrawerDelayedExit] = useState(showDrawer);

	useLayoutEffect(() => {
		if (showDrawer !== showDrawerDelayedExit) {
			if (showDrawer) {
				setShowDrawerDelayedExit(true);
			} else {
				const timeout = setTimeout(() => {
					setShowDrawerDelayedExit(false);
				}, 160);
				return () => clearTimeout(timeout);
			}
		}
	}, [showDrawer, showDrawerDelayedExit]);

	useComposerKeyboardShortcut();
	useIntentHandler();

	// biome-ignore lint/correctness/useExhaustiveDependencies: pathnameを検知するため
	useEffect(() => {
		closeAllActiveElements();
	}, [location.pathname, closeAllActiveElements]);

	return (
		<>
			<ErrorBoundary>
				<main style={{ flex: 1 }}>
					<OutletWrapper />
					{/* <ScrollRestoration
						getKey={(location, matches) => {
							return location.pathname;
						}}
					/> */}
				</main>
			</ErrorBoundary>
			<Composer winHeight={0} />
			<ModalsContainer />
			<MutedWordsDialog />
			<SigninDialog />
			<Lightbox />
			<PortalOutlet />
			{showDrawerDelayedExit && (
				<>
					<RemoveScrollBar />
					<button
						type="button"
						onClick={(ev) => {
							// Only close if press happens outside of the drawer
							if (ev.target === ev.currentTarget) {
								setDrawerOpen(false);
							}
						}}
					>
						<div
							style={{
								...styles.drawerMask,

								...{
									backgroundColor: showDrawer
										? select(t.name, {
												light: "rgba(0, 57, 117, 0.1)",
												dark: "rgba(1, 82, 168, 0.1)",
												dim: "rgba(10, 13, 16, 0.8)",
											})
										: "transparent",
								},

								transitionProperty:
									"color, background-color, border-color, text-decoration-color, fill, stroke",
								transitionTimingFunction: "cubic-bezier(0.17, 0.73, 0.14, 1)",
								transitionDuration: "100ms",
							}}
						>
							<div
								style={{
									...styles.drawerContainer,
									...(showDrawer
										? { animation: "slideInLeft cubic-bezier(0.16, 1, 0.3, 1) 0.5s" }
										: { animation: "slideOutLeft ease-in 0.15s", animationFillMode: "forwards" }),
								}}
							>
								<DrawerContent />
							</div>
						</div>
					</button>
				</>
			)}
		</>
	);
}

export const Shell: React.FC = function ShellImpl() {
	const pageBg = useColorSchemeStyle(styles.bgLight, styles.bgDark);
	return (
		<div
			style={{
				minHeight: "100dvh",
				...pageBg,
			}}
		>
			{/* <RoutesContainer> */}
			<ShellInner />
			{/* </RoutesContainer> */}
		</div>
	);
};

const styles = {
	bgLight: {
		backgroundColor: colors.white,
	},
	bgDark: {
		backgroundColor: colors.black, // TODO
	},
	drawerMask: {
		position: "fixed",
		width: "100%",
		height: "100%",
		top: 0,
		left: 0,
	},
	drawerContainer: {
		display: "flex",
		position: "fixed",
		top: 0,
		left: 0,
		height: "100%",
		width: 330,
		maxWidth: "80%",
	},
} satisfies Record<string, React.CSSProperties>;
