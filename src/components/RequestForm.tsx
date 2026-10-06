import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { createRequestApi, type RequestRecord } from "@/api/activity";
import { getNearbyHospitalsApi, type Hospital } from "@/api/location";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type RequestFormProps = {
	myLocation: { lng: number; lat: number } | null;
	onRequestCreated: (req: RequestRecord) => void;
};

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function RequestForm({
	myLocation,
	onRequestCreated,
}: RequestFormProps) {
	const [hospitals, setHospitals] = useState<Hospital[]>([]);
	const [isLoadingHospitals, setIsLoadingHospitals] = useState(false);
	const [selectedHospitalPlaceId, setSelectedHospitalPlaceId] = useState("");

	const [bloodType, setBloodType] = useState("");
	const [units, setUnits] = useState("1");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (myLocation) {
			setIsLoadingHospitals(true);
			getNearbyHospitalsApi(myLocation.lng, myLocation.lat)
				.then((res) => {
					if (res.success && res.data.hospitals) {
						setHospitals(res.data.hospitals);
					}
				})
				.catch((err) => console.error("Failed to fetch hospitals:", err))
				.finally(() => setIsLoadingHospitals(false));
		}
	}, [myLocation]);

	const handleSubmit = async (e: React.SubmitEvent) => {
		e.preventDefault();
		setError("");

		if (!myLocation) {
			setError("Location is required to request blood.");
			return;
		}

		const selectedHospital = hospitals.find(
			(h) => h.placeId === selectedHospitalPlaceId,
		);

		if (!selectedHospital || !bloodType || !units) {
			setError("Please fill out all fields and select a hospital.");
			return;
		}

		setIsSubmitting(true);
		try {
			const res = await createRequestApi({
				hospitalName: selectedHospital.name,
				requiredBloodType: bloodType,
				unitsRequired: parseInt(units, 10),
				hospitalLat: selectedHospital.lat,
				hospitalLng: selectedHospital.lng,
			});

			if (res.success && res.data.request) {
				onRequestCreated(res.data.request);
			} else {
				setError("Failed to create request.");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4">
			{error && (
				<div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
					<AlertCircle className="w-4 h-4" />
					<span>{error}</span>
				</div>
			)}

			<div className="space-y-1.5">
				<Label htmlFor="hospitalName">Hospital Name</Label>
				<Select
					value={selectedHospitalPlaceId}
					onValueChange={setSelectedHospitalPlaceId}
					disabled={
						isSubmitting || isLoadingHospitals || hospitals.length === 0
					}
				>
					<SelectTrigger>
						<SelectValue
							placeholder={
								isLoadingHospitals
									? "Finding nearby hospitals..."
									: hospitals.length === 0
										? "No hospitals nearby"
										: "Select a nearby hospital"
							}
						/>
					</SelectTrigger>
					<SelectContent>
						{hospitals.map((h) => (
							<SelectItem key={h.placeId} value={h.placeId}>
								{h.name}{" "}
								<span className="text-muted-foreground text-xs ml-2 truncate">
									({h.address})
								</span>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-1.5">
					<Label>Blood Type</Label>
					<Select
						value={bloodType}
						onValueChange={setBloodType}
						disabled={isSubmitting}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select type" />
						</SelectTrigger>
						<SelectContent>
							{bloodTypes.map((type) => (
								<SelectItem key={type} value={type}>
									{type}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="units">Units Required</Label>
					<Input
						id="units"
						type="number"
						min="1"
						max="10"
						value={units}
						onChange={(e) => setUnits(e.target.value)}
						disabled={isSubmitting}
					/>
				</div>
			</div>

			<Button
				type="submit"
				className="w-full mt-2"
				disabled={isSubmitting || !myLocation}
			>
				{isSubmitting ? "Broadcasting..." : "Broadcast Emergency"}
			</Button>

			{!myLocation && (
				<p className="text-xs text-center text-muted-foreground">
					Waiting for GPS signal to locate hospital...
				</p>
			)}
		</form>
	);
}
