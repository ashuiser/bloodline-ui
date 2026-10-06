export type ApiErrorResponse = {
	success: false;
	error: {
		code: string;
		message: string;
		details?: unknown;
	};
};

export type ApiSuccessResponse<T> = {
	success: true;
	data: T;
};

export type ApiResponse<T> = ApiErrorResponse | ApiSuccessResponse<T>;

export const API_URL =
	`${import.meta.env.VITE_API_URL}/api` || "http://localhost:4000/api";

export async function fetchApi<T>(
	endpoint: string,
	options: RequestInit = {},
): Promise<ApiSuccessResponse<T>> {
	const res = await fetch(`${API_URL}${endpoint}`, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...options.headers,
		},
		credentials: "include",
	});

	const data = (await res.json()) as ApiResponse<T>;
	if (!res.ok || !data.success) {
		if (!data.success) {
			throw new Error(data.error?.message || "Something went wrong");
		}
		throw new Error("Something went wrong");
	}
	return data;
}
