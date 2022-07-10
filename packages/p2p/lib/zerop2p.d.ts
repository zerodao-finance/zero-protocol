declare const Libp2p: any;
export declare class ZeroP2P extends Libp2p {
    static PRESETS: {
        MAINNET: string;
        'DEV-MAINNET': string;
    };
    static fromPresetOrMultiAddr(multiaddr: any): any;
    static toMessage(password: any): string;
    static peerIdFromSeed(seed: any): Promise<any>;
    static fromSeed({ signer, seed, multiaddr }: {
        signer: any;
        seed: any;
        multiaddr: any;
    }): Promise<ZeroP2P>;
    static fromPassword({ signer, multiaddr, password }: {
        signer: any;
        multiaddr: any;
        password: any;
    }): Promise<ZeroP2P>;
    start(): Promise<void>;
    setSigner(signer: any): void;
    constructor(options: any);
}
export {};
