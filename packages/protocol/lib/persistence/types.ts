import { Request, TransferRequest, BurnRequest, MetaRequest, RequestWithStatus, RequestStates } from '../types';


export interface PersistenceAdapter<Backend, Key> {
	/**
	 * Gets the transfer request from the backend of choice,
	 * with key as generic
	 */
	get: (key: Key) => Promise<Request | undefined>;
	/**
	 * Set the transfer request in the backend of choice,
	 * and return the key with which it is being stored
	 * Ideal for multiple storage schemes, i.e SQL,noSQL etc
	 */
	set: (request: Request) => Promise<Key>;
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
	 * Get all requests made
	 */
	getAllRequests: (filter?: string) => Promise<RequestWithStatus<Request>[]>;
	/**
	 * Get all transfer requests made
	 */
	getAllTransferRequests: () => Promise<RequestWithStatus<TransferRequest>[]>;
	/**
	 * Get all burn requests made
	 */
	getAllBurnRequests: () => Promise<RequestWithStatus<BurnRequest>[]>;
	/**
	 * Get all meta requests made
	 */
	// getAllMetaRequests: () => Promise<RequestWithStatus<MetaRequest>[]>;
	/**
	 * The Backend of choice.
	 */
	backend: Backend;
}

