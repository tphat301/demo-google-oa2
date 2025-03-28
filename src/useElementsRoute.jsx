import { Navigate, Outlet, useRoutes } from "react-router-dom";
import Home from "./Home";
import Login from "./Login";
import Chat from "./Chat";
import { getIsAuthenticatedFromLS } from "./utils/auth";

const ProtectedRoute = () => {
	const isAuthenticated = getIsAuthenticatedFromLS();
	return isAuthenticated === "true" ? <Outlet /> : <Navigate to="/login" />;
};

const RejectedRoute = () => {
	const isAuthenticated = getIsAuthenticatedFromLS();
	return isAuthenticated === "false" ? <Outlet /> : <Navigate to="/" />;
};

const UseElementsRoute = () => {
	return useRoutes([
		{
			path: "/",
			element: <Home />,
			index: true,
		},
		{
			path: "",
			element: <RejectedRoute />,
			children: [
				{
					path: "/login",
					element: <Login />,
				},
			],
		},
		{
			path: "",
			element: <ProtectedRoute />,
			children: [
				{
					path: "/chat",
					element: <Chat />,
				},
			],
		},
	]);
};

export default UseElementsRoute;
