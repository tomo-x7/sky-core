import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import React from "react";

import { flatten } from "#/alf";
import { useTheme } from "#/lib/ThemeContext";
import { usePalette } from "#/lib/hooks/usePalette";

// Custom Dropdown Menu Components
// ==
 const DropdownMenuRoot = DropdownMenu.Root;

type ItemProps = React.ComponentProps<(typeof DropdownMenu)["Item"]>;
const DropdownMenuItem = (props: ItemProps) => {
	const theme = useTheme();
	const [focused, setFocused] = React.useState(false);
	const backgroundColor = theme.colorScheme === "dark" ? "#fff1" : "#0001";

	return (
		<DropdownMenu.Item
			className="nativeDropdown-item"
			{...props}
			style={flatten([styles.item, focused && { backgroundColor: backgroundColor }])}
			onFocus={() => {
				setFocused(true);
			}}
			onBlur={() => {
				setFocused(false);
			}}
		/>
	);
};

// Types for Dropdown Menu and Items
export type DropdownItem = {
	label: string | "separator";
	onPress?: () => void;
	icon?: {
		ios: unknown;
		android: string;
		web: IconProp;
	};
};
type Props = {
	items: DropdownItem[];
	accessibilityLabel?: string;
	accessibilityHint?: string;
	triggerStyle?: React.CSSProperties;
};

export function NativeDropdown({
	items,
	children,
	accessibilityLabel,
	accessibilityHint,
	triggerStyle,
}: React.PropsWithChildren<Props>) {
	const [open, setOpen] = React.useState(false);
	const buttonRef = React.useRef<HTMLButtonElement>(null);
	const menuRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		if (!open) {
			return;
		}

		function clickHandler(e: MouseEvent) {
			const t = e.target;

			if (!open) return;
			if (!t) return;
			if (!buttonRef.current || !menuRef.current) return;

			if (
				t !== buttonRef.current &&
				!buttonRef.current.contains(t as Node) &&
				t !== menuRef.current &&
				!menuRef.current.contains(t as Node)
			) {
				// prevent clicking through to links beneath dropdown
				// only applies to mobile web
				e.preventDefault();
				e.stopPropagation();

				// close menu
				setOpen(false);
			}
		}

		function keydownHandler(e: KeyboardEvent) {
			if (e.key === "Escape" && open) {
				setOpen(false);
			}
		}

		document.addEventListener("click", clickHandler, true);
		window.addEventListener("keydown", keydownHandler, true);
		return () => {
			document.removeEventListener("click", clickHandler, true);
			window.removeEventListener("keydown", keydownHandler, true);
		};
	}, [open]);

	return (
		<DropdownMenuRoot open={open} onOpenChange={(o) => setOpen(o)}>
			<DropdownMenu.Trigger asChild>
				<button
					type="button"
					ref={buttonRef}
					onPointerDown={(e) => {
						// Prevent false positive that interpret mobile scroll as a tap.
						// This requires the custom onPress handler below to compensate.
						// https://github.com/radix-ui/primitives/issues/1912
						e.preventDefault();
					}}
					onClick={() => {
						if (window.event instanceof KeyboardEvent) {
							// The onPointerDown hack above is not relevant to this press, so don't do anything.
							return;
						}
						// Compensate for the disabled onPointerDown above by triggering it manually.
						setOpen((o) => !o);
					}}
					// TODO
					// hitSlop={HITSLOP_10}
					style={triggerStyle}
				>
					{children}
				</button>
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownContent items={items} menuRef={menuRef} />
			</DropdownMenu.Portal>
		</DropdownMenuRoot>
	);
}

function DropdownContent({
	items,
	menuRef,
}: {
	items: DropdownItem[];
	menuRef: React.RefObject<HTMLDivElement | null>;
}) {
	const pal = usePalette("default");
	const theme = useTheme();
	const dropDownBackgroundColor = theme.colorScheme === "dark" ? pal.btn : pal.view;
	const { borderColor: separatorColor } = theme.colorScheme === "dark" ? pal.borderDark : pal.border;

	return (
		<DropdownMenu.Content
			//@ts-expect-error
			ref={menuRef}
			style={flatten([styles.content, dropDownBackgroundColor])}
			loop
		>
			{items.map((item, index) => {
				if (item.label === "separator") {
					return (
						<DropdownMenu.Separator
							key={getKey(item.label, index)}
							style={flatten([styles.separator, { backgroundColor: separatorColor }])}
						/>
					);
				}
				if (index > 1 && items[index - 1].label === "separator") {
					return (
						<DropdownMenu.Group key={getKey(item.label, index)}>
							<DropdownMenuItem key={getKey(item.label, index)} onSelect={item.onPress}>
								<span
									unselectable={"on"}
									style={{
										...pal.text,
										...styles.itemTitle,
									}}
								>
									{item.label}
								</span>
								{item.icon && (
									// @ts-expect-error
									<FontAwesomeIcon icon={item.icon.web} size={20} color={pal.colors.textLight} />
								)}
							</DropdownMenuItem>
						</DropdownMenu.Group>
					);
				}
				return (
					<DropdownMenuItem key={getKey(item.label, index)} onSelect={item.onPress}>
						<span
							unselectable={"on"}
							style={{
								...pal.text,
								...styles.itemTitle,
							}}
						>
							{item.label}
						</span>
						{/* @ts-expect-error */}
						{item.icon && <FontAwesomeIcon icon={item.icon.web} size={20} color={pal.colors.textLight} />}
					</DropdownMenuItem>
				);
			})}
		</DropdownMenu.Content>
	);
}

const getKey = (label: string, index: number, id?: string) => {
	if (id) {
		return id;
	}
	return `${label}_${index}`;
};

const styles = {
	separator: {
		height: 1,
		marginTop: 4,
		marginBottom: 4,
	},
	content: {
		backgroundColor: "#f0f0f0",
		borderRadius: 8,
		paddingTop: 4,
		paddingBottom: 4,
		paddingLeft: 4,
		paddingRight: 4,
		marginTop: 6,
		boxShadow: "rgba(0, 0, 0, 0.3) 0px 5px 20px",
	},
	item: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		columnGap: 20,
		cursor: "pointer",
		paddingTop: 8,
		paddingBottom: 8,
		paddingLeft: 12,
		paddingRight: 12,
		borderRadius: 8,
		fontFamily:
			'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Liberation Sans", Helvetica, Arial, sans-serif',
		outline: 0,
		border: 0,
	},
	itemTitle: {
		fontSize: 16,
		fontWeight: "600",
		paddingRight: 10,
	},
} satisfies Record<string, React.CSSProperties>;
