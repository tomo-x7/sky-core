import React from "react";

import { useTheme } from "#/alf";
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
				width: "100%",
				position: "relative",
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
						position: "absolute",
						zIndex: 20,
						marginTop: "auto",
						marginBottom: "auto",
						top: 0,
						right: 0,
						bottom: 0,
						justifyContent: "center",
						paddingRight: 8,
						left: "auto",
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
