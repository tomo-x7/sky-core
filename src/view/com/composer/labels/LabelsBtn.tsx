import { atoms as a, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import { Text } from "#/components/Typography";
import * as Toggle from "#/components/forms/Toggle";
import { Check_Stroke2_Corner0_Rounded as Check } from "#/components/icons/Check";
import { Shield_Stroke2_Corner0_Rounded } from "#/components/icons/Shield";
import { Keyboard } from "#/lib/Keyboard";
import {
	ADULT_CONTENT_LABELS,
	type AdultSelfLabel,
	OTHER_SELF_LABELS,
	type OtherSelfLabel,
	type SelfLabel,
} from "#/lib/moderation";

export function LabelsBtn({
	labels,
	onChange,
}: {
	labels: SelfLabel[];
	onChange: (v: SelfLabel[]) => void;
}) {
	const control = Dialog.useDialogControl();

	const hasLabel = labels.length > 0;

	const updateAdultLabels = (newLabels: AdultSelfLabel[]) => {
		const newLabel = newLabels[newLabels.length - 1];
		const filtered = labels.filter((l) => !ADULT_CONTENT_LABELS.includes(l));
		onChange([...new Set([...filtered, newLabel].filter(Boolean) as SelfLabel[])]);
	};

	const updateOtherLabels = (newLabels: OtherSelfLabel[]) => {
		const newLabel = newLabels[newLabels.length - 1];
		const filtered = labels.filter((l) => !OTHER_SELF_LABELS.includes(l));
		onChange([...new Set([...filtered, newLabel].filter(Boolean) as SelfLabel[])]);
	};

	return (
		<>
			<Button
				variant="solid"
				color="secondary"
				size="small"
				onPress={() => {
					Keyboard.dismiss();
					control.open();
				}}
				label={"Content warnings"}
			>
				<ButtonIcon icon={hasLabel ? Check : Shield_Stroke2_Corner0_Rounded} />
				<ButtonText /*numberOfLines={1}  //TODO*/>
					{labels.length > 0 ? <>Labels added</> : <>Labels</>}
				</ButtonText>
			</Button>

			<Dialog.Outer control={control}>
				<Dialog.Handle />
				<DialogInner
					labels={labels}
					updateAdultLabels={updateAdultLabels}
					updateOtherLabels={updateOtherLabels}
				/>
			</Dialog.Outer>
		</>
	);
}

function DialogInner({
	labels,
	updateAdultLabels,
	updateOtherLabels,
}: {
	labels: string[];
	updateAdultLabels: (labels: AdultSelfLabel[]) => void;
	updateOtherLabels: (labels: OtherSelfLabel[]) => void;
}) {
	const control = Dialog.useDialogContext();
	const t = useTheme();

	return (
		<Dialog.ScrollableInner
			label={"Add a content warning"}
			style={{
				...{ maxWidth: 500 },
				...a.w_full,
			}}
		>
			<div style={a.flex_1}>
				<div style={a.gap_sm}>
					<Text
						style={{
							...a.text_2xl,
							...a.font_bold,
						}}
					>
						Add a content warning
					</Text>
					<Text
						style={{
							...t.atoms.text_contrast_medium,
							...a.leading_snug,
						}}
					>
						Choose self-labels that are applicable for the media you are posting. If none are selected, this
						post is suitable for all audiences.
					</Text>
				</div>

				<div
					style={{
						...a.my_md,
						...a.gap_lg,
					}}
				>
					<div>
						<div
							style={{
								...a.flex_row,
								...a.align_center,
								...a.justify_between,
								...a.pb_sm,
							}}
						>
							<Text
								style={{
									...a.font_bold,
									...a.text_lg,
								}}
							>
								Adult Content
							</Text>
						</div>
						<div
							style={{
								...a.p_md,
								...a.rounded_sm,
								...a.border,
								...t.atoms.border_contrast_medium,
							}}
						>
							<Toggle.Group
								label={"Adult Content labels"}
								values={labels}
								onChange={(values) => {
									updateAdultLabels(values as AdultSelfLabel[]);
								}}
							>
								<div style={a.gap_sm}>
									<Toggle.Item name="sexual" label={"Suggestive"}>
										<Toggle.Checkbox />
										<Toggle.LabelText>Suggestive</Toggle.LabelText>
									</Toggle.Item>
									<Toggle.Item name="nudity" label={"Nudity"}>
										<Toggle.Checkbox />
										<Toggle.LabelText>Nudity</Toggle.LabelText>
									</Toggle.Item>
									<Toggle.Item name="porn" label={"Porn"}>
										<Toggle.Checkbox />
										<Toggle.LabelText>Adult</Toggle.LabelText>
									</Toggle.Item>
								</div>
							</Toggle.Group>
							{labels.includes("sexual") || labels.includes("nudity") || labels.includes("porn") ? (
								<Text
									style={{
										...a.mt_sm,
										...t.atoms.text_contrast_medium,
									}}
								>
									{labels.includes("sexual") ? (
										<>Pictures meant for adults.</>
									) : labels.includes("nudity") ? (
										<>Artistic or non-erotic nudity.</>
									) : labels.includes("porn") ? (
										<>Sexual activity or erotic nudity.</>
									) : (
										""
									)}
								</Text>
							) : null}
						</div>
					</div>
					<div>
						<div
							style={{
								...a.flex_row,
								...a.align_center,
								...a.justify_between,
								...a.pb_sm,
							}}
						>
							<Text
								style={{
									...a.font_bold,
									...a.text_lg,
								}}
							>
								Other
							</Text>
						</div>
						<div
							style={{
								...a.p_md,
								...a.rounded_sm,
								...a.border,
								...t.atoms.border_contrast_medium,
							}}
						>
							<Toggle.Group
								label={"Adult Content labels"}
								values={labels}
								onChange={(values) => {
									updateOtherLabels(values as OtherSelfLabel[]);
								}}
							>
								<Toggle.Item name="graphic-media" label={"Graphic Media"}>
									<Toggle.Checkbox />
									<Toggle.LabelText>Graphic Media</Toggle.LabelText>
								</Toggle.Item>
							</Toggle.Group>
							{labels.includes("graphic-media") ? (
								<Text
									style={{
										...a.mt_sm,
										...t.atoms.text_contrast_medium,
									}}
								>
									Media that may be disturbing or inappropriate for some audiences.
								</Text>
							) : null}
						</div>
					</div>
				</div>
			</div>
			<div
				style={{
					...a.mt_sm,
					...a.flex_row,
					...a.ml_auto,
				}}
			>
				<Button label={"Done"} onPress={() => control.close()} color="primary" size={"small"} variant="solid">
					<ButtonText>Done</ButtonText>
				</Button>
			</div>
		</Dialog.ScrollableInner>
	);
}
