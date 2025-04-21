import type { InterpretedLabelValueDefinition, LabelPreference } from "@atproto/api";
import type React from "react";

import { atoms as a, useBreakpoints, useTheme } from "#/alf";
import { InlineLinkText } from "#/components/Link";
import { Text } from "#/components/Typography";
import * as ToggleButton from "#/components/forms/ToggleButton";
import { useGlobalLabelStrings } from "#/lib/moderation/useGlobalLabelStrings";
import { useLabelBehaviorDescription } from "#/lib/moderation/useLabelBehaviorDescription";
import { getLabelStrings } from "#/lib/moderation/useLabelInfo";
import { usePreferencesQuery, usePreferencesSetContentLabelMutation } from "#/state/queries/preferences";
import { CircleInfo_Stroke2_Corner0_Rounded as CircleInfo } from "../icons/CircleInfo";

export function Outer({ children }: React.PropsWithChildren) {
	return (
		<div
			style={{
				flexDirection: "row",
				gap: 8,
				paddingLeft: 16,
				paddingRight: 16,
				paddingTop: 16,
				paddingBottom: 16,
				justifyContent: "space-between",
				flexWrap: "wrap",
			}}
		>
			{children}
		</div>
	);
}

export function Content({
	children,
	name,
	description,
}: React.PropsWithChildren<{
	name: string;
	description: string;
}>) {
	const t = useTheme();
	const { gtPhone } = useBreakpoints();

	return (
		<div
			style={{
				gap: 4,
				flex: 1,
			}}
		>
			<Text
				style={{
					fontWeight: "600",
					fontSize: gtPhone ? 14 : 16,
				}}
			>
				{name}
			</Text>
			<Text
				style={{
					...t.atoms.text_contrast_medium,
					lineHeight: 1.3,
				}}
			>
				{description}
			</Text>
			{children}
		</div>
	);
}

export function Buttons({
	name,
	values,
	onChange,
	ignoreLabel,
	warnLabel,
	hideLabel,
}: {
	name: string;
	values: ToggleButton.GroupProps["values"];
	onChange: ToggleButton.GroupProps["onChange"];
	ignoreLabel?: string;
	warnLabel?: string;
	hideLabel?: string;
}) {
	return (
		<div
			style={{
				...{ minHeight: 35 },
				width: "100%",
			}}
		>
			<ToggleButton.Group
				label={`Configure content filtering setting for category: ${name}`}
				values={values}
				onChange={onChange}
			>
				{ignoreLabel && (
					<ToggleButton.Button name="ignore" label={ignoreLabel}>
						<ToggleButton.ButtonText>{ignoreLabel}</ToggleButton.ButtonText>
					</ToggleButton.Button>
				)}
				{warnLabel && (
					<ToggleButton.Button name="warn" label={warnLabel}>
						<ToggleButton.ButtonText>{warnLabel}</ToggleButton.ButtonText>
					</ToggleButton.Button>
				)}
				{hideLabel && (
					<ToggleButton.Button name="hide" label={hideLabel}>
						<ToggleButton.ButtonText>{hideLabel}</ToggleButton.ButtonText>
					</ToggleButton.Button>
				)}
			</ToggleButton.Group>
		</div>
	);
}

/**
 * For use on the global Moderation screen to set prefs for a "global" label,
 * not scoped to a single labeler.
 */
export function GlobalLabelPreference({
	labelDefinition,
	disabled,
}: {
	labelDefinition: InterpretedLabelValueDefinition;
	disabled?: boolean;
}) {
	const { identifier } = labelDefinition;
	const { data: preferences } = usePreferencesQuery();
	const { mutate, variables } = usePreferencesSetContentLabelMutation();
	const savedPref = preferences?.moderationPrefs.labels[identifier];
	const pref = variables?.visibility ?? savedPref ?? "warn";

	const allLabelStrings = useGlobalLabelStrings();
	const labelStrings =
		labelDefinition.identifier in allLabelStrings
			? allLabelStrings[labelDefinition.identifier]
			: {
					name: labelDefinition.identifier,
					description: `Labeled "${labelDefinition.identifier}"`,
				};

	const labelOptions = {
		hide: "Hide",
		warn: "Warn",
		ignore: "Show",
	};

	return (
		<Outer>
			<Content name={labelStrings.name} description={labelStrings.description} />
			{!disabled && (
				<Buttons
					name={labelStrings.name.toLowerCase()}
					values={[pref]}
					onChange={(values) => {
						mutate({
							label: identifier,
							visibility: values[0] as LabelPreference,
							labelerDid: undefined,
						});
					}}
					ignoreLabel={labelOptions.ignore}
					warnLabel={labelOptions.warn}
					hideLabel={labelOptions.hide}
				/>
			)}
		</Outer>
	);
}

