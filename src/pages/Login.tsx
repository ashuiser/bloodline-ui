import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { loginApi } from "@/api/auth";
import { Button } from "@/components/ui/button";
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
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const { setUser } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		try {
			const res = await loginApi({ email, password });
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
		<div className="flex h-screen w-full items-center justify-center p-4">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle>Login to your account</CardTitle>
					<CardDescription>
						Enter your email below to login to your account
					</CardDescription>
					<CardAction>
						<Button variant="link" asChild>
							<Link to="/signup">Sign Up</Link>
						</Button>
					</CardAction>
				</CardHeader>
				<CardContent>
					<form id="login-form" onSubmit={handleSubmit}>
						<div className="flex flex-col gap-6">
							{error && (
								<div className="text-destructive text-sm font-medium">
									{error}
								</div>
							)}
							<Field>
								<FieldLabel htmlFor="email">Email</FieldLabel>
								<Input
									id="email"
									type="email"
									placeholder="m@example.com"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
							</Field>
							<Field>
								<div className="flex items-center">
									<FieldLabel htmlFor="password">Password</FieldLabel>
								</div>
								<Input
									id="password"
									type="password"
									required
									value={password}
									placeholder="xxxxxxxx"
									onChange={(e) => setPassword(e.target.value)}
								/>
							</Field>
						</div>
					</form>
				</CardContent>
				<CardFooter className="flex-col gap-2">
					<Button type="submit" form="login-form" className="w-full">
						Login
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
