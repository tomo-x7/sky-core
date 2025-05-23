import React from "react";

import { useNavigate } from "react-router-dom";
import { ThemeProvider } from "#/alf";
import { Button, ButtonText } from "#/components/Button";
import * as Layout from "#/components/Layout";
import { useSetThemePrefs } from "#/state/shell";
import { ListContained } from "#/view/screens/Storybook/ListContained";
import { Admonitions } from "./Admonitions";
import { Breakpoints } from "./Breakpoints";
import { Buttons } from "./Buttons";
import { Dialogs } from "./Dialogs";
import { Forms } from "./Forms";
import { Icons } from "./Icons";
import { Links } from "./Links";
import { Menus } from "./Menus";
import { Settings } from "./Settings";
import { Shadows } from "./Shadows";
import { Spacing } from "./Spacing";
import { Theming } from "./Theming";
import { Typography } from "./Typography";

export function Storybook() {
	return (
		<Layout.Screen>
			<Layout.Header.Outer>
				<Layout.Header.BackButton />
				<Layout.Header.Content>
					<Layout.Header.TitleText>Storybook</Layout.Header.TitleText>
				</Layout.Header.Content>
				<Layout.Header.Slot />
			</Layout.Header.Outer>
			<Layout.Content
			// keyboardShouldPersistTaps="handled"
			>
				<StorybookInner />
			</Layout.Content>
		</Layout.Screen>
	);
}

function StorybookInner() {
	const { setColorMode, setDarkTheme } = useSetThemePrefs();
	const [showContainedList, setShowContainedList] = React.useState(false);
	const navigate = useNavigate();

	return (
		<>
			<div
				style={{
					padding: 20,
					gap: 40,
					...{ paddingBottom: 100 },
				}}
			>
				{!showContainedList ? (
					<>
						<div
							style={{
								flexDirection: "row",
								alignItems: "flex-start",
								gap: 12,
							}}
						>
							<Button
								variant="outline"
								color="primary"
								size="small"
								label='Set theme to "system"'
								onPress={() => setColorMode("system")}
							>
								<ButtonText>System</ButtonText>
							</Button>
							<Button
								variant="solid"
								color="secondary"
								size="small"
								label='Set theme to "light"'
								onPress={() => setColorMode("light")}
							>
								<ButtonText>Light</ButtonText>
							</Button>
							<Button
								variant="solid"
								color="secondary"
								size="small"
								label='Set theme to "dim"'
								onPress={() => {
									setColorMode("dark");
									setDarkTheme("dim");
								}}
							>
								<ButtonText>Dim</ButtonText>
							</Button>
							<Button
								variant="solid"
								color="secondary"
								size="small"
								label='Set theme to "dark"'
								onPress={() => {
									setColorMode("dark");
									setDarkTheme("dark");
								}}
							>
								<ButtonText>Dark</ButtonText>
							</Button>
						</div>

						<Button
							variant="solid"
							color="primary"
							size="small"
							onPress={() => /*navigation.navigate("SharedPreferencesTester")*/ void 0}
							label="two"
						>
							<ButtonText>Open Shared Prefs Tester</ButtonText>
						</Button>

						<ThemeProvider theme="light">
							<Theming />
						</ThemeProvider>
						<ThemeProvider theme="dim">
							<Theming />
						</ThemeProvider>
						<ThemeProvider theme="dark">
							<Theming />
						</ThemeProvider>

						<Forms />
						<Buttons />
						<Typography />
						<Spacing />
						<Shadows />
						<Buttons />
						<Icons />
						<Links />
						<Dialogs />
						<Menus />
						<Breakpoints />
						<Dialogs />
						<Admonitions />
						<Settings />

						<Button
							variant="solid"
							color="primary"
							size="large"
							label="Switch to Contained List"
							onPress={() => setShowContainedList(true)}
						>
							<ButtonText>Switch to Contained List</ButtonText>
						</Button>
					</>
				) : (
					<>
						<Button
							variant="solid"
							color="primary"
							size="large"
							label="Switch to Storybook"
							onPress={() => setShowContainedList(false)}
						>
							<ButtonText>Switch to Storybook</ButtonText>
						</Button>
						<ListContained />
					</>
				)}
			</div>
		</>
	);
}
