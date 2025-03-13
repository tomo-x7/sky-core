import type { BskyAgent } from "@atproto/api";
import * as Notifications from "expo-notifications";
import { setBadgeCountAsync } from "expo-notifications";
import React from "react";

import { devicePlatform } from "#/platform/detection";
import { type SessionAccount, useAgent, useSession } from "#/state/session";
import BackgroundNotificationHandler from "../../../modules/expo-background-notification-handler";

const SERVICE_DID = (serviceUrl?: string) =>
	serviceUrl?.includes("staging") ? "did:web:api.staging.bsky.dev" : "did:web:api.bsky.app";

async function registerPushToken(agent: BskyAgent, account: SessionAccount, token: Notifications.DevicePushToken) {
	try {
		await agent.api.app.bsky.notification.registerPush({
			serviceDid: SERVICE_DID(account.service),
			platform: devicePlatform,
			token: token.data,
			appId: "xyz.blueskyweb.app",
		});
	} catch (error) {
		console.error("Notifications: Failed to set push token", { message: error });
	}
}

async function getPushToken(skipPermissionCheck = false) {
	const granted = skipPermissionCheck || (await Notifications.getPermissionsAsync()).granted;
	if (granted) {
		return Notifications.getDevicePushTokenAsync();
	}
}

export function useNotificationsRegistration() {
	const agent = useAgent();
	const { currentAccount } = useSession();

	React.useEffect(() => {
		if (!currentAccount) {
			return;
		}

		getPushToken();

		// According to the Expo docs, there is a chance that the token will change while the app is open in some rare
		// cases. This will fire `registerPushToken` whenever that happens.
		//@ts-ignore
		const subscription = Notifications.addPushTokenListener(async (newToken) => {
			registerPushToken(agent, currentAccount, newToken);
		});

		return () => {
			subscription.remove();
		};
	}, [currentAccount, agent]);
}

export function useRequestNotificationsPermission() {
	return async (context: "StartOnboarding" | "AfterOnboarding" | "Login" | "Home") => {
		return;
	};
}

export async function decrementBadgeCount() {
	return;
}

export async function resetBadgeCount() {
	await BackgroundNotificationHandler.setBadgeCountAsync(0);
	await setBadgeCountAsync(0);
}
