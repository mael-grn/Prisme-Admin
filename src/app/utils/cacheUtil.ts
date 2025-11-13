export default class CacheUtil {

    public static async getItem<T>(remoteGetFunction: () => Promise<T>, cacheKey: string, cacheDurationMs: number): Promise<T> {
        const now = Date.now();
        const cachedItem = localStorage.getItem(cacheKey);
        const cachedTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);

        if (cachedItem && cachedTimestamp) {
            const age = now - parseInt(cachedTimestamp, 10);
            if (age < cacheDurationMs) {
                return Promise.resolve(JSON.parse(cachedItem) as T);
            }
        }

        const item = await remoteGetFunction()
        localStorage.setItem(cacheKey, JSON.stringify(item));
        localStorage.setItem(`${cacheKey}_timestamp`, now.toString());
        return item;
    }
}