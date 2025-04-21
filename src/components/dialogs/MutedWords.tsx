import { type AppBskyActorDefs, sanitizeMutedWordValue } from "@atproto/api";
import React from "react";

import { type ViewStyleProp, useBreakpoints, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import { Divider } from "#/components/Divider";
import { Loader } from "#/components/Loader";
import * as Prompt from "#/components/Prompt";
import { Text } from "#/components/Typography";
import { useGlobalDialogsControlContext } from "#/components/dialogs/Context";
import * as Toggle from "#/components/forms/Toggle";
import { useFormatDistance } from "#/components/hooks/dates";
import { Hashtag_Stroke2_Corner0_Rounded as Hashtag } from "#/components/icons/Hashtag";
import { PageText_Stroke2_Corner0_Rounded as PageText } from "#/components/icons/PageText";
import { PlusLarge_Stroke2_Corner0_Rounded as Plus } from "#/components/icons/Plus";
import { TimesLarge_Stroke2_Corner0_Rounded as X } from "#/components/icons/Times";
import {
	usePreferencesQuery,
	useRemoveMutedWordMutation,
	useUpsertMutedWordsMutation,
} from "#/state/queries/preferences";

const ONE_DAY = 24 * 60 * 60 * 1000;

export function MutedWordsDialog() {
	const { mutedWordsDialogControl: control } = useGlobalDialogsControlContext();
	return (
		<Dialog.Outer control={control}>
			<Dialog.Handle />
			<MutedWordsInner />
		</Dialog.Outer>
	);
}

function MutedWordsInner() {
	const t = useTheme();
	const { gtMobile } = useBreakpoints();
	const { isLoading: isPreferencesLoading, data: preferences, error: preferencesError } = usePreferencesQuery();
	const { isPending, mutateAsync: addMutedWord } = useUpsertMutedWordsMutation();
	const [field, setField] = React.useState("");
	const [targets, setTargets] = React.useState(["content"]);
	const [error, setError] = React.useState("");
	const [durations, setDurations] = React.useState(["forever"]);
	const [excludeFollowing, setExcludeFollowing] = React.useState(false);

	const submit = React.useCallback(async () => {
		const sanitizedValue = sanitizeMutedWordValue(field);
		const surfaces = ["tag", targets.includes("content") && "content"].filter(
			Boolean,
		) as AppBskyActorDefs.MutedWord["targets"];
		const actorTarget = excludeFollowing ? "exclude-following" : "all";

		const now = Date.now();
		const rawDuration = durations.at(0);
		// undefined evaluates to 'forever'
		let duration: string | undefined;

		if (rawDuration === "24_hours") {
			duration = new Date(now + ONE_DAY).toISOString();
		} else if (rawDuration === "7_days") {
			duration = new Date(now + 7 * ONE_DAY).toISOString();
		} else if (rawDuration === "30_days") {
			duration = new Date(now + 30 * ONE_DAY).toISOString();
		}

		if (!sanitizedValue || !surfaces.length) {
			setField("");
			setError("Please enter a valid word, tag, or phrase to mute");
			return;
		}

		try {
			// send raw value and rely on SDK as sanitization source of truth
			await addMutedWord([
				{
					value: field,
					targets: surfaces,
					actorTarget,
					expiresAt: duration,
				},
			]);
			setField("");
		} catch (e: unknown) {
			console.error("Failed to save muted word", { message: (e as { message: unknown }).message });
			setError((e as { message: string }).message);
		}
	}, [field, targets, addMutedWord, durations, excludeFollowing]);

	return (
		<Dialog.ScrollableInner label="Manage your muted words and tags">
			<div>
				<Text
					style={{
						fontSize: 16,
						letterSpacing: 0,
						fontWeight: "600",
						paddingBottom: 8,
						...t.atoms.text_contrast_high,
					}}
				>
					Add muted words and tags
				</Text>
				<Text
					style={{
						paddingBottom: 16,
						lineHeight: 1.3,
						...t.atoms.text_contrast_medium,
					}}
				>
					Posts can be muted based on their text, their tags, or both. We recommend avoiding common words that
					appear in many posts, since it can result in no posts being shown.
				</Text>

				<div style={{ paddingBottom: 8 }}>
					<Dialog.Input
						autoCorrect={"off"}
						autoCapitalize="none"
						autoComplete="off"
						label="Enter a word or tag"
						placeholder="Enter a word or tag"
						value={field}
						onChangeText={(value) => {
							if (error) {
								setError("");
							}
							setField(value);
						}}
						onSubmitEditing={submit}
					/>
				</div>

				<div
					style={{
						paddingBottom: 20,
						gap: 8,
					}}
				>
					<Toggle.Group
						label="Select how long to mute this word for."
						type="radio"
						values={durations}
						onChange={setDurations}
					>
						<Text
							style={{
								paddingBottom: 4,
								fontSize: 14,
								letterSpacing: 0,
								fontWeight: "600",
								...t.atoms.text_contrast_medium,
							}}
						>
							Duration:
						</Text>

						<div
							style={{
								...(gtMobile && {
									flexDirection: "row",
									alignItems: "center",
									justifyContent: "flex-start",
								}),
								gap: 8,
							}}
						>
							<div
								style={{
									flex: 1,
									flexDirection: "row",
									justifyContent: "flex-start",
									alignItems: "center",
									gap: 8,
								}}
							>
								<Toggle.Item
									label="Mute this word until you unmute it"
									name="forever"
									style={{ flex: 1 }}
								>
									<TargetToggle>
										<div
											style={{
												flex: 1,
												flexDirection: "row",
												alignItems: "center",
												gap: 8,
											}}
										>
											<Toggle.Radio />
											<Toggle.LabelText
												style={{
													flex: 1,
													lineHeight: 1.15,
												}}
											>
												Forever
											</Toggle.LabelText>
										</div>
									</TargetToggle>
								</Toggle.Item>

								<Toggle.Item label="Mute this word for 24 hours" name="24_hours" style={{ flex: 1 }}>
									<TargetToggle>
										<div
											style={{
												flex: 1,
												flexDirection: "row",
												alignItems: "center",
												gap: 8,
											}}
										>
											<Toggle.Radio />
											<Toggle.LabelText
												style={{
													flex: 1,
													lineHeight: 1.15,
												}}
											>
												24 hours
											</Toggle.LabelText>
										</div>
									</TargetToggle>
								</Toggle.Item>
							</div>

							<div
								style={{
									flex: 1,
									flexDirection: "row",
									justifyContent: "flex-start",
									alignItems: "center",
									gap: 8,
								}}
							>
								<Toggle.Item label="Mute this word for 7 days" name="7_days" style={{ flex: 1 }}>
									<TargetToggle>
										<div
											style={{
												flex: 1,
												flexDirection: "row",
												alignItems: "center",
												gap: 8,
											}}
										>
											<Toggle.Radio />
											<Toggle.LabelText
												style={{
													flex: 1,
													lineHeight: 1.15,
												}}
											>
												7 days
											</Toggle.LabelText>
										</div>
									</TargetToggle>
								</Toggle.Item>

								<Toggle.Item label="Mute this word for 30 days" name="30_days" style={{ flex: 1 }}>
									<TargetToggle>
										<div
											style={{
												flex: 1,
												flexDirection: "row",
												alignItems: "center",
												gap: 8,
											}}
										>
											<Toggle.Radio />
											<Toggle.LabelText
												style={{
													flex: 1,
													lineHeight: 1.15,
												}}
											>
												30 days
											</Toggle.LabelText>
										</div>
									</TargetToggle>
								</Toggle.Item>
							</div>
						</div>
					</Toggle.Group>

					<Toggle.Group
						label="Select what content this mute word should apply to."
						type="radio"
						values={targets}
						onChange={setTargets}
					>
						<Text
							style={{
								paddingBottom: 4,
								fontSize: 14,
								letterSpacing: 0,
								fontWeight: "600",
								...t.atoms.text_contrast_medium,
							}}
						>
							Mute in:
						</Text>

						<div
							style={{
								flexDirection: "row",
								alignItems: "center",
								gap: 8,
								flexWrap: "wrap",
							}}
						>
							<Toggle.Item
								label="Mute this word in post text and tags"
								name="content"
								style={{ flex: 1 }}
							>
								<TargetToggle>
									<div
										style={{
											flex: 1,
											flexDirection: "row",
											alignItems: "center",
											gap: 8,
										}}
									>
										<Toggle.Radio />
										<Toggle.LabelText
											style={{
												flex: 1,
												lineHeight: 1.15,
											}}
										>
											Text & tags
										</Toggle.LabelText>
									</div>
									<PageText size="sm" />
								</TargetToggle>
							</Toggle.Item>

							<Toggle.Item label="Mute this word in tags only" name="tag" style={{ flex: 1 }}>
								<TargetToggle>
									<div
										style={{
											flex: 1,
											flexDirection: "row",
											alignItems: "center",
											gap: 8,
										}}
									>
										<Toggle.Radio />
										<Toggle.LabelText
											style={{
												flex: 1,
												lineHeight: 1.15,
											}}
										>
											Tags only
										</Toggle.LabelText>
									</div>
									<Hashtag size="sm" />
								</TargetToggle>
							</Toggle.Item>
						</div>
					</Toggle.Group>

					<div>
						<Text
							style={{
								paddingBottom: 4,
								fontSize: 14,
								letterSpacing: 0,
								fontWeight: "600",
								...t.atoms.text_contrast_medium,
							}}
						>
							Options:
						</Text>
						<Toggle.Item
							label="Do not apply this mute word to users you follow"
							name="exclude_following"
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
							}}
							value={excludeFollowing}
							onChange={setExcludeFollowing}
						>
							<TargetToggle>
								<div
									style={{
										flex: 1,
										flexDirection: "row",
										alignItems: "center",
										gap: 8,
									}}
								>
									<Toggle.Checkbox />
									<Toggle.LabelText
										style={{
											flex: 1,
											lineHeight: 1.15,
										}}
									>
										Exclude users you follow
									</Toggle.LabelText>
								</div>
							</TargetToggle>
						</Toggle.Item>
					</div>

					<div style={{ paddingTop: 4 }}>
						<Button
							disabled={isPending || !field}
							label="Add mute word with chosen settings"
							size="large"
							color="primary"
							variant="solid"
							onPress={submit}
						>
							<ButtonText>Add</ButtonText>
							<ButtonIcon icon={isPending ? Loader : Plus} position="right" />
						</Button>
					</div>

					{error && (
						<div
							style={{
								flexDirection: "row",
								borderRadius: 8,
								padding: 12,
								marginBottom: 4,
								...t.atoms.bg_contrast_25,
								backgroundColor: t.palette.negative_400,
							}}
						>
							<Text
								style={{
									fontStyle: "italic",
									...{ color: t.palette.white },
								}}
							>
								{error}
							</Text>
						</div>
					)}
				</div>

				<Divider />

				<div style={{ paddingTop: 24 }}>
					<Text
						style={{
							fontSize: 16,
							letterSpacing: 0,
							fontWeight: "600",
							paddingBottom: 12,
							...t.atoms.text_contrast_high,
						}}
					>
						Your muted words
					</Text>

					{isPreferencesLoading ? (
						<Loader />
					) : preferencesError || !preferences ? (
						<div
							style={{
								paddingTop: 12,
								paddingBottom: 12,
								paddingLeft: 16,
								paddingRight: 16,
								borderRadius: 12,
								...t.atoms.bg_contrast_25,
							}}
						>
							<Text
								style={{
									fontStyle: "italic",
									...t.atoms.text_contrast_high,
								}}
							>
								We're sorry, but we weren't able to load your muted words at this time. Please try
								again.
							</Text>
						</div>
					) : preferences.moderationPrefs.mutedWords.length ? (
						[...preferences.moderationPrefs.mutedWords]
							.reverse()
							.map((word, i) => (
								<MutedWordRow
									key={word.value + i.toString()}
									word={word}
									style={i % 2 === 0 ? t.atoms.bg_contrast_25 : undefined}
								/>
							))
					) : (
						<div
							style={{
								paddingTop: 12,
								paddingBottom: 12,
								paddingLeft: 16,
								paddingRight: 16,
								borderRadius: 12,
								...t.atoms.bg_contrast_25,
							}}
						>
							<Text
								style={{
									fontStyle: "italic",
									...t.atoms.text_contrast_high,
								}}
							>
								You haven't muted any words or tags yet
							</Text>
						</div>
					)}
				</div>
			</div>
			<Dialog.Close />
		</Dialog.ScrollableInner>
	);
}

