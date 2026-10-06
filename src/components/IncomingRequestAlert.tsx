import { useState } from "react";
import {
	acceptDonationApi,
	type DonationRecord,
	type RequestRecord,
} from "@/api/activity";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

type IncomingRequestAlertProps = {
	request: RequestRecord;
	onClose: () => void;
	onAccepted: (donation: DonationRecord) => void;
};

export function IncomingRequestAlert({
	request,
	onClose,
	onAccepted,
}: IncomingRequestAlertProps) {
	const [isAccepting, setIsAccepting] = useState(false);
	const [error, setError] = useState("");

	const handleAccept = async () => {
		setIsAccepting(true);
		setError("");
		try {
			const res = await acceptDonationApi(request.id);
			if (res.success && res.data.donation) {
				onAccepted(res.data.donation);
			} else {
				setError("Failed to accept donation. It might have been fulfilled.");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred.");
		} finally {
			setIsAccepting(false);
		}
	};

	return (
		<div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto p-6">
			<Card className="w-full max-w-md shadow-2xl border-red-500 border-2 animate-in zoom-in-95 duration-200">
				<CardHeader className="text-center">
					<CardTitle className="text-red-500 text-2xl flex flex-col items-center gap-2">
						<div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
							<div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
								!
							</div>
						</div>
						EMERGENCY BLOOD REQUEST
					</CardTitle>
					<CardDescription className="text-base text-foreground mt-2">
						A patient near you urgently needs{" "}
						<strong>{request.requiredBloodType}</strong> blood.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<div className="bg-muted p-4 rounded-lg flex flex-col gap-1 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Hospital</span>
							<span className="font-semibold text-right">
								{request.hospitalName}
							</span>
						</div>
						<div className="flex justify-between mt-2">
							<span className="text-muted-foreground">Required Units</span>
							<span className="font-semibold">{request.unitsRequired}</span>
						</div>
					</div>

					{error && (
						<div className="text-sm text-red-500 text-center">{error}</div>
					)}

					<div className="flex flex-col gap-2 mt-4">
						<Button
							onClick={handleAccept}
							disabled={isAccepting}
							className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-xl"
						>
							{isAccepting ? "Accepting..." : "Accept & Go"}
						</Button>
						<Button
							onClick={onClose}
							disabled={isAccepting}
							variant="ghost"
							className="w-full text-muted-foreground"
						>
							Dismiss
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
