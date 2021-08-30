import hash from 'object-hash';
export class LocalStoragePersistenceAdapter {
    constructor() {
        this.backend = window.localStorage;
    }
    async set(transferRequest) {
        const key = hash(transferRequest);
        const status = Object.assign(Object.assign({}, transferRequest), { status: 'pending' });
        const serialized = JSON.stringify(status);
        try {
            await this.backend.setItem(`request:${key}`, serialized);
            return key;
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    async get(key) {
        try {
            const value = await this.backend.getItem(`request:${key}`);
            if (value) {
                const parsed = JSON.parse(value);
                return parsed;
            }
            else
                throw new Error('Could not find transferRequest');
        }
        catch (e) {
            return undefined;
        }
    }
    async remove(key) {
        try {
            await this.backend.removeItem(`request:${key}`);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    async has(key) {
        try {
            const value = await this.get(key);
            if (value)
                return true;
            return false;
        }
        catch (e) {
            return false;
        }
    }
    async getStatus(key) {
        try {
            const value = (await this.get(key));
            return value === null || value === void 0 ? void 0 : value.status;
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    async setStatus(key, status) {
        try {
            const value = (await this.get(key));
            if (value) {
                value.status = status;
                this.backend.setItem(key, JSON.stringify(value));
            }
            throw new Error(`No transfer request with key: ${key}`);
        }
        catch (e) { }
    }
    async getAllTransferRequests() {
        const keys = Object.keys(this.backend).filter((v) => v.startsWith('request:'));
        const returnArr = [];
        for (const key of keys) {
            returnArr.push((await this.get(key)));
        }
        return returnArr;
    }
}
//# sourceMappingURL=localStorage.js.map