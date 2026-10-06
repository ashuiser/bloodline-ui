import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { meApi, type User } from "@/api/auth";

type AuthContextType = {
	user: User | null;
	isLoading: boolean;
	setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		meApi()
			.then((data) => {
				if (data.success && data.data?.user) {
					setUser(data.data.user);
				}
			})
			.catch(() => {
				setUser(null);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, []);

	return (
		<AuthContext.Provider value={{ user, isLoading, setUser }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
