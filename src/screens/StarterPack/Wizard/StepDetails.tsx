import { useTheme } from "#/alf";
import { ScreenTransition } from "#/components/StarterPack/Wizard/ScreenTransition";
import { Text } from "#/components/Typography";
import * as TextField from "#/components/forms/TextField";
import { StarterPack } from "#/components/icons/StarterPack";
import { useWizardState } from "#/screens/StarterPack/Wizard/State";
import { useProfileQuery } from "#/state/queries/profile";
import { useSession } from "#/state/session";

export function StepDetails() {
	const t = useTheme();
	const [state, dispatch] = useWizardState();

	const { currentAccount } = useSession();
	const { data: currentProfile } = useProfileQuery({
		did: currentAccount?.did,
		staleTime: 300,
	});

	return (
		<ScreenTransition direction={state.transitionDirection}>
			<div
				style={{
					paddingLeft: 20,
					paddingRight: 20,
					gap: 20,
					marginTop: 32,
				}}
			>
				<div
					style={{
						gap: 12,
						alignItems: "center",
						paddingLeft: 12,
						paddingRight: 12,
						marginBottom: 12,
					}}
				>
					<StarterPack width={90} gradient="sky" />
					<Text
						style={{
							fontWeight: "600",
							fontSize: 26,
							letterSpacing: 0,
						}}
					>
						Invites, but personal
					</Text>
					<Text
						style={{
							textAlign: "center",
							fontSize: 16,
							letterSpacing: 0,
							paddingLeft: 12,
							paddingRight: 12,
						}}
					>
						Invite your friends to follow your favorite feeds and people
					</Text>
				</div>
				<div>
					<TextField.LabelText>What do you want to call your starter pack?</TextField.LabelText>
					<TextField.Root>
						<TextField.Input
							label={`${currentProfile?.displayName || currentProfile?.handle}'s starter pack`}
							value={state.name}
							onChangeText={(text) => dispatch({ type: "SetName", name: text })}
						/>
						<TextField.SuffixText>
							<Text style={t.atoms.text_contrast_medium}>{state.name?.length ?? 0}/50</Text>
						</TextField.SuffixText>
					</TextField.Root>
				</div>
				<div>
					<TextField.LabelText>Tell us a little more</TextField.LabelText>
					<TextField.Root>
						<TextField.Input
							label={`${
								currentProfile?.displayName || currentProfile?.handle
							}'s favorite feeds and people - join me!`}
							value={state.description}
							onChangeText={(text) => dispatch({ type: "SetDescription", description: text })}
							multiline
							style={{ minHeight: 150 }}
						/>
					</TextField.Root>
				</div>
			</div>
		</ScreenTransition>
	);
}
