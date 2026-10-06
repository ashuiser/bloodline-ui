import { useCallback, useEffect, useRef, useState } from "react";
import MapBox, { Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { ChevronDown, ChevronUp } from "lucide-react";
import { io, type Socket } from "socket.io-client";
import {
	type ActiveActivity,
	getMyActivityApi,
	type RequestRecord,
} from "@/api/activity";
import { type DonorMarker, getNearbyDonorsApi } from "@/api/location";
import { IncomingRequestAlert } from "@/components/IncomingRequestAlert";
import { RequestForm } from "@/components/RequestForm";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocationPermissionOverlay } from "../components/LocationPermissionOverlay";

const bloodTypeColors: Record<string, string> = {
	"A+": "#EF4444",
	"A-": "#F87171",
	"B+": "#3B82F6",
	"B-": "#60A5FA",
	"AB+": "#10B981",
	"AB-": "#34D399",
	"O+": "#F59E0B",
	"O-": "#FBBF24",
	Unknown: "#9CA3AF",
};

export default function Dashboard() {
	const [viewState, setViewState] = useState({
		longitude: 78.9629,
		latitude: 20.5937,
		zoom: 4,
	});

	const [donors, setDonors] = useState<DonorMarker[]>([]);
	const [myLocation, setMyLocation] = useState<{
		lng: number;
		lat: number;
	} | null>(null);
	const [isLegendOpen, setIsLegendOpen] = useState(
		() => localStorage.getItem("legendOpen") !== "false",
	);
	const [permissionDenied, setPermissionDenied] = useState(false);
	const hasSetInitialLocation = useRef(false);
	const lastFetchedLocation = useRef<{ lng: number; lat: number } | null>(null);
	const socketRef = useRef<Socket | null>(null);

	const [activeActivity, setActiveActivity] = useState<ActiveActivity | null>(
		null,
	);
	const [incomingRequest, setIncomingRequest] = useState<RequestRecord | null>(
		null,
	);

	useEffect(() => {
		getMyActivityApi()
			.then((res) => {
				if (res.success) {
					setActiveActivity(res.data);
				}
			})
			.catch((err) => console.error("Failed to fetch activity:", err));
	}, []);

	useEffect(() => {
		localStorage.setItem("legendOpen", String(isLegendOpen));
	}, [isLegendOpen]);

	// Initialize socket connection once
	useEffect(() => {
		const socket = io(import.meta.env.VITE_API_URL || "http://localhost:4000", {
			withCredentials: true,
		});
		socketRef.current = socket;

		socket.on("connect", () => console.log("Connected to socket server"));

		socket.on("new_blood_request", (data: { request: RequestRecord }) => {
			console.log("New incoming blood request!", data);
			// Only show the alert if the user is currently idle
			setActiveActivity((currentActivity) => {
				if (
					!currentActivity?.activeRequest &&
					!currentActivity?.activeDonation
				) {
					setIncomingRequest(data.request);
				}
				return currentActivity;
			});
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	const fetchDonors = useCallback(async (lng: number, lat: number) => {
		try {
			const res = await getNearbyDonorsApi(lng, lat);
			if (res.success) {
				setDonors(res.data);
			}
		} catch (err) {
			console.error("Failed to fetch nearby donors", err);
		}
	}, []);

	// Track location and fetch donors
	useEffect(() => {
		let watchId: number;
		if (navigator.geolocation) {
			watchId = navigator.geolocation.watchPosition(
				(pos) => {
					setPermissionDenied(false);
					const { longitude, latitude } = pos.coords;
					setMyLocation({ lng: longitude, lat: latitude });

					if (!hasSetInitialLocation.current) {
						hasSetInitialLocation.current = true;
						setViewState((prev) => ({
							...prev,
							longitude,
							latitude,
							zoom: 12,
						}));
					}

					if (socketRef.current) {
						socketRef.current.emit("updateLocation", {
							lng: longitude,
							lat: latitude,
						});
					}

					// Fetch donors only if idle and distance moved is significant (~1.1km = 0.01 degrees)
					const lastLoc = lastFetchedLocation.current;
					const shouldFetch =
						!lastLoc ||
						Math.abs(lastLoc.lng - longitude) > 0.01 ||
						Math.abs(lastLoc.lat - latitude) > 0.01;

					// Only fetch random nearby donors if we are NOT in an active request/donation
					const isIdle =
						!activeActivity?.activeRequest && !activeActivity?.activeDonation;

					if (shouldFetch && isIdle) {
						lastFetchedLocation.current = { lng: longitude, lat: latitude };
						fetchDonors(longitude, latitude);
					}
				},
				(err) => {
					console.warn("Geolocation error:", err);
					if (err.code === err.PERMISSION_DENIED) {
						setPermissionDenied(true);
					}
				},
				{ enableHighAccuracy: true },
			);
		} else {
			setPermissionDenied(true);
		}

		return () => {
			if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
		};
	}, [fetchDonors, activeActivity]);

	return (
		<div className="flex flex-col h-screen w-full relative">
			{permissionDenied && <LocationPermissionOverlay />}

			{incomingRequest && (
				<IncomingRequestAlert
					request={incomingRequest}
					onClose={() => setIncomingRequest(null)}
					onAccepted={(donation) => {
						setIncomingRequest(null);
						setActiveActivity({
							activeRequest: null,
							activeDonation: donation,
						});
					}}
				/>
			)}

			{/* Conditionally render different overlays based on active status */}
			{activeActivity?.activeRequest && (
				<div className="absolute inset-0 z-20 flex flex-col items-center justify-start p-6 bg-background/50 backdrop-blur-sm pointer-events-auto">
					<Card className="w-full max-w-md mt-12 shadow-2xl border-primary/20">
						<CardHeader>
							<CardTitle className="text-primary text-xl">
								Active Blood Request
							</CardTitle>
							<CardDescription>
								You are requesting{" "}
								{activeActivity.activeRequest.requiredBloodType} blood for{" "}
								{activeActivity.activeRequest.hospitalName}.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col items-center justify-center py-4 gap-4">
								<div className="text-4xl font-bold tabular-nums">
									{activeActivity.activeRequest.unitsAccepted} /{" "}
									{activeActivity.activeRequest.unitsRequired}
								</div>
								<div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
									Units Accepted
								</div>
								<div className="w-full h-3 bg-muted rounded-full overflow-hidden mt-2">
									<div
										className="h-full bg-primary transition-all duration-500 ease-in-out"
										style={{
											width: `${Math.min(100, (activeActivity.activeRequest.unitsAccepted / activeActivity.activeRequest.unitsRequired) * 100)}%`,
										}}
									/>
								</div>
								<p className="text-xs text-muted-foreground mt-4 text-center">
									We are actively notifying nearby compatible donors. Donors who
									accept will appear on the map.
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{activeActivity?.activeDonation && (
				<div className="absolute inset-0 z-20 flex flex-col items-center justify-end p-6 bg-transparent pointer-events-none">
					<Card className="w-full max-w-md mb-8 shadow-2xl border-primary/20 pointer-events-auto">
						<CardHeader>
							<CardTitle className="text-primary text-xl flex items-center gap-2">
								<div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
								En Route to Donate
							</CardTitle>
							<CardDescription>
								You have accepted a request. Please head to the hospital
								immediately.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col gap-2">
								<div className="p-3 bg-muted/50 rounded-lg border flex justify-between items-center">
									<span className="font-medium text-sm text-muted-foreground">
										Status
									</span>
									<span className="font-semibold text-foreground uppercase text-xs tracking-wider">
										{activeActivity.activeDonation.status.replace("_", " ")}
									</span>
								</div>
								<button
									type="button"
									className="mt-4 w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
								>
									Get Directions
								</button>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			<div className="absolute inset-0 z-0 bg-muted">
				<MapBox
					{...viewState}
					onMove={(evt) => setViewState(evt.viewState)}
					mapStyle="mapbox://styles/mapbox/dark-v9"
					mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
					style={{ width: "100%", height: "100%" }}
				>
					{/* Available Donors (Only show if no active request/donation) */}
					{!activeActivity?.activeRequest &&
						!activeActivity?.activeDonation &&
						donors.map((d, idx) => (
							<Marker key={d.id || idx} longitude={d.lng} latitude={d.lat}>
								<div
									className="w-3 h-3 rounded-full border border-background shadow-md shadow-black/50"
									style={{
										backgroundColor:
											bloodTypeColors[d.bloodType] || bloodTypeColors.Unknown,
									}}
								/>
							</Marker>
						))}
					{myLocation && (
						<Marker longitude={myLocation.lng} latitude={myLocation.lat} />
					)}
				</MapBox>
			</div>

			{/* Collapsible Legend */}
			<div className="absolute top-4 right-4 z-10 bg-background/90 backdrop-blur-sm rounded-xl shadow-md border pointer-events-auto flex flex-col overflow-hidden w-40">
				<button
					type="button"
					onClick={() => setIsLegendOpen(!isLegendOpen)}
					className="flex items-center justify-between w-full p-2 px-3 text-xs font-semibold hover:bg-muted/50 transition-colors"
				>
					<span>Blood Types</span>
					{isLegendOpen ? (
						<ChevronUp className="w-4 h-4 ml-2 text-muted-foreground" />
					) : (
						<ChevronDown className="w-4 h-4 ml-2 text-muted-foreground" />
					)}
				</button>
				{isLegendOpen && (
					<div className="p-3 pt-1 grid grid-cols-2 gap-x-4 gap-y-2 border-t">
						{Object.entries(bloodTypeColors)
							.filter(([k]) => k !== "Unknown")
							.map(([type, color]) => (
								<div key={type} className="flex items-center gap-2">
									<div
										className="w-3 h-3 rounded-full shadow-sm shrink-0"
										style={{ backgroundColor: color }}
									/>
									<span className="text-[11px] font-medium text-foreground">
										{type}
									</span>
								</div>
							))}
					</div>
				)}
			</div>

			{/* Floating Dock - Only show if no active request or donation */}
			{!activeActivity?.activeRequest && !activeActivity?.activeDonation && (
				<div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
					<Tabs defaultValue="donate" className="w-100 rounded-xl">
						<TabsContent value="donate">
							<Card className="border-0 shadow-none bg-background/90 backdrop-blur-md">
								<CardHeader className="pb-3">
									<CardTitle>Donate</CardTitle>
									<CardDescription>
										Ready to save a life? Wait for an incoming request or
										explore nearby hospitals.
									</CardDescription>
								</CardHeader>
								<CardContent className="text-sm text-muted-foreground pb-4">
									You will receive push notifications if a compatible blood
									request is created nearby.
								</CardContent>
							</Card>
						</TabsContent>
						<TabsContent value="request">
							<Card className="border-0 shadow-none bg-background/90 backdrop-blur-md">
								<CardHeader className="pb-3">
									<CardTitle>Request Blood</CardTitle>
									<CardDescription>
										Create an emergency blood request.
									</CardDescription>
								</CardHeader>
								<CardContent className="text-sm text-muted-foreground pb-4">
									<RequestForm
										myLocation={myLocation}
										onRequestCreated={(req) => {
											setActiveActivity({
												activeRequest: req,
												activeDonation: null,
											});
										}}
									/>
								</CardContent>
							</Card>
						</TabsContent>
						<TabsContent value="profile">
							<Card className="border-0 shadow-none bg-background/90 backdrop-blur-md">
								<CardHeader className="pb-3">
									<CardTitle>Profile</CardTitle>
									<CardDescription>
										Manage your details and history.
									</CardDescription>
								</CardHeader>
								<CardContent className="text-sm text-muted-foreground pb-4">
									View your past donations and update your notification
									preferences.
								</CardContent>
							</Card>
						</TabsContent>
						<TabsList className="bg-card/90 w-full mx-auto ">
							<TabsTrigger value="donate" className="flex-1">
								Donate
							</TabsTrigger>
							<TabsTrigger value="request" className="flex-1">
								Request
							</TabsTrigger>
							<TabsTrigger value="profile" className="flex-1">
								Profile
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			)}
		</div>
	);
}
