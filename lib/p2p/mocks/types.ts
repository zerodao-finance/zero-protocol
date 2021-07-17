export interface Subscriptions {
	[index: string]: {
		callbacks?: ((string) => void)[];
		// ioredis-mock doesn't have exported types.
		client?: any;
	};
}
