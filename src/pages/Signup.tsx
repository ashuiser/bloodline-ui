import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { signupApi } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function Signup() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		bloodType: "O+",
		dob: "",
		password: "",
	});
	const [error, setError] = useState("");
	const [isDobOpen, setIsDobOpen] = useState(false);
	const { setUser } = useAuth();
	const navigate = useNavigate();

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		setFormData({ ...formData, [e.target.id]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		try {
			const res = await signupApi(formData);
			if (res.success && res.data?.user) {
				setUser(res.data.user);
				navigate("/");
			}
		} catch (err) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError("Something went wrong");
			}
		}
	};

	return (
		<div className="flex min-h-screen w-full items-center justify-center p-4">
			<Card className="w-full max-w-sm my-8">
				<CardHeader>
					<CardTitle>Create an account</CardTitle>
					<CardDescription>
						Enter your details below to create your account
					</CardDescription>
					<CardAction>
						<Button variant="link" asChild>
							<Link to="/login">Login</Link>
						</Button>
					</CardAction>
				</CardHeader>
				<CardContent>
					<form id="signup-form" onSubmit={handleSubmit}>
						<div className="flex flex-col gap-6">
							{error && (
								<div className="text-destructive text-sm font-medium">
									{error}
								</div>
							)}
							<Field>
								<FieldLabel htmlFor="name">Name</FieldLabel>
								<Input
									id="name"
									required
									placeholder="John Doe"
									value={formData.name}
									onChange={handleChange}
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="email">Email</FieldLabel>
								<Input
									id="email"
									type="email"
									required
									placeholder="m@example.com"
									value={formData.email}
									onChange={handleChange}
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="phone">Phone</FieldLabel>
								<Input
									id="phone"
									type="tel"
									required
									placeholder="9999999999"
									value={formData.phone}
									onChange={handleChange}
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="bloodType">Blood Type</FieldLabel>
								<Select
									value={formData.bloodType}
									onValueChange={(value) =>
										setFormData({ ...formData, bloodType: value })
									}
									required
								>
									<SelectTrigger id="bloodType" className="w-full">
										<SelectValue placeholder="Select a blood type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="A+">A+</SelectItem>
										<SelectItem value="A-">A-</SelectItem>
										<SelectItem value="B+">B+</SelectItem>
										<SelectItem value="B-">B-</SelectItem>
										<SelectItem value="AB+">AB+</SelectItem>
										<SelectItem value="AB-">AB-</SelectItem>
										<SelectItem value="O+">O+</SelectItem>
										<SelectItem value="O-">O-</SelectItem>
									</SelectContent>
								</Select>
							</Field>
							<Field>
								<FieldLabel htmlFor="dob">Date of Birth</FieldLabel>
								<Popover open={isDobOpen} onOpenChange={setIsDobOpen}>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={cn(
												"w-full justify-start text-left font-normal",
												!formData.dob && "text-muted-foreground",
											)}
										>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{formData.dob ? (
												format(new Date(formData.dob), "PPP")
											) : (
												<span>Pick a date</span>
											)}
										</Button>
									</PopoverTrigger>
									<PopoverContent
										className="w-auto overflow-hidden p-0"
										align="start"
									>
										<Calendar
											mode="single"
											selected={
												formData.dob ? new Date(formData.dob) : undefined
											}
											defaultMonth={
												formData.dob ? new Date(formData.dob) : undefined
											}
											captionLayout="dropdown"
											startMonth={new Date(1900, 0)}
											endMonth={
												new Date(
													new Date().setFullYear(new Date().getFullYear() - 15),
												)
											}
											disabled={(date) =>
												date >
												new Date(
													new Date().setFullYear(new Date().getFullYear() - 15),
												)
											}
											onSelect={(date) => {
												setFormData({
													...formData,
													dob: date ? format(date, "yyyy-MM-dd") : "",
												});
												setIsDobOpen(false);
											}}
										/>
									</PopoverContent>
								</Popover>
								<input type="hidden" name="dob" required value={formData.dob} />
							</Field>
							<Field>
								<FieldLabel htmlFor="password">Password</FieldLabel>
								<Input
									id="password"
									type="password"
									required
									minLength={8}
									placeholder="xxxxxxxx"
									value={formData.password}
									onChange={handleChange}
								/>
							</Field>
						</div>
					</form>
				</CardContent>
				<CardFooter className="flex-col gap-2">
					<Button type="submit" form="signup-form" className="w-full">
						Sign Up
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
