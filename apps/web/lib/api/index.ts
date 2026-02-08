

export async function ApiService<T>(func: () => Promise<T>): Promise<T> {
	try {
		return await func()	
	} catch (error) {
		throw error	
	}
}