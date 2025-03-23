import React from "react";
import { useFocusEffect } from "#/components/hooks/useFocusEffect";

import { useNavigate } from "react-router-dom";
import * as Layout from "#/components/Layout";
import { Text } from "#/components/Typography";
import { usePalette } from "#/lib/hooks/usePalette";
import { s } from "#/lib/styles";
import { useSetMinimalShellMode } from "#/state/shell";
import { ViewHeader } from "#/view/com/util/ViewHeader";
import { Button } from "#/view/com/util/forms/Button";

export const NotFoundScreen = () => {
	const pal = usePalette("default");
	const setMinimalShellMode = useSetMinimalShellMode();
	const navigate = useNavigate();

	useFocusEffect(
		React.useCallback(() => {
			setMinimalShellMode(false);
		}, [setMinimalShellMode]),
	);
	const canGoBack = history.length > 1;
	const onPressHome = React.useCallback(() => {
		if (canGoBack) {
			navigate(-1);
		} else {
			navigate("/");
			// navigation.dispatch(StackActions.popToTop());
		}
	}, [navigate, canGoBack]);

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
