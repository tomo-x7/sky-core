import { StackActions, useFocusEffect, useNavigation } from "@react-navigation/native";
import React from "react";

import * as Layout from "#/components/Layout";
import { Text } from "#/components/Typography";
import { usePalette } from "#/lib/hooks/usePalette";
import type { NavigationProp } from "#/lib/routes/types";
import { s } from "#/lib/styles";
import { useSetMinimalShellMode } from "#/state/shell";
import { ViewHeader } from "#/view/com/util/ViewHeader";
import { Button } from "#/view/com/util/forms/Button";

export const NotFoundScreen = () => {
	const pal = usePalette("default");
	const navigation = useNavigation<NavigationProp>();
	const setMinimalShellMode = useSetMinimalShellMode();

	useFocusEffect(
		React.useCallback(() => {
			setMinimalShellMode(false);
		}, [setMinimalShellMode]),
	);

	const canGoBack = navigation.canGoBack();
	const onPressHome = React.useCallback(() => {
		if (canGoBack) {
			navigation.goBack();
		} else {
			navigation.navigate("HomeTab");
			navigation.dispatch(StackActions.popToTop());
		}
	}, [navigation, canGoBack]);

	return (
		<Layout.Screen>
			<ViewHeader title={"Page Not Found"} />
			<div style={styles.container}>
				<Text
					type="title-2xl"
					style={{
						...pal.text,
						...s.mb10,
					}}
				>
					Page not found
				</Text>
				<Text
					type="md"
					style={{
						...pal.text,
						...s.mb10,
					}}
				>
					We're sorry! We can't find the page you were looking for.
				</Text>
				<Button
					type="primary"
					label={canGoBack ? "Go Back" : "Go Home"}
					accessibilityLabel={canGoBack ? "Go back" : "Go home"}
					accessibilityHint={canGoBack ? "Returns to previous page" : "Returns to home page"}
					onPress={onPressHome}
				/>
			</div>
		</Layout.Screen>
	);
};

const styles = {
	container: {
		paddingTop: 100,
		paddingLeft: 20,
		paddingRight: 20,
		alignItems: "center",
		height: "100%",
	},
} satisfies Record<string, React.CSSProperties>;
