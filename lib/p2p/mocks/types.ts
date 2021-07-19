export interface Subscriptions {
	[index: string]: {
		callbacks?: ((arg0: any) => void)[];
		// ioredis-mock doesn't have exported types.
		client?: any;
	};
}

export interface PayloadType {
	from: string;
	data: string;
}
