import hash from 'object-hash';
export class InMemoryPersistenceAdapter {
    constructor() {
        this.backend = new Map();
    }
    async set(transferRequest) {
        const key = hash(transferRequest);
        const status = Object.assign(Object.assign({}, transferRequest), { status: 'pending' });
        try {
            await this.backend.set(key, status);
            return key;
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    async get(key) {
        try {
            const value = this.backend.get(key);
            if (value) {
                return value;
            }
            else
                return undefined;
        }
        catch (e) {
            return undefined;
        }
    }
    async remove(key) {
        try {
            await this.backend.delete(key);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    async has(key) {
        try {
            return await this.backend.has(key);
        }
        catch (e) {
            return false;
        }
    }
    async getStatus(key) {
        try {
            const value = (await this.get(key));
            if (value) {
                return value.status;
            }
            else {
                throw new Error(`No transfer request with key: ${key}`);
            }
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
                await this.backend.set(key, value);
            }
            else
                throw new Error(`No transfer request with key: ${key}`);
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    async getAllTransferRequests() {
        return Array.from(this.backend.values());
    }
}
//# sourceMappingURL=inMemory.js.map