/**
 * For use on individual labeler pages
 */
export function LabelerLabelPreference({
	labelDefinition,
	disabled,
	labelerDid,
}: {
	labelDefinition: InterpretedLabelValueDefinition;
	disabled?: boolean;
	labelerDid?: string;
}) {
	const t = useTheme();
	const { gtPhone } = useBreakpoints();

	const isGlobalLabel = !labelDefinition.definedBy;
	const { identifier } = labelDefinition;
	const { data: preferences } = usePreferencesQuery();
	const { mutate, variables } = usePreferencesSetContentLabelMutation();
	const savedPref =
		labelerDid && !isGlobalLabel
			? preferences?.moderationPrefs.labelers.find((l) => l.did === labelerDid)?.labels[identifier]
			: preferences?.moderationPrefs.labels[identifier];
	const pref = variables?.visibility ?? savedPref ?? labelDefinition.defaultSetting ?? "warn";

	// does the 'warn' setting make sense for this label?
	const canWarn = !(labelDefinition.blurs === "none" && labelDefinition.severity === "none");
	// is this label adult only?
	const adultOnly = labelDefinition.flags.includes("adult");
	// is this label disabled because it's adult only?
	const adultDisabled = adultOnly && !preferences?.moderationPrefs.adultContentEnabled;
	// are there any reasons we cant configure this label here?
	const cantConfigure = isGlobalLabel || adultDisabled;
	const showConfig = !disabled && (gtPhone || !cantConfigure);

	// adjust the pref based on whether warn is available
	let prefAdjusted = pref;
	if (adultDisabled) {
		prefAdjusted = "hide";
	} else if (!canWarn && pref === "warn") {
		prefAdjusted = "ignore";
	}

	// grab localized descriptions of the label and its settings
	const currentPrefLabel = useLabelBehaviorDescription(labelDefinition, prefAdjusted);
	const hideLabel = useLabelBehaviorDescription(labelDefinition, "hide");
	const warnLabel = useLabelBehaviorDescription(labelDefinition, "warn");
	const ignoreLabel = useLabelBehaviorDescription(labelDefinition, "ignore");
	const globalLabelStrings = useGlobalLabelStrings();
	const labelStrings = getLabelStrings(globalLabelStrings, labelDefinition);

	return (
		<Outer>
			<Content name={labelStrings.name} description={labelStrings.description}>
				{cantConfigure && (
					<div
						style={{
							flexDirection: "row",
							gap: 4,
							alignItems: "center",
							marginTop: 4,
						}}
					>
						<CircleInfo size="sm" fill={t.atoms.text_contrast_high.color} />

						<Text
							style={{
								...t.atoms.text_contrast_medium,
								fontWeight: "600",
								fontStyle: "italic",
							}}
						>
							{adultDisabled ? (
								<>Adult content is disabled.</>
							) : isGlobalLabel ? (
								<>
									Configured in{" "}
									<InlineLinkText
										label={"moderation settings"}
										to="/moderation"
										style={{ ...a.text_sm }}
									>
										moderation settings
									</InlineLinkText>
									.
								</>
							) : null}
						</Text>
					</div>
				)}
			</Content>
			{showConfig &&
				(cantConfigure ? (
					<div
						style={{
							...{ minHeight: 35 },
							paddingLeft: 12,
							paddingRight: 12,
							paddingTop: 12,
							paddingBottom: 12,
							borderRadius: 8,
							border: "1px solid black",
							borderWidth: 1,
							...t.atoms.border_contrast_low,
							alignSelf: "flex-start",
						}}
					>
						<Text
							style={{
								fontWeight: "600",
								...t.atoms.text_contrast_low,
							}}
						>
							{currentPrefLabel}
						</Text>
					</div>
				) : (
					<Buttons
						name={labelStrings.name.toLowerCase()}
						values={[pref]}
						onChange={(values) => {
							mutate({
								label: identifier,
								visibility: values[0] as LabelPreference,
								labelerDid,
							});
						}}
						ignoreLabel={ignoreLabel}
						warnLabel={canWarn ? warnLabel : undefined}
						hideLabel={hideLabel}
					/>
				))}
		</Outer>
	);
}
