import { ActivityIndicator, View } from "react-native";

import * as Layout from "#/components/Layout";
import { s } from "#/lib/styles";

/**
 * @deprecated use Layout compoenents directly
 */
export function LoadingScreen() {
	return (
		<Layout.Content>
			<View style={s.p20}>
				<ActivityIndicator size="large" />
			</View>
		</Layout.Content>
	);
}
