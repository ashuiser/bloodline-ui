import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function ProtectedRoute() {
	const { user, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className="flex h-screen w-full items-center justify-center text-muted-foreground">
				Loading...
			</div>
		);
	}
	if (!user) {
		return <Navigate to="/login" replace />;
	}

	return <Outlet />;
}

function AuthRoute() {
	const { user, isLoading } = useAuth();
	if (isLoading) {
		return (
			<div className="flex h-screen w-full items-center justify-center text-muted-foreground">
				Loading...
			</div>
		);
	}
	if (user) {
		return <Navigate to="/" replace />;
	}
	return <Outlet />;
}

export default function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Routes>
					<Route element={<AuthRoute />}>
						<Route path="login" element={<Login />} />
						<Route path="signup" element={<Signup />} />
					</Route>
					<Route path="/" element={<ProtectedRoute />}>
						<Route index element={<Dashboard />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	);
}
