import React from "react";
import { Button, type ButtonColor, ButtonIcon, ButtonText, type ButtonVariant } from "#/components/Button";
import { H1 } from "#/components/Typography";
import { ChevronLeft_Stroke2_Corner0_Rounded as ChevronLeft } from "#/components/icons/Chevron";
import { Globe_Stroke2_Corner0_Rounded as Globe } from "#/components/icons/Globe";

export function Buttons() {
	return (
		<div style={{ gap: 12 }}>
			<H1>Buttons</H1>
			<div
				style={{
					flexDirection: "row",
					flexWrap: "wrap",
					gap: 12,
					alignItems: "flex-start",
				}}
			>
				{["primary", "secondary", "secondary_inverted", "negative"].map((color) => (
					<div
						key={color}
						style={{
							gap: 12,
							alignItems: "flex-start",
						}}
					>
						{["solid", "outline", "ghost"].map((variant) => (
							<React.Fragment key={variant}>
								<Button
									variant={variant as ButtonVariant}
									color={color as ButtonColor}
									size="large"
									label="Click here"
								>
									<ButtonText>Button</ButtonText>
								</Button>
								<Button
									disabled
									variant={variant as ButtonVariant}
									color={color as ButtonColor}
									size="large"
									label="Click here"
								>
									<ButtonText>Button</ButtonText>
								</Button>
							</React.Fragment>
						))}
					</div>
				))}

				<div
					style={{
						flexDirection: "row",
						gap: 12,
						alignItems: "flex-start",
					}}
				>
					<div
						style={{
							gap: 12,
							alignItems: "flex-start",
						}}
					>
						{["gradient_sky", "gradient_midnight", "gradient_sunrise"].map((name) => (
							<React.Fragment key={name}>
								<Button variant="gradient" color={name as ButtonColor} size="large" label="Click here">
									<ButtonText>Button</ButtonText>
								</Button>
								<Button
									disabled
									variant="gradient"
									color={name as ButtonColor}
									size="large"
									label="Click here"
								>
									<ButtonText>Button</ButtonText>
								</Button>
							</React.Fragment>
						))}
					</div>
				</div>
			</div>
			<div
				style={{
					flexWrap: "wrap",
					gap: 12,
					alignItems: "flex-start",
				}}
			>
				<Button variant="solid" color="primary" size="large" label="Link out">
					<ButtonText>Button</ButtonText>
				</Button>
				<Button variant="solid" color="primary" size="large" label="Link out">
					<ButtonText>Button</ButtonText>
					<ButtonIcon icon={Globe} position="right" />
				</Button>

				<Button variant="solid" color="primary" size="small" label="Link out">
					<ButtonText>Button</ButtonText>
				</Button>
				<Button variant="solid" color="primary" size="small" label="Link out">
					<ButtonText>Button</ButtonText>
					<ButtonIcon icon={Globe} position="right" />
				</Button>

				<Button variant="solid" color="primary" size="tiny" label="Link out">
					<ButtonIcon icon={Globe} position="left" />
					<ButtonText>Button</ButtonText>
				</Button>
			</div>
			<div
				style={{
					flexDirection: "row",
					gap: 12,
					alignItems: "center",
				}}
			>
				<Button variant="solid" color="primary" size="large" label="Link out">
					<ButtonText>Button</ButtonText>
				</Button>
				<Button variant="solid" color="primary" size="large" label="Link out">
					<ButtonText>Button</ButtonText>
					<ButtonIcon icon={Globe} position="right" />
				</Button>
				<Button variant="solid" color="primary" size="large" label="Link out">
					<ButtonText>Button</ButtonText>
					<ButtonIcon icon={Globe} position="right" size="lg" />
				</Button>
				<Button variant="solid" color="primary" size="large" shape="round" label="Link out">
					<ButtonIcon icon={ChevronLeft} />
				</Button>
				<Button variant="solid" color="primary" size="large" shape="round" label="Link out">
					<ButtonIcon icon={ChevronLeft} size="lg" />
				</Button>
			</div>
			<div
				style={{
					flexDirection: "row",
					gap: 12,
					alignItems: "center",
				}}
			>
				<Button variant="solid" color="primary" size="small" label="Link out">
					<ButtonText>Button</ButtonText>
				</Button>
				<Button variant="solid" color="primary" size="small" label="Link out">
					<ButtonText>Button</ButtonText>
					<ButtonIcon icon={Globe} position="right" />
				</Button>
				<Button variant="solid" color="primary" size="small" shape="round" label="Link out">
					<ButtonIcon icon={ChevronLeft} />
				</Button>
				<Button variant="solid" color="primary" size="small" shape="round" label="Link out">
					<ButtonIcon icon={ChevronLeft} size="lg" />
				</Button>
			</div>
			<div
				style={{
					flexDirection: "row",
					gap: 12,
					alignItems: "center",
				}}
			>
				<Button variant="solid" color="primary" size="tiny" label="Link out">
					<ButtonText>Button</ButtonText>
				</Button>
				<Button variant="solid" color="primary" size="tiny" label="Link out">
					<ButtonText>Button</ButtonText>
					<ButtonIcon icon={Globe} position="right" />
				</Button>
				<Button variant="solid" color="primary" size="tiny" shape="round" label="Link out">
					<ButtonIcon icon={ChevronLeft} />
				</Button>
				<Button variant="solid" color="primary" size="tiny" shape="round" label="Link out">
					<ButtonIcon icon={ChevronLeft} size="md" />
				</Button>
			</div>
			<div
				style={{
					flexDirection: "row",
					gap: 12,
					alignItems: "center",
				}}
			>
				<Button variant="solid" color="primary" size="large" shape="round" label="Link out">
					<ButtonIcon icon={ChevronLeft} />
				</Button>
				<Button variant="gradient" color="gradient_sunset" size="small" shape="round" label="Link out">
					<ButtonIcon icon={ChevronLeft} />
				</Button>
				<Button variant="gradient" color="gradient_sunset" size="tiny" shape="round" label="Link out">
					<ButtonIcon icon={ChevronLeft} />
				</Button>
				<Button variant="outline" color="primary" size="large" shape="round" label="Link out">
					<ButtonIcon icon={ChevronLeft} />
				</Button>
				<Button variant="ghost" color="primary" size="small" shape="round" label="Link out">
					<ButtonIcon icon={ChevronLeft} />
				</Button>
				<Button variant="ghost" color="primary" size="tiny" shape="round" label="Link out">
					<ButtonIcon icon={ChevronLeft} />
				</Button>
			</div>
			<div
				style={{
					flexDirection: "row",
					gap: 12,
					alignItems: "flex-start",
				}}
			>
				<Button variant="solid" color="primary" size="large" shape="square" label="Link out">
					<ButtonIcon icon={ChevronLeft} />
				</Button>
				<Button variant="gradient" color="gradient_sunset" size="small" shape="square" label="Link out">
					<ButtonIcon icon={ChevronLeft} />
				</Button>
				<Button variant="gradient" color="gradient_sunset" size="tiny" shape="square" label="Link out">
					<ButtonIcon icon={ChevronLeft} />
				</Button>
				<Button variant="outline" color="primary" size="large" shape="square" label="Link out">
					<ButtonIcon icon={ChevronLeft} />
				</Button>
				<Button variant="ghost" color="primary" size="small" shape="square" label="Link out">
					<ButtonIcon icon={ChevronLeft} />
				</Button>
				<Button variant="ghost" color="primary" size="tiny" shape="square" label="Link out">
					<ButtonIcon icon={ChevronLeft} />
				</Button>
			</div>
		</div>
	);
}
