import {
	type AppBskyActorDefs,
	type AppBskyFeedDefs,
	type AppBskyFeedPost,
	type ComAtprotoLabelDefs,
	LABELS,
	type LabelPreference,
	type ModerationBehavior,
	type ModerationDecision,
	type ModerationOpts,
	RichText,
	interpretLabelValueDefinition,
	mock,
	moderatePost,
	moderateProfile,
} from "@atproto/api";
import React from "react";

import { useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import { Divider } from "#/components/Divider";
import * as Layout from "#/components/Layout";
import { H1, H3, P, Text } from "#/components/Typography";
import * as Toggle from "#/components/forms/Toggle";
import * as ToggleButton from "#/components/forms/ToggleButton";
import { Check_Stroke2_Corner0_Rounded as Check } from "#/components/icons/Check";
import {
	ChevronBottom_Stroke2_Corner0_Rounded as ChevronBottom,
	ChevronTop_Stroke2_Corner0_Rounded as ChevronTop,
} from "#/components/icons/Chevron";
import { useGlobalLabelStrings } from "#/lib/moderation/useGlobalLabelStrings";
import { ProfileHeaderStandard } from "#/screens/Profile/Header/ProfileHeaderStandard";
import { moderationOptsOverrideContext } from "#/state/preferences/moderation-opts";
import type { FeedNotification } from "#/state/queries/notifications/types";
import { groupNotifications, shouldFilterNotif } from "#/state/queries/notifications/util";
import { useSession } from "#/state/session";
import { PostFeedItem } from "#/units/post";
import { CenteredView, ScrollView } from "#/view/com/util/Views";
import { ScreenHider } from "../../components/moderation/ScreenHider";
import { NotificationFeedItem } from "../com/notifications/NotificationFeedItem";
import { PostThreadItem } from "../com/post-thread/PostThreadItem";
import { ProfileCard } from "../com/profile/ProfileCard";

const LABEL_VALUES: (keyof typeof LABELS)[] = Object.keys(LABELS) as (keyof typeof LABELS)[];

export const DebugModScreen = () => {
	const t = useTheme();
	const [scenario, setScenario] = React.useState<string[]>(["label"]);
	const [scenarioSwitches, setScenarioSwitches] = React.useState<string[]>([]);
	const [label, setLabel] = React.useState<string[]>([LABEL_VALUES[0]]);
	const [target, setTarget] = React.useState<string[]>(["account"]);
	const [visibility, setVisiblity] = React.useState<string[]>(["warn"]);
	const [customLabelDef, setCustomLabelDef] = React.useState<ComAtprotoLabelDefs.LabelValueDefinition>({
		identifier: "custom",
		blurs: "content",
		severity: "alert",
		defaultSetting: "warn",
		locales: [
			{
				lang: "en",
				name: "Custom label",
				description: "A custom label created in this test environment",
			},
		],
	});
	const [view, setView] = React.useState<string[]>(["post"]);
	const labelStrings = useGlobalLabelStrings();
	const { currentAccount } = useSession();

	const isTargetMe = scenario[0] === "label" && scenarioSwitches.includes("targetMe");
	const isSelfLabel = scenario[0] === "label" && scenarioSwitches.includes("selfLabel");
	const noAdult = scenario[0] === "label" && scenarioSwitches.includes("noAdult");
	const isLoggedOut = scenario[0] === "label" && scenarioSwitches.includes("loggedOut");
	const isFollowing = scenarioSwitches.includes("following");

	const did = isTargetMe && currentAccount ? currentAccount.did : "did:web:bob.test";

	const profile = React.useMemo(() => {
		const mockedProfile = mock.profileViewBasic({
			handle: "bob.test",
			displayName: "Bob Robertson",
			description: "User with this as their bio",
			labels:
				scenario[0] === "label" && target[0] === "account"
					? [
							mock.label({
								src: isSelfLabel ? did : undefined,
								val: label[0],
								uri: `at://${did}/`,
							}),
						]
					: scenario[0] === "label" && target[0] === "profile"
						? [
								mock.label({
									src: isSelfLabel ? did : undefined,
									val: label[0],
									uri: `at://${did}/app.bsky.actor.profile/self`,
								}),
							]
						: undefined,
			viewer: mock.actorViewerState({
				following: isFollowing ? `at://${currentAccount?.did || ""}/app.bsky.graph.follow/1234` : undefined,
				muted: scenario[0] === "mute",
				mutedByList: undefined,
				blockedBy: undefined,
				blocking: scenario[0] === "block" ? "at://did:web:alice.test/app.bsky.actor.block/fake" : undefined,
				blockingByList: undefined,
			}),
		});
		mockedProfile.did = did;
		mockedProfile.avatar = "https://bsky.social/about/images/favicon-32x32.png";
		// @ts-expect-error ProfileViewBasic is close enough -esb
		mockedProfile.banner = "https://bsky.social/about/images/social-card-default-gradient.png";
		return mockedProfile;
	}, [scenario, target, label, isSelfLabel, did, isFollowing, currentAccount]);

	const post = React.useMemo(() => {
		return mock.postView({
			record: mock.post({
				text: "This is the body of the post. It's where the text goes. You get the idea.",
			}),
			author: profile,
			labels:
				scenario[0] === "label" && target[0] === "post"
					? [
							mock.label({
								src: isSelfLabel ? did : undefined,
								val: label[0],
								uri: `at://${did}/app.bsky.feed.post/fake`,
							}),
						]
					: undefined,
			embed:
				target[0] === "embed"
					? mock.embedRecordView({
							record: mock.post({
								text: "Embed",
							}),
							labels:
								scenario[0] === "label" && target[0] === "embed"
									? [
											mock.label({
												src: isSelfLabel ? did : undefined,
												val: label[0],
												uri: `at://${did}/app.bsky.feed.post/fake`,
											}),
										]
									: undefined,
							author: profile,
						})
					: {
							$type: "app.bsky.embed.images#view",
							images: [
								{
									thumb: "https://bsky.social/about/images/social-card-default-gradient.png",
									fullsize: "https://bsky.social/about/images/social-card-default-gradient.png",
									alt: "",
								},
							],
						},
		});
	}, [scenario, label, target, profile, isSelfLabel, did]);

	const replyNotif = React.useMemo(() => {
		const notif = mock.replyNotification({
			record: mock.post({
				text: "This is the body of the post. It's where the text goes. You get the idea.",
				reply: {
					parent: {
						uri: `at://${did}/app.bsky.feed.post/fake-parent`,
						cid: "bafyreiclp443lavogvhj3d2ob2cxbfuscni2k5jk7bebjzg7khl3esabwq",
					},
					root: {
						uri: `at://${did}/app.bsky.feed.post/fake-parent`,
						cid: "bafyreiclp443lavogvhj3d2ob2cxbfuscni2k5jk7bebjzg7khl3esabwq",
					},
				},
			}),
			author: profile,
			labels:
				scenario[0] === "label" && target[0] === "post"
					? [
							mock.label({
								src: isSelfLabel ? did : undefined,
								val: label[0],
								uri: `at://${did}/app.bsky.feed.post/fake`,
							}),
						]
					: undefined,
		});
		const [item] = groupNotifications([notif]);
		item.subject = mock.postView({
			record: notif.record as AppBskyFeedPost.Record,
			author: profile,
			labels: notif.labels,
		});
		return item;
	}, [scenario, label, target, profile, isSelfLabel, did]);

	const followNotif = React.useMemo(() => {
		const notif = mock.followNotification({
			author: profile,
			subjectDid: currentAccount?.did || "",
		});
		const [item] = groupNotifications([notif]);
		return item;
	}, [profile, currentAccount]);

	const modOpts = React.useMemo(() => {
		return {
			userDid: isLoggedOut ? "" : isTargetMe ? did : "did:web:alice.test",
			prefs: {
				adultContentEnabled: !noAdult,
				labels: {
					[label[0]]: visibility[0] as LabelPreference,
				},
				labelers: [
					{
						did: "did:plc:fake-labeler",
						labels: { [label[0]]: visibility[0] as LabelPreference },
					},
				],
				mutedWords: [],
				hiddenPosts: [],
			},
			labelDefs: {
				"did:plc:fake-labeler": [interpretLabelValueDefinition(customLabelDef, "did:plc:fake-labeler")],
			},
		};
	}, [label, visibility, noAdult, isLoggedOut, isTargetMe, did, customLabelDef]);

	const profileModeration = React.useMemo(() => {
		return moderateProfile(profile, modOpts);
	}, [profile, modOpts]);
	const postModeration = React.useMemo(() => {
		return moderatePost(post, modOpts);
	}, [post, modOpts]);

	return (
		<Layout.Screen>
			<moderationOptsOverrideContext.Provider value={modOpts}>
				<ScrollView>
					<CenteredView
						style={{
							...t.atoms.bg,
							paddingLeft: 16,
							paddingRight: 16,
							paddingTop: 16,
							paddingBottom: 16,
						}}
					>
						<H1
							style={{
								fontSize: 40,
								letterSpacing: 0,
								fontWeight: "600",
								paddingBottom: 16,
							}}
						>
							Moderation states
						</H1>

						<Heading title="" subtitle="Scenario" />
						<ToggleButton.Group label="Scenario" values={scenario} onChange={setScenario}>
							<ToggleButton.Button name="label" label="Label">
								<ToggleButton.ButtonText>Label</ToggleButton.ButtonText>
							</ToggleButton.Button>
							<ToggleButton.Button name="block" label="Block">
								<ToggleButton.ButtonText>Block</ToggleButton.ButtonText>
							</ToggleButton.Button>
							<ToggleButton.Button name="mute" label="Mute">
								<ToggleButton.ButtonText>Mute</ToggleButton.ButtonText>
							</ToggleButton.Button>
						</ToggleButton.Group>

						{scenario[0] === "label" && (
							<>
								<div
									style={{
										border: "1px solid black",
										borderWidth: 1,
										borderRadius: 8,
										marginTop: 16,
										marginBottom: 16,
										padding: 16,
										...t.atoms.border_contrast_medium,
									}}
								>
									<Toggle.Group label="Toggle" type="radio" values={label} onChange={setLabel}>
										<div
											style={{
												flexDirection: "row",
												gap: 12,
												flexWrap: "wrap",
											}}
										>
											{LABEL_VALUES.map((labelValue) => {
												let targetFixed = target[0];
												if (targetFixed !== "account" && targetFixed !== "profile") {
													targetFixed = "content";
												}
												const disabled =
													isSelfLabel && LABELS[labelValue].flags.includes("no-self");
												return (
													<Toggle.Item
														key={labelValue}
														name={labelValue}
														label={labelStrings[labelValue].name}
														disabled={disabled}
														style={disabled ? { opacity: 0.5 } : undefined}
													>
														<Toggle.Radio />
														<Toggle.LabelText>{labelValue}</Toggle.LabelText>
													</Toggle.Item>
												);
											})}
											<Toggle.Item
												name="custom"
												label="Custom label"
												disabled={isSelfLabel}
												style={isSelfLabel ? { opacity: 0.5 } : undefined}
											>
												<Toggle.Radio />
												<Toggle.LabelText>Custom label</Toggle.LabelText>
											</Toggle.Item>
										</div>
									</Toggle.Group>

									{label[0] === "custom" ? (
										<CustomLabelForm def={customLabelDef} setDef={setCustomLabelDef} />
									) : (
										<>
											<div style={{ height: 10 }} />
											<Divider />
										</>
									)}

									<div style={{ height: 10 }} />

									<SmallToggler label="Advanced">
										<Toggle.Group
											label="Toggle"
											type="checkbox"
											values={scenarioSwitches}
											onChange={setScenarioSwitches}
										>
											<div
												style={{
													gap: 12,
													flexDirection: "row",
													flexWrap: "wrap",
													paddingTop: 12,
												}}
											>
												<Toggle.Item name="targetMe" label="Target is me">
													<Toggle.Checkbox />
													<Toggle.LabelText>Target is me</Toggle.LabelText>
												</Toggle.Item>
												<Toggle.Item name="following" label="Following target">
													<Toggle.Checkbox />
													<Toggle.LabelText>Following target</Toggle.LabelText>
												</Toggle.Item>
												<Toggle.Item name="selfLabel" label="Self label">
													<Toggle.Checkbox />
													<Toggle.LabelText>Self label</Toggle.LabelText>
												</Toggle.Item>
												<Toggle.Item name="noAdult" label="Adult disabled">
													<Toggle.Checkbox />
													<Toggle.LabelText>Adult disabled</Toggle.LabelText>
												</Toggle.Item>
												<Toggle.Item name="loggedOut" label="Signed out">
													<Toggle.Checkbox />
													<Toggle.LabelText>Signed out</Toggle.LabelText>
												</Toggle.Item>
											</div>
										</Toggle.Group>

										{LABELS[label[0] as keyof typeof LABELS]?.configurable !== false && (
											<div style={{ marginTop: 12 }}>
												<Text
													style={{
														fontWeight: "600",
														fontSize: 12,
														letterSpacing: 0,
														...t.atoms.text,
														paddingBottom: 8,
													}}
												>
													Preference
												</Text>
												<Toggle.Group
													label="Preference"
													type="radio"
													values={visibility}
													onChange={setVisiblity}
												>
													<div
														style={{
															flexDirection: "row",
															gap: 12,
															flexWrap: "wrap",
															alignItems: "center",
														}}
													>
														<Toggle.Item name="hide" label="Hide">
															<Toggle.Radio />
															<Toggle.LabelText>Hide</Toggle.LabelText>
														</Toggle.Item>
														<Toggle.Item name="warn" label="Warn">
															<Toggle.Radio />
															<Toggle.LabelText>Warn</Toggle.LabelText>
														</Toggle.Item>
														<Toggle.Item name="ignore" label="Ignore">
															<Toggle.Radio />
															<Toggle.LabelText>Ignore</Toggle.LabelText>
														</Toggle.Item>
													</div>
												</Toggle.Group>
											</div>
										)}
									</SmallToggler>
								</div>

								<div
									style={{
										flexDirection: "row",
										flexWrap: "wrap",
										gap: 12,
									}}
								>
									<div>
										<Text
											style={{
												fontWeight: "600",
												fontSize: 12,
												letterSpacing: 0,
												...t.atoms.text,
												paddingLeft: 12,
												paddingBottom: 4,
											}}
										>
											Target
										</Text>
										<div
											style={{
												border: "1px solid black",
												borderWidth: 1,
												borderRadius: 999,
												paddingLeft: 12,
												paddingRight: 12,
												paddingTop: 8,
												paddingBottom: 8,
												...t.atoms.border_contrast_medium,
												...t.atoms.bg,
											}}
										>
											<Toggle.Group
												label="Target"
												type="radio"
												values={target}
												onChange={setTarget}
											>
												<div
													style={{
														flexDirection: "row",
														gap: 12,
														flexWrap: "wrap",
													}}
												>
													<Toggle.Item name="account" label="Account">
														<Toggle.Radio />
														<Toggle.LabelText>Account</Toggle.LabelText>
													</Toggle.Item>
													<Toggle.Item name="profile" label="Profile">
														<Toggle.Radio />
														<Toggle.LabelText>Profile</Toggle.LabelText>
													</Toggle.Item>
													<Toggle.Item name="post" label="Post">
														<Toggle.Radio />
														<Toggle.LabelText>Post</Toggle.LabelText>
													</Toggle.Item>
													<Toggle.Item name="embed" label="Embed">
														<Toggle.Radio />
														<Toggle.LabelText>Embed</Toggle.LabelText>
													</Toggle.Item>
												</div>
											</Toggle.Group>
										</div>
									</div>
								</div>
							</>
						)}

						<Spacer />

						<Heading title="" subtitle="Results" />

						<ToggleButton.Group label="Results" values={view} onChange={setView}>
							<ToggleButton.Button name="post" label="Post">
								<ToggleButton.ButtonText>Post</ToggleButton.ButtonText>
							</ToggleButton.Button>
							<ToggleButton.Button name="notifications" label="Notifications">
								<ToggleButton.ButtonText>Notifications</ToggleButton.ButtonText>
							</ToggleButton.Button>
							<ToggleButton.Button name="account" label="Account">
								<ToggleButton.ButtonText>Account</ToggleButton.ButtonText>
							</ToggleButton.Button>
							<ToggleButton.Button name="data" label="Data">
								<ToggleButton.ButtonText>Data</ToggleButton.ButtonText>
							</ToggleButton.Button>
						</ToggleButton.Group>

						<div
							style={{
								border: "1px solid black",
								borderWidth: 1,
								borderRadius: 8,
								marginTop: 16,
								padding: 12,
								...t.atoms.border_contrast_medium,
							}}
						>
							{view[0] === "post" && (
								<>
									<Heading title="Post" subtitle="in feed" />
									<MockPostFeedItem post={post} moderation={postModeration} />

									<Heading title="Post" subtitle="viewed directly" />
									<MockPostThreadItem post={post} moderation={postModeration} />

									<Heading title="Post" subtitle="reply in thread" />
									<MockPostThreadItem post={post} moderation={postModeration} reply />
								</>
							)}

							{view[0] === "notifications" && (
								<>
									<Heading title="Notification" subtitle="quote or reply" />
									<MockNotifItem notif={replyNotif} moderationOpts={modOpts} />
									<div style={{ height: 20 }} />
									<Heading title="Notification" subtitle="follow or like" />
									<MockNotifItem notif={followNotif} moderationOpts={modOpts} />
								</>
							)}

							{view[0] === "account" && (
								<>
									<Heading title="Account" subtitle="in listing" />
									<MockAccountCard profile={profile} moderation={profileModeration} />

									<Heading title="Account" subtitle="viewing directly" />
									<MockAccountScreen
										profile={profile}
										moderation={profileModeration}
										moderationOpts={modOpts}
									/>
								</>
							)}

							{view[0] === "data" && (
								<>
									<ModerationUIView label="Profile Moderation UI" mod={profileModeration} />
									<ModerationUIView label="Post Moderation UI" mod={postModeration} />
									<DataView label={label[0]} data={LABELS[label[0] as keyof typeof LABELS]} />
									<DataView label="Profile Moderation Data" data={profileModeration} />
									<DataView label="Post Moderation Data" data={postModeration} />
								</>
							)}
						</div>

						<div style={{ height: 400 }} />
					</CenteredView>
				</ScrollView>
			</moderationOptsOverrideContext.Provider>
		</Layout.Screen>
	);
};

function Heading({ title, subtitle }: { title: string; subtitle?: string }) {
	const t = useTheme();
	return (
		<H3
			style={{
				fontSize: 26,
				letterSpacing: 0,
				fontWeight: "600",
				paddingBottom: 12,
			}}
		>
			{title}{" "}
			{!!subtitle && (
				<H3
					style={{
						...t.atoms.text_contrast_medium,
						fontSize: 18,
						letterSpacing: 0,
					}}
				>
					{subtitle}
				</H3>
			)}
		</H3>
	);
}

function CustomLabelForm({
	def,
	setDef,
}: {
	def: ComAtprotoLabelDefs.LabelValueDefinition;
	setDef: React.Dispatch<React.SetStateAction<ComAtprotoLabelDefs.LabelValueDefinition>>;
}) {
	const t = useTheme();
	return (
		<div
			style={{
				flexDirection: "row",
				flexWrap: "wrap",
				gap: 12,
				...t.atoms.bg_contrast_25,
				borderRadius: 12,
				padding: 12,
				marginTop: 12,
			}}
		>
			<div>
				<Text
					style={{
						fontWeight: "600",
						fontSize: 12,
						letterSpacing: 0,
						...t.atoms.text,
						paddingLeft: 12,
						paddingBottom: 4,
					}}
				>
					Blurs
				</Text>
				<div
					style={{
						border: "1px solid black",
						borderWidth: 1,
						borderRadius: 999,
						paddingLeft: 12,
						paddingRight: 12,
						paddingTop: 8,
						paddingBottom: 8,
						...t.atoms.border_contrast_medium,
						...t.atoms.bg,
					}}
				>
					<Toggle.Group
						label="Blurs"
						type="radio"
						values={[def.blurs]}
						onChange={(values) => setDef((v) => ({ ...v, blurs: values[0] }))}
					>
						<div
							style={{
								flexDirection: "row",
								gap: 12,
								flexWrap: "wrap",
							}}
						>
							<Toggle.Item name="content" label="Content">
								<Toggle.Radio />
								<Toggle.LabelText>Content</Toggle.LabelText>
							</Toggle.Item>
							<Toggle.Item name="media" label="Media">
								<Toggle.Radio />
								<Toggle.LabelText>Media</Toggle.LabelText>
							</Toggle.Item>
							<Toggle.Item name="none" label="None">
								<Toggle.Radio />
								<Toggle.LabelText>None</Toggle.LabelText>
							</Toggle.Item>
						</div>
					</Toggle.Group>
				</div>
			</div>
			<div>
				<Text
					style={{
						fontWeight: "600",
						fontSize: 12,
						letterSpacing: 0,
						...t.atoms.text,
						paddingLeft: 12,
						paddingBottom: 4,
					}}
				>
					Severity
				</Text>
				<div
					style={{
						border: "1px solid black",
						borderWidth: 1,
						borderRadius: 999,
						paddingLeft: 12,
						paddingRight: 12,
						paddingTop: 8,
						paddingBottom: 8,
						...t.atoms.border_contrast_medium,
						...t.atoms.bg,
					}}
				>
					<Toggle.Group
						label="Severity"
						type="radio"
						values={[def.severity]}
						onChange={(values) => setDef((v) => ({ ...v, severity: values[0] }))}
					>
						<div
							style={{
								flexDirection: "row",
								gap: 12,
								flexWrap: "wrap",
								alignItems: "center",
							}}
						>
							<Toggle.Item name="alert" label="Alert">
								<Toggle.Radio />
								<Toggle.LabelText>Alert</Toggle.LabelText>
							</Toggle.Item>
							<Toggle.Item name="inform" label="Inform">
								<Toggle.Radio />
								<Toggle.LabelText>Inform</Toggle.LabelText>
							</Toggle.Item>
							<Toggle.Item name="none" label="None">
								<Toggle.Radio />
								<Toggle.LabelText>None</Toggle.LabelText>
							</Toggle.Item>
						</div>
					</Toggle.Group>
				</div>
			</div>
		</div>
	);
}

function Toggler({ label, children }: React.PropsWithChildren<{ label: string }>) {
	const t = useTheme();
	const [show, setShow] = React.useState(false);
	return (
		<div style={{ marginBottom: 12 }}>
			<div
				style={{
					...t.atoms.border_contrast_medium,
					border: "1px solid black",
					borderWidth: 1,
					borderRadius: 8,
					padding: 4,
				}}
			>
				<Button
					variant="solid"
					color="secondary"
					label="Toggle visibility"
					size="small"
					onPress={() => setShow(!show)}
				>
					<ButtonText>{label}</ButtonText>
					<ButtonIcon icon={show ? ChevronTop : ChevronBottom} position="right" />
				</Button>
				{show && children}
			</div>
		</div>
	);
}

function SmallToggler({ label, children }: React.PropsWithChildren<{ label: string }>) {
	const [show, setShow] = React.useState(false);
	return (
		<div>
			<div style={{ flexDirection: "row" }}>
				<Button
					variant="ghost"
					color="secondary"
					label="Toggle visibility"
					size="tiny"
					onPress={() => setShow(!show)}
				>
					<ButtonText>{label}</ButtonText>
					<ButtonIcon icon={show ? ChevronTop : ChevronBottom} position="right" />
				</Button>
			</div>
			{show && children}
		</div>
	);
}

// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
function DataView({ label, data }: { label: string; data: any }) {
	return (
		<Toggler label={label}>
			<Text
				style={{
					...{ fontFamily: "monospace" },
					padding: 12,
				}}
			>
				{JSON.stringify(data, null, 2)}
			</Text>
		</Toggler>
	);
}

function ModerationUIView({
	mod,
	label,
}: {
	mod: ModerationDecision;
	label: string;
}) {
	return (
		<Toggler label={label}>
			<div style={{ padding: 16 }}>
				{[
					"profileList",
					"profileView",
					"avatar",
					"banner",
					"displayName",
					"contentList",
					"contentView",
					"contentMedia",
				].map((key) => {
					const ui = mod.ui(key as keyof ModerationBehavior);
					return (
						<div
							key={key}
							style={{
								flexDirection: "row",
								gap: 12,
							}}
						>
							<Text
								style={{
									fontWeight: "600",
									...{ width: 100 },
								}}
							>
								{key}
							</Text>
							<Flag v={ui.filter} label="Filter" />
							<Flag v={ui.blur} label="Blur" />
							<Flag v={ui.alert} label="Alert" />
							<Flag v={ui.inform} label="Inform" />
							<Flag v={ui.noOverride} label="No-override" />
						</div>
					);
				})}
			</div>
		</Toggler>
	);
}

function Spacer() {
	return <div style={{ height: 30 }} />;
}

function MockPostFeedItem({
	post,
	moderation,
}: {
	post: AppBskyFeedDefs.PostView;
	moderation: ModerationDecision;
}) {
	const t = useTheme();
	if (moderation.ui("contentList").filter) {
		return (
			<P
				style={{
					...t.atoms.bg_contrast_25,
					paddingLeft: 16,
					paddingRight: 16,
					paddingTop: 12,
					paddingBottom: 12,
					marginBottom: 16,
				}}
			>
				Filtered from the feed
			</P>
		);
	}
	return (
		<PostFeedItem
			post={post}
			record={post.record as AppBskyFeedPost.Record}
			moderation={moderation}
			parentAuthor={undefined}
			showReplyTo={false}
			reason={undefined}
			feedContext={""}
			rootPost={post}
		/>
	);
}

function MockPostThreadItem({
	post,
	moderation,
	reply,
}: {
	post: AppBskyFeedDefs.PostView;
	moderation: ModerationDecision;
	reply?: boolean;
}) {
	return (
		<PostThreadItem
			post={post}
			record={post.record as AppBskyFeedPost.Record}
			moderation={moderation}
			depth={reply ? 1 : 0}
			isHighlightedPost={!reply}
			treeView={false}
			prevPost={undefined}
			nextPost={undefined}
			hasPrecedingItem={false}
			overrideBlur={false}
			onPostReply={() => {}}
		/>
	);
}

function MockNotifItem({
	notif,
	moderationOpts,
}: {
	notif: FeedNotification;
	moderationOpts: ModerationOpts;
}) {
	const t = useTheme();
	if (shouldFilterNotif(notif.notification, moderationOpts)) {
		return (
			<P
				style={{
					...t.atoms.bg_contrast_25,
					paddingLeft: 16,
					paddingRight: 16,
					paddingTop: 12,
					paddingBottom: 12,
				}}
			>
				Filtered from the feed
			</P>
		);
	}
	return <NotificationFeedItem item={notif} moderationOpts={moderationOpts} highlightUnread />;
}

function MockAccountCard({
	profile,
	moderation,
}: {
	profile: AppBskyActorDefs.ProfileViewBasic;
	moderation: ModerationDecision;
}) {
	const t = useTheme();

	if (moderation.ui("profileList").filter) {
		return (
			<P
				style={{
					...t.atoms.bg_contrast_25,
					paddingLeft: 16,
					paddingRight: 16,
					paddingTop: 12,
					paddingBottom: 12,
					marginBottom: 16,
				}}
			>
				Filtered from the listing
			</P>
		);
	}

	return <ProfileCard profile={profile} />;
}

function MockAccountScreen({
	profile,
	moderation,
	moderationOpts,
}: {
	profile: AppBskyActorDefs.ProfileViewBasic;
	moderation: ModerationDecision;
	moderationOpts: ModerationOpts;
}) {
	const t = useTheme();
	return (
		<div
			style={{
				...t.atoms.border_contrast_medium,
				border: "1px solid black",
				borderWidth: 1,
				marginBottom: 12,
			}}
		>
			<ScreenHider style={{}} screenDescription={"profile"} modui={moderation.ui("profileView")}>
				<ProfileHeaderStandard
					// @ts-expect-error ProfileViewBasic is close enough -prf
					profile={profile}
					moderationOpts={moderationOpts}
					// @ts-expect-error ProfileViewBasic is close enough -esb
					descriptionRT={new RichText({ text: profile.description as string })}
				/>
			</ScreenHider>
		</div>
	);
}

function Flag({ v, label }: { v: boolean | undefined; label: string }) {
	const t = useTheme();
	return (
		<div
			style={{
				flexDirection: "row",
				alignItems: "center",
				gap: 4,
			}}
		>
			<div
				style={{
					justifyContent: "center",
					alignItems: "center",
					borderRadius: 4,
					border: "1px solid black",
					borderWidth: 1,
					...t.atoms.border_contrast_medium,

					...{
						backgroundColor: t.palette.contrast_25,
						width: 14,
						height: 14,
					},
				}}
			>
				{v && <Check size="xs" fill={t.palette.contrast_900} />}
			</div>
			<P style={{ fontSize: 4 }}>{label}</P>
		</div>
	);
}
