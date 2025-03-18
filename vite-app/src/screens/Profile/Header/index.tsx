import type { AppBskyActorDefs, AppBskyLabelerDefs, ModerationOpts, RichText as RichTextAPI } from "@atproto/api";
import type React from "react";
import { memo } from "react";

import { useTheme } from "#/alf";
import { LoadingPlaceholder } from "#/view/com/util/LoadingPlaceholder";
import { ProfileHeaderLabeler } from "./ProfileHeaderLabeler";
import { ProfileHeaderStandard } from "./ProfileHeaderStandard";

const ProfileHeaderLoading = (): React.ReactNode => {
	const t = useTheme();
	return (
		<div style={t.atoms.bg}>
			<LoadingPlaceholder width="100%" height={150} style={{ borderRadius: 0 }} />
			<div
				style={{
					...t.atoms.bg,
					...{ borderColor: t.atoms.bg.backgroundColor },
					...styles.avi,
				}}
			>
				<LoadingPlaceholder width={90} height={90} style={styles.br45} />
			</div>
			<div style={styles.content}>
				<div style={styles.buttonsLine}>
					<LoadingPlaceholder width={140} height={34} style={styles.br50} />
				</div>
			</div>
		</div>
	);
};
const MemoedProfileHeaderLoading = memo(ProfileHeaderLoading);
export { MemoedProfileHeaderLoading as ProfileHeaderLoading };

interface Props {
	profile: AppBskyActorDefs.ProfileViewDetailed;
	labeler: AppBskyLabelerDefs.LabelerViewDetailed | undefined;
	descriptionRT: RichTextAPI | null;
	moderationOpts: ModerationOpts;
	hideBackButton?: boolean;
	isPlaceholderProfile?: boolean;
	setMinimumHeight: (height: number) => void;
}

let ProfileHeader = ({ setMinimumHeight, ...props }: Props): React.ReactNode => {
	let content: React.ReactNode;
	if (props.profile.associated?.labeler) {
		if (!props.labeler) {
			content = <ProfileHeaderLoading />;
		} else {
			content = <ProfileHeaderLabeler {...props} labeler={props.labeler} />;
		}
	} else {
		content = <ProfileHeaderStandard {...props} />;
	}

	return <>{content}</>;
};
ProfileHeader = memo(ProfileHeader);
export { ProfileHeader };

const styles = {
	avi: {
		position: "absolute",
		top: 110,
		left: 10,
		width: 94,
		height: 94,
		borderRadius: 47,
		borderWidth: 2,
	},
	content: {
		paddingTop: 12,
		paddingBottom: 8,
		paddingLeft: 16,
		paddingRight: 16,
	},
	buttonsLine: {
		flexDirection: "row",
		marginLeft: "auto",
	},
	br45: { borderRadius: 45 },
	br50: { borderRadius: 50 },
} satisfies Record<string, React.CSSProperties>;
