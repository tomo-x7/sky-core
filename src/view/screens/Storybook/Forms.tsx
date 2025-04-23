import React from "react";

import { atoms as a } from "#/alf";
import { Button, ButtonText } from "#/components/Button";
import { H1, H3 } from "#/components/Typography";
import { DateField, LabelText } from "#/components/forms/DateField";
import * as TextField from "#/components/forms/TextField";
import * as Toggle from "#/components/forms/Toggle";
import * as ToggleButton from "#/components/forms/ToggleButton";
import { Globe_Stroke2_Corner0_Rounded as Globe } from "#/components/icons/Globe";

export function Forms() {
	const [toggleGroupAValues, setToggleGroupAValues] = React.useState(["a"]);
	const [toggleGroupBValues, setToggleGroupBValues] = React.useState(["a", "b"]);
	const [toggleGroupCValues, setToggleGroupCValues] = React.useState(["a", "b"]);
	const [toggleGroupDValues, setToggleGroupDValues] = React.useState(["warn"]);

	const [value, setValue] = React.useState("");
	const [date, setDate] = React.useState("2001-01-01");

	const inputRef = React.useRef<HTMLInputElement>(null);

	return (
		<div
			style={{
				gap: 32,
				alignItems: "flex-start",
			}}
		>
			<H1>Forms</H1>
			<div
				style={{
					gap: 12,
					alignItems: "flex-start",
					width: "100%",
				}}
			>
				<H3>InputText</H3>

				<TextField.Input value={value} onChangeText={setValue} label="Text field" />

				<div
					style={{
						flexDirection: "row",
						alignItems: "flex-start",
						gap: 8,
					}}
				>
					<div style={{ flex: 1 }}>
						<TextField.Root>
							<TextField.Icon icon={Globe} />
							<TextField.Input
								inputRef={inputRef}
								value={value}
								onChangeText={setValue}
								label="Text field"
							/>
						</TextField.Root>
					</div>
					<Button
						label="Submit"
						size="large"
						variant="solid"
						color="primary"
						onPress={() => (inputRef.current ? (inputRef.current.value = "") : undefined)}
					>
						<ButtonText>Submit</ButtonText>
					</Button>
				</div>

				<TextField.Root>
					<TextField.Icon icon={Globe} />
					<TextField.Input value={value} onChangeText={setValue} label="Text field" />
				</TextField.Root>

				<TextField.Root>
					<TextField.Icon icon={Globe} />
					<TextField.Input value={value} onChangeText={setValue} label="Text field" isInvalid />
				</TextField.Root>

				<div style={{ width:"100%" }}>
					<TextField.LabelText>Text field</TextField.LabelText>
					<TextField.Root>
						<TextField.Icon icon={Globe} />
						<TextField.Input value={value} onChangeText={setValue} label="Text field" />
						<TextField.SuffixText>@gmail.com</TextField.SuffixText>
					</TextField.Root>
				</div>

				<div style={{ width:"100%" }}>
					<TextField.LabelText>Textarea</TextField.LabelText>
					<TextField.Input
						multiline
						// TODO
						// numberOfLines={4}
						defaultValue={value}
						onChangeText={setValue}
						label="Text field"
					/>
				</div>

				<H3>DateField</H3>

				<div style={{ width:"100%" }}>
					<LabelText>Date</LabelText>
					<DateField
						value={date}
						onChangeDate={(date) => {
							console.log(date);
							setDate(date);
						}}
						label="Input"
					/>
				</div>
			</div>
			<div
				style={{
					gap: 12,
					alignItems: "flex-start",
					width: "100%",
				}}
			>
				<H3>Toggles</H3>

				<Toggle.Item name="a" label="Click me">
					<Toggle.Checkbox />
					<Toggle.LabelText>Uncontrolled toggle</Toggle.LabelText>
				</Toggle.Item>

				<Toggle.Group
					label="Toggle"
					type="checkbox"
					maxSelections={2}
					values={toggleGroupAValues}
					onChange={setToggleGroupAValues}
				>
					<div style={{ gap: 12 }}>
						<Toggle.Item name="a" label="Click me">
							<Toggle.Switch />
							<Toggle.LabelText>Click me</Toggle.LabelText>
						</Toggle.Item>
						<Toggle.Item name="b" label="Click me">
							<Toggle.Switch />
							<Toggle.LabelText>Click me</Toggle.LabelText>
						</Toggle.Item>
						<Toggle.Item name="c" label="Click me">
							<Toggle.Switch />
							<Toggle.LabelText>Click me</Toggle.LabelText>
						</Toggle.Item>
						<Toggle.Item name="d" disabled label="Click me">
							<Toggle.Switch />
							<Toggle.LabelText>Click me</Toggle.LabelText>
						</Toggle.Item>
						<Toggle.Item name="e" isInvalid label="Click me">
							<Toggle.Switch />
							<Toggle.LabelText>Click me</Toggle.LabelText>
						</Toggle.Item>
					</div>
				</Toggle.Group>

				<Toggle.Group
					label="Toggle"
					type="checkbox"
					maxSelections={2}
					values={toggleGroupBValues}
					onChange={setToggleGroupBValues}
				>
					<div style={{ gap: 12 }}>
						<Toggle.Item name="a" label="Click me">
							<Toggle.Checkbox />
							<Toggle.LabelText>Click me</Toggle.LabelText>
						</Toggle.Item>
						<Toggle.Item name="b" label="Click me">
							<Toggle.Checkbox />
							<Toggle.LabelText>Click me</Toggle.LabelText>
						</Toggle.Item>
						<Toggle.Item name="c" label="Click me">
							<Toggle.Checkbox />
							<Toggle.LabelText>Click me</Toggle.LabelText>
						</Toggle.Item>
						<Toggle.Item name="d" disabled label="Click me">
							<Toggle.Checkbox />
							<Toggle.LabelText>Click me</Toggle.LabelText>
						</Toggle.Item>
						<Toggle.Item name="e" isInvalid label="Click me">
							<Toggle.Checkbox />
							<Toggle.LabelText>Click me</Toggle.LabelText>
						</Toggle.Item>
					</div>
				</Toggle.Group>

				<Toggle.Group label="Toggle" type="radio" values={toggleGroupCValues} onChange={setToggleGroupCValues}>
					<div style={{ gap: 12 }}>
						<Toggle.Item name="a" label="Click me">
							<Toggle.Radio />
							<Toggle.LabelText>Click me</Toggle.LabelText>
						</Toggle.Item>
						<Toggle.Item name="b" label="Click me">
							<Toggle.Radio />
							<Toggle.LabelText>Click me</Toggle.LabelText>
						</Toggle.Item>
						<Toggle.Item name="c" label="Click me">
							<Toggle.Radio />
							<Toggle.LabelText>Click me</Toggle.LabelText>
						</Toggle.Item>
						<Toggle.Item name="d" disabled label="Click me">
							<Toggle.Radio />
							<Toggle.LabelText>Click me</Toggle.LabelText>
						</Toggle.Item>
						<Toggle.Item name="e" isInvalid label="Click me">
							<Toggle.Radio />
							<Toggle.LabelText>Click me</Toggle.LabelText>
						</Toggle.Item>
					</div>
				</Toggle.Group>
			</div>
			<Button
				variant="gradient"
				color="gradient_nordic"
				size="small"
				label="Reset all toggles"
				onPress={() => {
					setToggleGroupAValues(["a"]);
					setToggleGroupBValues(["a", "b"]);
					setToggleGroupCValues(["a"]);
				}}
			>
				<ButtonText>Reset all toggles</ButtonText>
			</Button>
			<div
				style={{
					gap: 12,
					alignItems: "flex-start",
					width: "100%",
				}}
			>
				<H3>ToggleButton</H3>

				<ToggleButton.Group label="Preferences" values={toggleGroupDValues} onChange={setToggleGroupDValues}>
					<ToggleButton.Button name="hide" label="Hide">
						<ToggleButton.ButtonText>Hide</ToggleButton.ButtonText>
					</ToggleButton.Button>
					<ToggleButton.Button name="warn" label="Warn">
						<ToggleButton.ButtonText>Warn</ToggleButton.ButtonText>
					</ToggleButton.Button>
					<ToggleButton.Button name="show" label="Show">
						<ToggleButton.ButtonText>Show</ToggleButton.ButtonText>
					</ToggleButton.Button>
				</ToggleButton.Group>

				<div>
					<ToggleButton.Group
						label="Preferences"
						values={toggleGroupDValues}
						onChange={setToggleGroupDValues}
					>
						<ToggleButton.Button name="hide" label="Hide">
							<ToggleButton.ButtonText>Hide</ToggleButton.ButtonText>
						</ToggleButton.Button>
						<ToggleButton.Button name="warn" label="Warn">
							<ToggleButton.ButtonText>Warn</ToggleButton.ButtonText>
						</ToggleButton.Button>
						<ToggleButton.Button name="show" label="Show">
							<ToggleButton.ButtonText>Show</ToggleButton.ButtonText>
						</ToggleButton.Button>
					</ToggleButton.Group>
				</div>
			</div>
		</div>
	);
}
