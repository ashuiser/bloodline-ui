import { fetchApi } from "./index";

export type RequestRecord = {
	id: string;
	requesterId: string;
	hospitalName: string;
	hospitalLat: number;
	hospitalLng: number;
	requiredBloodType: string;
	unitsRequired: number;
	unitsAccepted: number;
	status: "pending" | "active" | "completed" | "cancelled";
	createdAt: string;
};

export type DonationRecord = {
	id: string;
	requestId: string;
	donorId: string;
	status: "accepted" | "en_route" | "completed" | "cancelled";
	createdAt: string;
};

export type ActiveActivity = {
	activeRequest: RequestRecord | null;
	activeDonation: DonationRecord | null;
};

export function getMyActivityApi() {
	return fetchApi<ActiveActivity>("/me/active-activity");
}

export function createRequestApi(data: {
	hospitalName: string;
	hospitalLat: number;
	hospitalLng: number;
	requiredBloodType: string;
	unitsRequired: number;
}) {
	return fetchApi<{ request: RequestRecord }>("/requests", {
		method: "POST",
		body: JSON.stringify(data),
	});
}

export function acceptDonationApi(requestId: string) {
	return fetchApi<{ donation: DonationRecord }>(
		`/donations/${requestId}/accept`,
		{
			method: "POST",
		},
	);
}
