import Gun from 'gun';
import hash from 'object-hash';
export class GunPersistenceAdapter {
    constructor(address) {
        this.address = address;
        this.backend = new Gun(['http://localhost:8765/gun']);
    }
    async set(transferRequest) {
        const key = hash(transferRequest);
        const status = Object.assign(Object.assign({}, transferRequest), { status: 'pending' });
        try {
            await this.backend
                .get('transferRequests')
                .get(this.address)
                .set(Object.assign(Object.assign({}, status), { key }));
            return key;
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    async get(key) {
        try {
            const values = await this.getAllTransferRequests();
            const value = values.filter((data) => (data === null || data === void 0 ? void 0 : data.key) === key)[0];
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
            let deleted = false;
            await this.backend
                .get('transferRequests')
                .get(this.address)
                .map()
                // @ts-expect-error
                .val(function (val, field) {
                if ((val === null || val === void 0 ? void 0 : val.key) === key && !deleted) {
                    this.back(1).put({ [field]: null });
                    deleted = true;
                }
            });
            return true;
        }
        catch (e) {
            return false;
        }
    }
    async has(key) {
        try {
            const value = (await this.get(key));
            if (value) {
                return true;
            }
            else
                return false;
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
                await this.backend.get('transferRequest').get(this.address).set(value);
            }
            else
                throw new Error(`No transfer request with key: ${key}`);
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    async getAllTransferRequests() {
        let values = [];
        await this.backend
            .get('transferRequests')
            .map()
            .once((d) => {
            if (d) {
                values.push(d);
            }
        });
        return values;
    }
}
//# sourceMappingURL=gun.js.map