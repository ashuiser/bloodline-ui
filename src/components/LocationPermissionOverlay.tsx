import { MapPinOff } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function LocationPermissionOverlay() {
	return (
		<div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
			<Card className="max-w-md w-full shadow-2xl border-destructive/20">
				<CardHeader className="text-center pb-2">
					<div className="mx-auto bg-destructive/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
						<MapPinOff className="w-8 h-8 text-destructive" />
					</div>
					<CardTitle className="text-2xl font-bold">
						Location Required
					</CardTitle>
					<CardDescription className="text-base mt-2">
						BloodLine needs your location to connect you with nearby donors and
						patients in emergency situations.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4 text-sm text-muted-foreground">
					<p>
						We noticed location permissions are blocked or haven't been granted.
						To use the dashboard, please allow location access in your browser:
					</p>
					<ul className="list-disc pl-5 space-y-2">
						<li>
							<strong>Chrome:</strong> Click the lock icon next to the URL, find
							Location, and select "Allow".
						</li>
						<li>
							<strong>Firefox:</strong> Click the lock icon next to the URL,
							clear the "Blocked" setting for location, and refresh.
						</li>
						<li>
							<strong>Safari:</strong> Go to Preferences &gt; Websites &gt;
							Location and select "Allow" for this site.
						</li>
					</ul>
					<p className="text-center font-medium text-foreground pt-4">
						Please reload the page after granting permission.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
