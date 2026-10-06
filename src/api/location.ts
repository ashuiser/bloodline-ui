import { fetchApi } from "./index";

export type DonorMarker = {
	id: string;
	lat: number;
	lng: number;
	bloodType: string;
};

export function getNearbyDonorsApi(lng: number, lat: number) {
	return fetchApi<DonorMarker[]>(`/location/nearby?lng=${lng}&lat=${lat}`);
}

export type Hospital = {
	placeId: string;
	name: string;
	lat: number;
	lng: number;
	address: string;
};

export function getNearbyHospitalsApi(lng: number, lat: number) {
	return fetchApi<{ hospitals: Hospital[] }>(
		`/location/hospitals?lng=${lng}&lat=${lat}`,
	);
}
