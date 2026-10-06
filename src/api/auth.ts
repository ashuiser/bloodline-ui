import { fetchApi } from "./index";

export type User = {
	id: string;
	name: string;
	email: string;
	bloodType: string;
};

export function loginApi(data: Record<string, string>) {
	return fetchApi<{ user: User }>("/auth/login", {
		method: "POST",
		body: JSON.stringify(data),
	});
}

export function signupApi(data: Record<string, string>) {
	return fetchApi<{ user: User }>("/auth/signup", {
		method: "POST",
		body: JSON.stringify(data),
	});
}

export function meApi() {
	return fetchApi<{ user: User }>("/auth/me");
}
