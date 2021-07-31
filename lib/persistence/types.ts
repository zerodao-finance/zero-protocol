import { TransferRequest } from '../types';

export interface PersistenceAdapter<Backend, Key> {
	/**
	 * Gets the transfer request from the backend of choice,
	 * with key as generic
	 */
	get: (key: Key) => Promise<TransferRequest | undefined>;
	/**
	 * Set the transfer request in the backend of choice,
	 * and return the key with which it is being stored
	 * Ideal for multiple storage schemes, i.e SQL,noSQL etc
	 */
	set: (transferRequest: TransferRequest) => Promise<Key>;
	/**
	 * Remove the transfer request from the backend
	 */
	remove: (key: Key) => Promise<boolean>;
	/**
	 * Checks if the transfer request exists in the backend
	 * of choice
	 */
	has: (key: Key) => Promise<boolean>;
	/**
	 * The Backend of choice.
	 */
	backend: Backend;
}
