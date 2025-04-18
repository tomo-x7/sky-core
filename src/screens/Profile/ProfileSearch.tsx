import { useMemo } from "react";

import { useParams, useSearchParams } from "react-router-dom";
import type { RouteParam } from "#/lib/routes/types";
import { useProfileQuery } from "#/state/queries/profile";
import { useResolveDidQuery } from "#/state/queries/resolve-uri";
import { useSession } from "#/state/session";
import { SearchScreenShell } from "#/view/screens/Search/Search";

export const ProfileSearchScreen = () => {
	const { name } = useParams<RouteParam<"ProfileSearch">>();
	const queryParam = useSearchParams()[0].get("q") ?? "";
	const { currentAccount } = useSession();

	const { data: resolvedDid } = useResolveDidQuery(name);
	const { data: profile } = useProfileQuery({ did: resolvedDid });

	const fixedParams = useMemo(
		() => ({
			from: profile?.handle ?? name!,
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
		/>
	);
};
