import { TransferRequest } from '../types';

export type RequestStates = 'pending' | 'failed' | 'succeeded';

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
	 * Returns the status of the transfer request
	 */
	getStatus: (key: Key) => Promise<RequestStates>;
	/**
	 * Updates the status of pending transaction
	 */
	setStatus: (key: Key, status: RequestStates) => Promise<void>;
	/**
	 * Get all transfer requests made
	 */
	getAllTransferRequests: () => Promise<TransferRequestWithStatus[]>;
	/**
	 * The Backend of choice.
	 */
	backend: Backend;
}

export interface TransferRequestWithStatus extends TransferRequest {
	status: RequestStates;
}
