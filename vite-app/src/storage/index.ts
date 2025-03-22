import { useCallback, useEffect, useState } from "react";

import type { Account, Device } from "./schema";

export * from "./schema";

const listeners: Map<string, Set<() => void>> = new Map();
/**
 * Generic storage class. DO NOT use this directly. Instead, use the exported
 * storage instances below.
 */
export class Storage<Scopes extends unknown[], Schema> {
	protected sep = ":";
	// protected store: MMKV;
	protected id: string;

	constructor({ id }: { id: string }) {
		// this.store = new MMKV({ id });
		this.id = id;
	}
	protected getKey(scopes: unknown[]) {
		return `${this.id}::${scopes.join(this.sep)}`;
	}

	/**
	 * Store a value in storage based on scopes and/or keys
	 *
	 *   `set([key], value)`
	 *   `set([scope, key], value)`
	 */
	set<Key extends keyof Schema>(scopes: [...Scopes, Key], data: Schema[Key]): void {
		// stored as `{ data: <value> }` structure to ease stringification
		// this.store.set(scopes.join(this.sep), JSON.stringify({ data }));
		const key = this.getKey(scopes);
		localStorage.setItem(key, JSON.stringify({ data }));
		listeners.get(key)?.forEach((callback) => callback());
	}

	/**
	 * Get a value from storage based on scopes and/or keys
	 *
	 *   `get([key])`
	 *   `get([scope, key])`
	 */
	get<Key extends keyof Schema>(scopes: [...Scopes, Key]): Schema[Key] | undefined {
		// const res = this.store.getString(scopes.join(this.sep));
		const res = localStorage.getItem(this.getKey(scopes));
		if (!res) return undefined;
		// parsed from storage structure `{ data: <value> }`
		return JSON.parse(res).data;
	}

	/**
	 * Remove a value from storage based on scopes and/or keys
	 *
	 *   `remove([key])`
	 *   `remove([scope, key])`
	 */
	remove<Key extends keyof Schema>(scopes: [...Scopes, Key]) {
		// this.store.delete(scopes.join(this.sep));
		const key = this.getKey(scopes);
		localStorage.removeItem(key);
		listeners.get(key)?.forEach((callback) => callback());
	}

	/**
	 * Remove many values from the same storage scope by keys
	 *
	 *   `removeMany([], [key])`
	 *   `removeMany([scope], [key])`
	 */
	removeMany<Key extends keyof Schema>(scopes: [...Scopes], keys: Key[]) {
		keys.forEach((key) => this.remove([...scopes, key]));
	}

	/**
	 * Fires a callback when the storage associated with a given key changes
	 *
	 * @returns Listener - call `remove()` to stop listening
	 */
	addOnValueChangedListener<Key extends keyof Schema>(scopes: [...Scopes, Key], callback: () => void) {
		// return this.store.addOnValueChangedListener((key) => {
		// 	if (key === scopes.join(this.sep)) {
		// 		callback();
		// 	}
		// });
		const key = this.getKey(scopes);
		if (!listeners.has(key)) listeners.set(key, new Set());
		listeners.get(key)!.add(callback);
		return {
			remove: () => {
				listeners.get(key)?.delete(callback);
			},
		};
	}
}

type StorageSchema<T extends Storage<any, any>> = T extends Storage<any, infer U> ? U : never;
type StorageScopes<T extends Storage<any, any>> = T extends Storage<infer S, any> ? S : never;

/**
 * Hook to use a storage instance. Acts like a useState hook, but persists the
 * value in storage.
 */
export function useStorage<Store extends Storage<any, any>, Key extends keyof StorageSchema<Store>>(
	storage: Store,
	scopes: [...StorageScopes<Store>, Key],
): [StorageSchema<Store>[Key] | undefined, (data: StorageSchema<Store>[Key]) => void] {
	type Schema = StorageSchema<Store>;
	const [value, setValue] = useState<Schema[Key] | undefined>(() => storage.get(scopes));

	useEffect(() => {
		const sub = storage.addOnValueChangedListener(scopes, () => {
			setValue(storage.get(scopes));
		});
		return () => sub.remove();
	}, [storage, scopes]);

	const setter = useCallback(
		(data: Schema[Key]) => {
			setValue(data);
			storage.set(scopes, data);
		},
		[storage, scopes],
	);

	return [value, setter] as const;
}

/**
 * Device data that's specific to the device and does not vary based on account
 *
 *   `device.set([key], true)`
 */
export const device = new Storage<[], Device>({ id: "bsky_device" });

/**
 * Account data that's specific to the account on this device
 */
export const account = new Storage<[string], Account>({ id: "bsky_account" });