function MutedWordRow({ style, word }: ViewStyleProp & { word: AppBskyActorDefs.MutedWord }) {
	const t = useTheme();
	const { isPending, mutateAsync: removeMutedWord } = useRemoveMutedWordMutation();
	const control = Prompt.usePromptControl();
	const expiryDate = word.expiresAt ? new Date(word.expiresAt) : undefined;
	const isExpired = expiryDate && expiryDate < new Date();
	const formatDistance = useFormatDistance();

	const remove = React.useCallback(async () => {
		control.close();
		removeMutedWord(word);
	}, [removeMutedWord, word, control]);

	return (
		<>
			<Prompt.Basic
				control={control}
				title="Are you sure?"
				description={`This will delete "${word.value}" from your muted words. You can always add it back later.`}
				onConfirm={remove}
				confirmButtonCta="Remove"
				confirmButtonColor="negative"
			/>
			<div
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
					paddingTop: 12,
					paddingBottom: 12,
					paddingLeft: 16,
					paddingRight: 16,
					borderRadius: 12,
					gap: 12,
					...style,
				}}
			>
				<div
					style={{
						flex: 1,
						gap: 4,
					}}
				>
					<div
						style={{
							flexDirection: "row",
							alignItems: "center",
							gap: 8,
						}}
					>
						<Text
							style={{
								flex: 1,
								lineHeight: 1.3,
								fontWeight: "600",
								overflowWrap: "break-word",
								wordBreak: "break-word",
							}}
						>
							{word.targets.find((t) => t === "content") ? (
								<>
									{word.value}{" "}
									<Text
										style={{
											fontWeight: "400",
											...t.atoms.text_contrast_medium,
										}}
									>
										in{" "}
										<Text
											style={{
												fontWeight: "600",
												...t.atoms.text_contrast_medium,
											}}
										>
											text & tags
										</Text>
									</Text>
								</>
							) : (
								<>
									{word.value}{" "}
									<Text
										style={{
											fontWeight: "400",
											...t.atoms.text_contrast_medium,
										}}
									>
										in{" "}
										<Text
											style={{
												fontWeight: "600",
												...t.atoms.text_contrast_medium,
											}}
										>
											tags
										</Text>
									</Text>
								</>
							)}
						</Text>
					</div>

					{(expiryDate || word.actorTarget === "exclude-following") && (
						<div
							style={{
								flex: 1,
								flexDirection: "row",
								alignItems: "center",
								gap: 8,
							}}
						>
							<Text
								style={{
									flex: 1,
									fontSize: 12,
									letterSpacing: 0,
									lineHeight: 1.3,
									...t.atoms.text_contrast_medium,
								}}
							>
								{expiryDate &&
									(isExpired ? (
										<>Expired</>
									) : (
										<>
											Expires{" "}
											{formatDistance(expiryDate, new Date(), {
												addSuffix: true,
											})}
										</>
									))}
								{word.actorTarget === "exclude-following" && (
									<>
										{" • "}
										Excludes users you follow
									</>
								)}
							</Text>
						</div>
					)}
				</div>

				<Button
					label="Remove mute word from your list"
					size="tiny"
					shape="round"
					variant="outline"
					color="secondary"
					onPress={() => control.open()}
					style={{ marginLeft: 8 }}
				>
					<ButtonIcon icon={isPending ? Loader : X} />
				</Button>
			</div>
		</>
	);
}

function TargetToggle({ children }: React.PropsWithChildren) {
	const t = useTheme();
	const ctx = Toggle.useItemContext();
	const { gtMobile } = useBreakpoints();
	return (
		<div
			style={{
				flexDirection: "row",
				alignItems: "center",
				justifyContent: "space-between",
				gap: 4,
				flex: 1,
				paddingTop: 8,
				paddingBottom: 8,
				paddingLeft: gtMobile ? 12 : 8,
				paddingRight: gtMobile ? 12 : 8,
				borderRadius: 8,
				...t.atoms.bg_contrast_25,
				...((ctx.hovered || ctx.focused) && t.atoms.bg_contrast_50),

				...(ctx.selected && {
					backgroundColor: t.palette.primary_50,
				}),

				...(ctx.disabled && {
					opacity: 0.8,
				}),
			}}
		>
			{children}
		</div>
	);
}
