const wait = async (ms: number): Promise<void> => await new Promise((r) => setTimeout(r, ms));
export { wait };
