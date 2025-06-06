import { ReactRenderer } from "@tiptap/react";
import type { SuggestionKeyDownProps, SuggestionOptions, SuggestionProps } from "@tiptap/suggestion";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import tippy, { type Instance as TippyInstance } from "tippy.js";

import { Text } from "#/components/Typography";
import { usePalette } from "#/lib/hooks/usePalette";
import { sanitizeDisplayName } from "#/lib/strings/display-names";
import { sanitizeHandle } from "#/lib/strings/handles";
import type { ActorAutocompleteFn } from "#/state/queries/actor-autocomplete";
import { UserAvatar } from "#/view/com/util/UserAvatar";
import { useGrapheme } from "../hooks/useGrapheme";

interface MentionListRef {
	onKeyDown: (props: SuggestionKeyDownProps) => boolean;
}

export function createSuggestion({
	autocomplete,
}: {
	autocomplete: ActorAutocompleteFn;
}): Omit<SuggestionOptions, "editor"> {
	return {
		async items({ query }) {
			const suggestions = await autocomplete({ query });
			return suggestions.slice(0, 8);
		},

		render: () => {
			let component: ReactRenderer<MentionListRef> | undefined;
			let popup: TippyInstance[] | undefined;

			return {
				onStart: (props) => {
					component = new ReactRenderer(MentionList, {
						props,
						editor: props.editor,
					});

					if (!props.clientRect) {
						return;
					}

					// getReferenceClientRect doesnt like that clientRect can return null -prf
					popup = tippy("body", {
						getReferenceClientRect: () => props.clientRect?.()!,
						appendTo: () => document.body,
						content: component.element,
						showOnCreate: true,
						interactive: true,
						trigger: "manual",
						placement: "bottom-start",
					});
				},

				onUpdate(props) {
					component?.updateProps(props);

					if (!props.clientRect) {
						return;
					}

					popup?.[0]?.setProps({
						// getReferenceClientRect doesnt like that clientRect can return null -prf
						getReferenceClientRect: () => props.clientRect?.()!,
					});
				},

				onKeyDown(props) {
					if (props.event.key === "Escape") {
						popup?.[0]?.hide();

						return true;
					}

					return component?.ref?.onKeyDown(props) || false;
				},

				onExit() {
					popup?.[0]?.destroy();
					component?.destroy();
				},
			};
		},
	};
}

const MentionList = forwardRef<MentionListRef, SuggestionProps>(function MentionListImpl(props: SuggestionProps, ref) {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const pal = usePalette("default");
	const { getGraphemeString } = useGrapheme();

	const selectItem = (index: number) => {
		const item = props.items[index];

		if (item) {
			props.command({ id: item.handle });
		}
	};

	const upHandler = () => {
		setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
	};

	const downHandler = () => {
		setSelectedIndex((selectedIndex + 1) % props.items.length);
	};

	const enterHandler = () => {
		selectItem(selectedIndex);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => setSelectedIndex(0), [props.items]);

	useImperativeHandle(ref, () => ({
		onKeyDown: ({ event }) => {
			if (event.key === "ArrowUp") {
				upHandler();
				return true;
			}

			if (event.key === "ArrowDown") {
				downHandler();
				return true;
			}

			if (event.key === "Enter" || event.key === "Tab") {
				enterHandler();
				return true;
			}

			return false;
		},
	}));

	const { items } = props;

	return (
		<div className="items">
			<div
				style={{
					...pal.borderDark,
					...pal.view,
					...styles.container,
				}}
			>
				{items.length > 0 ? (
					items.map((item, index) => {
						const { name: displayName } = getGraphemeString(
							sanitizeDisplayName(item.displayName || sanitizeHandle(item.handle)),
							30, // Heuristic value; can be modified
						);
						const isSelected = selectedIndex === index;

						return (
							<button
								type="button"
								key={item.handle}
								style={{
									...(isSelected ? pal.viewLight : undefined),
									...pal.borderDark,
									...styles.mentionContainer,

									...(index === 0
										? styles.firstMention
										: index === items.length - 1
											? styles.lastMention
											: undefined),
								}}
								onClick={() => {
									selectItem(index);
								}}
							>
								<div style={styles.avatarAndDisplayName}>
									<UserAvatar
										avatar={item.avatar ?? null}
										size={26}
										type={item.associated?.labeler ? "labeler" : "user"}
									/>
									<Text style={pal.text} numberOfLines={1}>
										{displayName}
									</Text>
								</div>
								<Text type="xs" style={pal.textLight} numberOfLines={1}>
									{sanitizeHandle(item.handle, "@")}
								</Text>
							</button>
						);
					})
				) : (
					<Text
						type="sm"
						style={{
							...pal.text,
							...styles.noResult,
						}}
					>
						No result
					</Text>
				)}
			</div>
		</div>
	);
});

const styles = {
	container: {
		width: 500,
		borderRadius: 6,
		borderWidth: 1,
		borderStyle: "solid",
		padding: 4,
	},
	mentionContainer: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		flexDirection: "row",
		padding: "8px 12px",
		gap: 4,
	},
	firstMention: {
		borderTopLeftRadius: 2,
		borderTopRightRadius: 2,
	},
	lastMention: {
		borderBottomLeftRadius: 2,
		borderBottomRightRadius: 2,
	},
	avatarAndDisplayName: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	noResult: {
		padding: "8px 12px",
	},
} satisfies Record<string, React.CSSProperties>;
