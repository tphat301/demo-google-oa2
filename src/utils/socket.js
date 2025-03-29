import { io } from "socket.io-client";
import { getAccessTokenFromLS } from "./auth";
const access_token = getAccessTokenFromLS();
export const socket = io("http://localhost:4000", {
	auth: { Authorization: `Bearer ${access_token}` },
});
