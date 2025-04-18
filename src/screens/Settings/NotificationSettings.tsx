import { atoms as a } from "#/alf";
import { Admonition } from "#/components/Admonition";
// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
import { Error } from "#/components/Error";
import * as Layout from "#/components/Layout";
import { Loader } from "#/components/Loader";
import * as Toggle from "#/components/forms/Toggle";
import { Beaker_Stroke2_Corner2_Rounded as BeakerIcon } from "#/components/icons/Beaker";
import { useNotificationFeedQuery } from "#/state/queries/notifications/feed";
import { useNotificationSettingsMutation } from "#/state/queries/notifications/settings";
import * as SettingsList from "./components/SettingsList";

export function NotificationSettingsScreen() {
	const {
		data,
		isError: isQueryError,
		refetch,
	} = useNotificationFeedQuery({
		filter: "all",
	});
	const serverPriority = data?.pages.at(0)?.priority;

	const { mutate: onChangePriority, isPending: isMutationPending, variables } = useNotificationSettingsMutation();

	const priority = isMutationPending ? variables[0] === "enabled" : serverPriority;

	return (
		<Layout.Screen>
			<Layout.Header.Outer>
				<Layout.Header.BackButton />
				<Layout.Header.Content>
					<Layout.Header.TitleText>Notification Settings</Layout.Header.TitleText>
				</Layout.Header.Content>
				<Layout.Header.Slot />
			</Layout.Header.Outer>
			<Layout.Content>
				{isQueryError ? (
					<Error title={"Oops!"} message={"Something went wrong!"} onRetry={refetch} sideBorders={false} />
				) : (
					<SettingsList.Container>
						<SettingsList.Group>
							<SettingsList.ItemIcon icon={BeakerIcon} />
							<SettingsList.ItemText>Notification filters</SettingsList.ItemText>
							<Toggle.Group
								label={"Priority notifications"}
								type="checkbox"
								values={priority ? ["enabled"] : []}
								onChange={onChangePriority}
								disabled={typeof priority !== "boolean" || isMutationPending}
							>
								<Toggle.Item
									name="enabled"
									label={"Enable priority notifications"}
									style={{
										...a.flex_1,
										...a.justify_between,
									}}
								>
									<Toggle.LabelText>Enable priority notifications</Toggle.LabelText>
									{!data ? <Loader size="md" /> : <Toggle.Platform />}
								</Toggle.Item>
							</Toggle.Group>
						</SettingsList.Group>
						<SettingsList.Item>
							<Admonition type="warning" style={a.flex_1}>
								<>
									<span style={a.font_bold}>Experimental:</span> When this preference is enabled,
									you'll only receive reply and quote notifications from users you follow. We'll
									continue to add more controls here over time.
								</>
							</Admonition>
						</SettingsList.Item>
					</SettingsList.Container>
				)}
			</Layout.Content>
		</Layout.Screen>
	);
}
