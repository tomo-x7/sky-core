import ActivityIndicator from "#/components/ActivityIndicator";
import * as Layout from "#/components/Layout";
import { s } from "#/lib/styles";

/**
 * @deprecated use Layout compoenents directly
 */
export function LoadingScreen() {
	return (
		<Layout.Content>
			<div style={s.p20}>
				<ActivityIndicator size={24} /*"large"*/ />
			</div>
		</Layout.Content>
	);
}
