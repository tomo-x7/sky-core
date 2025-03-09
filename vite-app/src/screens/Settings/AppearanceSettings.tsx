import type React from "react";
import { useCallback } from "react";
import Animated, { FadeInUp, FadeOutUp, LayoutAnimationConfig, LinearTransition } from "react-native-reanimated";

import { atoms as a, native, useAlf, useTheme } from "#/alf";
import * as Layout from "#/components/Layout";
import { Text } from "#/components/Typography";
import * as ToggleButton from "#/components/forms/ToggleButton";
import { Moon_Stroke2_Corner0_Rounded as MoonIcon } from "#/components/icons/Moon";
import { Phone_Stroke2_Corner0_Rounded as PhoneIcon } from "#/components/icons/Phone";
import { TextSize_Stroke2_Corner0_Rounded as TextSize } from "#/components/icons/TextSize";
import { TitleCase_Stroke2_Corner0_Rounded as Aa } from "#/components/icons/TitleCase";
import type { Props as SVGIconProps } from "#/components/icons/common";
import type { CommonNavigatorParams, NativeStackScreenProps } from "#/lib/routes/types";
import { useSetThemePrefs, useThemePrefs } from "#/state/shell";
import * as SettingsList from "./components/SettingsList";

type Props = NativeStackScreenProps<CommonNavigatorParams, "AppearanceSettings">;
export function AppearanceSettingsScreen(props: Props) {
	const { fonts } = useAlf();

	const { colorMode, darkTheme } = useThemePrefs();
	const { setColorMode, setDarkTheme } = useSetThemePrefs();

	const onChangeAppearance = useCallback(
		(keys: string[]) => {
			const appearance = keys.find((key) => key !== colorMode) as "system" | "light" | "dark" | undefined;
			if (!appearance) return;
			setColorMode(appearance);
		},
		[setColorMode, colorMode],
	);

	const onChangeDarkTheme = useCallback(
		(keys: string[]) => {
			const theme = keys.find((key) => key !== darkTheme) as "dim" | "dark" | undefined;
			if (!theme) return;
			setDarkTheme(theme);
		},
		[setDarkTheme, darkTheme],
	);

	const onChangeFontFamily = useCallback(
		(values: string[]) => {
			const next = values[0] === "system" ? "system" : "theme";
			fonts.setFontFamily(next);
		},
		[fonts],
	);

	const onChangeFontScale = useCallback(
		(values: string[]) => {
			const next = values[0] || ("0" as any);
			fonts.setFontScale(next);
		},
		[fonts],
	);

	return (
		<LayoutAnimationConfig skipExiting skipEntering>
			<Layout.Screen testID="preferencesThreadsScreen">
				<Layout.Header.Outer>
					<Layout.Header.BackButton />
					<Layout.Header.Content>
						<Layout.Header.TitleText>Appearance</Layout.Header.TitleText>
					</Layout.Header.Content>
					<Layout.Header.Slot />
				</Layout.Header.Outer>
				<Layout.Content>
					<SettingsList.Container>
						<AppearanceToggleButtonGroup
							title={"Color mode"}
							icon={PhoneIcon}
							items={[
								{
									label: "System",
									name: "system",
								},
								{
									label: "Light",
									name: "light",
								},
								{
									label: "Dark",
									name: "dark",
								},
							]}
							values={[colorMode]}
							onChange={onChangeAppearance}
						/>

						{colorMode !== "light" && (
							<Animated.View entering={native(FadeInUp)} exiting={native(FadeOutUp)}>
								<AppearanceToggleButtonGroup
									title={"Dark theme"}
									icon={MoonIcon}
									items={[
										{
											label: "Dim",
											name: "dim",
										},
										{
											label: "Dark",
											name: "dark",
										},
									]}
									values={[darkTheme ?? "dim"]}
									onChange={onChangeDarkTheme}
								/>
							</Animated.View>
						)}

						<Animated.View layout={native(LinearTransition)}>
							<SettingsList.Divider />

							<AppearanceToggleButtonGroup
								title={"Font"}
								description={"For the best experience, we recommend using the theme font."}
								icon={Aa}
								items={[
									{
										label: "System",
										name: "system",
									},
									{
										label: "Theme",
										name: "theme",
									},
								]}
								values={[fonts.family]}
								onChange={onChangeFontFamily}
							/>

							<AppearanceToggleButtonGroup
								title={"Font size"}
								icon={TextSize}
								items={[
									{
										label: "Smaller",
										name: "-1",
									},
									{
										label: "Default",
										name: "0",
									},
									{
										label: "Larger",
										name: "1",
									},
								]}
								values={[fonts.scale]}
								onChange={onChangeFontScale}
							/>
						</Animated.View>
					</SettingsList.Container>
				</Layout.Content>
			</Layout.Screen>
		</LayoutAnimationConfig>
	);
}

export function AppearanceToggleButtonGroup({
	title,
	description,
	icon: Icon,
	items,
	values,
	onChange,
}: {
	title: string;
	description?: string;
	icon: React.ComponentType<SVGIconProps>;
	items: {
		label: string;
		name: string;
	}[];
	values: string[];
	onChange: (values: string[]) => void;
}) {
	const t = useTheme();
	return (
		<>
			<SettingsList.Group contentContainerStyle={[a.gap_sm]} iconInset={false}>
				<SettingsList.ItemIcon icon={Icon} />
				<SettingsList.ItemText>{title}</SettingsList.ItemText>
				{description && (
					<Text style={[a.text_sm, a.leading_snug, t.atoms.text_contrast_medium, a.w_full]}>
						{description}
					</Text>
				)}
				<ToggleButton.Group label={title} values={values} onChange={onChange}>
					{items.map((item) => (
						<ToggleButton.Button key={item.name} label={item.label} name={item.name}>
							<ToggleButton.ButtonText>{item.label}</ToggleButton.ButtonText>
						</ToggleButton.Button>
					))}
				</ToggleButton.Group>
			</SettingsList.Group>
		</>
	);
}
