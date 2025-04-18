import { atoms as a, useTheme } from "#/alf";
import * as Menu from "#/components/Menu";
import { Text } from "#/components/Typography";
import { MagnifyingGlass2_Stroke2_Corner0_Rounded as Search } from "#/components/icons/MagnifyingGlass2";
// import {useDialogStateControlContext} from '#/state/dialogs'

export function Menus() {
	const t = useTheme();
	const menuControl = Menu.useMenuControl();
	// const {closeAllDialogs} = useDialogStateControlContext()

	return (
		<div style={a.gap_md}>
			<div
				style={{
					...a.flex_row,
					...a.align_start,
				}}
			>
				<Menu.Root control={menuControl}>
					<Menu.Trigger label="Open basic menu">
						{({ state, props: { onPress, ...props } }) => {
							return (
								<button type="button" onClick={onPress} {...props}>
									<Text
										style={{
											...a.py_sm,
											...a.px_md,
											...a.rounded_sm,
											...t.atoms.bg_contrast_50,
											...((state.hovered || state.focused || state.pressed) &&
												t.atoms.bg_contrast_200),
										}}
									>
										Open
									</Text>
								</button>
							);
						}}
					</Menu.Trigger>

					<Menu.Outer>
						<Menu.Group>
							<Menu.Item label="Click me" onPress={() => {}}>
								<Menu.ItemIcon icon={Search} />
								<Menu.ItemText>Click me</Menu.ItemText>
							</Menu.Item>

							<Menu.Item label="Another item" onPress={() => menuControl.close()}>
								<Menu.ItemText>Another item</Menu.ItemText>
							</Menu.Item>
						</Menu.Group>

						<Menu.Divider />

						<Menu.Group>
							<Menu.Item label="Click me" onPress={() => {}}>
								<Menu.ItemIcon icon={Search} />
								<Menu.ItemText>Click me</Menu.ItemText>
							</Menu.Item>

							<Menu.Item label="Another item" onPress={() => menuControl.close()}>
								<Menu.ItemText>Another item</Menu.ItemText>
							</Menu.Item>
						</Menu.Group>

						<Menu.Divider />

						<Menu.Item label="Click me" onPress={() => {}}>
							<Menu.ItemIcon icon={Search} />
							<Menu.ItemText>Click me</Menu.ItemText>
						</Menu.Item>
					</Menu.Outer>
				</Menu.Root>
			</div>
		</div>
	);
}
