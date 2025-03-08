import { useLingui } from "@lingui/react";
import { useMemo } from "react";

import type { CommonNavigatorParams, NativeStackScreenProps } from "#/lib/routes/types";
import { useProfileQuery } from "#/state/queries/profile";
import { useResolveDidQuery } from "#/state/queries/resolve-uri";
import { useSession } from "#/state/session";
import { SearchScreenShell } from "#/view/screens/Search/Search";

type Props = NativeStackScreenProps<CommonNavigatorParams, "ProfileSearch">;
export const ProfileSearchScreen = ({ route }: Props) => {
	const { name, q: queryParam = "" } = route.params;
	const { _ } = useLingui();
	const { currentAccount } = useSession();

	const { data: resolvedDid } = useResolveDidQuery(name);
	const { data: profile } = useProfileQuery({ did: resolvedDid });

	const fixedParams = useMemo(
		() => ({
			from: profile?.handle ?? name,
		}),
		[profile?.handle, name],
	);

	return (
		<SearchScreenShell
			navButton="back"
			inputPlaceholder={
				profile
					? currentAccount?.did === profile.did
						? "Search my posts"
						: `Search @${profile.handle}'s posts`
					: "Search..."
			}
			fixedParams={fixedParams}
			queryParam={queryParam}
			testID="searchPostsScreen"
		/>
	);
};
