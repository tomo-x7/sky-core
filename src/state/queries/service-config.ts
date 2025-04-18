import { useQuery } from "@tanstack/react-query";

import { hasOwn } from "#/lib/util";
import { STALE } from "#/state/queries";
import { useAgent } from "#/state/session";

type ServiceConfig = {
	checkEmailConfirmed: boolean;
	topicsEnabled: boolean;
};

export function useServiceConfigQuery() {
	const agent = useAgent();
	return useQuery<ServiceConfig>({
		refetchOnWindowFocus: true,
		staleTime: STALE.MINUTES.FIVE,
		queryKey: ["service-config"],
		queryFn: async () => {
			try {
				const { data } = await agent.api.app.bsky.unspecced.getConfig();
				return {
					checkEmailConfirmed: Boolean(data.checkEmailConfirmed),
					topicsEnabled: Boolean(hasOwn(data, "topicsEnabled") && data.topicsEnabled),
				};
			} catch (e) {
				return {
					checkEmailConfirmed: false,
					topicsEnabled: false,
				};
			}
		},
	});
}
