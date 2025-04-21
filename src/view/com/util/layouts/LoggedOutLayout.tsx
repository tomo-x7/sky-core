import type React from "react";
import { Text } from "#/components/Typography";
import { useColorSchemeStyle } from "#/lib/hooks/useColorSchemeStyle";
import { usePalette } from "#/lib/hooks/usePalette";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";

export const LoggedOutLayout = ({
	leadin,
	title,
	description,
	children,
	scrollable,
}: React.PropsWithChildren<{
	leadin: string;
	title: string;
	description: string;
	scrollable?: boolean;
}>) => {
	const { isMobile, isTabletOrMobile } = useWebMediaQueries();
	const pal = usePalette("default");
	const sideBg = useColorSchemeStyle(pal.viewLight, pal.view);
	const contentBg = useColorSchemeStyle(pal.view, {
		backgroundColor: pal.colors.background,
		borderColor: pal.colors.border,
		borderLeftWidth: 1,
	});

	// const [isKeyboardVisible] = useIsKeyboardVisible();

	if (isMobile) {
		if (scrollable) {
			return (
				<div
					// ScrollView
					style={{ flex: 1 }}
					// keyboardShouldPersistTaps="handled"
					// keyboardDismissMode="none"
					// contentContainerStyle={[{ paddingBottom: isKeyboardVisible ? 300 : 0 }]}
				>
					<div style={{ paddingTop: 12 }}>{children}</div>
				</div>
			);
		} else {
			return <div style={{ paddingTop: 12 }}>{children}</div>;
		}
	}
	return (
		<div style={styles.container}>
			<div
				style={{
					...styles.side,
					...sideBg,
				}}
			>
				<Text
					style={{
						...pal.textLight,
						...styles.leadinText,
						...(isTabletOrMobile && styles.leadinTextSmall),
					}}
				>
					{leadin}
				</Text>
				<Text
					style={{
						...pal.link,
						...styles.titleText,
						...(isTabletOrMobile && styles.titleTextSmall),
					}}
				>
					{title}
				</Text>
				<Text
					type="2xl-medium"
					style={{
						...pal.textLight,
						...styles.descriptionText,
					}}
				>
					{description}
				</Text>
			</div>
			{scrollable ? (
				<div
					style={{
						...styles.scrollableContent,
						...contentBg,
					}}
				>
					<div
						// ScrollView
						style={{ flex: 1 }}
						// contentContainerStyle={styles.scrollViewContentContainer}
						// keyboardShouldPersistTaps="handled"
						// keyboardDismissMode="on-drag"
					>
						<div
							style={{
								...styles.contentWrapper,
								marginTop: "auto",
								marginBottom: "auto",
							}}
						>
							{children}
						</div>
					</div>
				</div>
			) : (
				<div
					style={{
						...styles.content,
						...contentBg,
					}}
				>
					<div style={styles.contentWrapper}>{children}</div>
				</div>
			)}
		</div>
	);
};

const styles = {
	container: {
		flexDirection: "row",
		height: "100dvh",
	},
	side: {
		flex: 1,
		paddingLeft: 40,
		paddingRight: 40,
		paddingBottom: 80,
		justifyContent: "center",
	},
	content: {
		flex: 2,
		paddingLeft: 40,
		paddingRight: 40,
		justifyContent: "center",
	},
	scrollableContent: {
		flex: 2,
	},
	scrollViewContentContainer: {
		flex: 1,
		paddingLeft: 40,
		paddingRight: 40,
	},
	leadinText: {
		fontSize: 36,
		fontWeight: "800",
		textAlign: "right",
	},
	leadinTextSmall: {
		fontSize: 24,
	},
	titleText: {
		fontSize: 58,
		fontWeight: "800",
		textAlign: "right",
	},
	titleTextSmall: {
		fontSize: 36,
	},
	descriptionText: {
		maxWidth: 400,
		marginTop: 10,
		marginLeft: "auto",
		textAlign: "right",
	},
	contentWrapper: {
		maxWidth: 600,
	},
} satisfies Record<string, React.CSSProperties>;
