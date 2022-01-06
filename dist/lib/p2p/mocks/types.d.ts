export interface Subscriptions {
    [index: string]: {
        callbacks?: ((arg0: any) => void)[];
        client?: any;
    };
}
export interface PayloadType {
    from: string;
    data: string;
}
//# sourceMappingURL=types.d.ts.map