import React from "react";

import { atoms as a, useTheme } from "#/alf";
import { Button, ButtonIcon } from "#/components/Button";
import * as TextField from "#/components/forms/TextField";
import { MagnifyingGlass2_Stroke2_Corner0_Rounded as MagnifyingGlassIcon } from "#/components/icons/MagnifyingGlass2";
import { TimesLarge_Stroke2_Corner0_Rounded as X } from "#/components/icons/Times";
import { HITSLOP_10 } from "#/lib/constants";

type SearchInputProps = Omit<TextField.InputProps, "label"> & {
	label?: TextField.InputProps["label"];
	/**
	 * Called when the user presses the (X) button
	 */
	onClearText?: () => void;
};

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
	{ value, label, onClearText, ...rest },
	ref,
) {
	const t = useTheme();
	const showClear = value && value.length > 0;

	return (
		<div
			style={{
				...a.w_full,
				...a.relative,
			}}
		>
			<TextField.Root>
				<TextField.Icon icon={MagnifyingGlassIcon} />
				<TextField.Input
					inputRef={ref}
					label={label || "Search"}
					value={value}
					placeholder={"Search"}
					returnKeyType="search"
					autoFocus={false}
					autoComplete="off"
					autoCapitalize="none"
					style={
						showClear
							? {
									paddingRight: 24,
								}
							: {}
					}
					{...rest}
				/>
			</TextField.Root>
			{showClear && (
				<div
					style={{
						...a.absolute,
						...a.z_20,
						...a.my_auto,
						...a.inset_0,
						...a.justify_center,
						...a.pr_sm,
						...{ left: "auto" },
					}}
				>
					<Button
						onPress={onClearText}
						label={"Clear search query"}
						hitSlop={HITSLOP_10}
						size="tiny"
						shape="round"
						variant="ghost"
						color="secondary"
					>
						<ButtonIcon icon={X} size="xs" />
					</Button>
				</div>
			)}
		</div>
	);
});
