import { useEffect, useState } from "react";
import {
	getAccessTokenFromLS,
	getProfileFromLS,
	getRefreshTokenFromLS,
	setAccessTokenToLS,
	setIsAuthenticatedToLS,
	setProfileToLS,
	setRefreshTokenToLS,
} from "./utils/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { socket } from "./utils/socket";

const profile = getProfileFromLS();
const Chat = () => {
	// Fake users from mongoseDB
	const [chats, setChats] = useState([]);
	const users = [
		{
			_id: "67e61f3e69cb7eb1c30b70fc",
			email: "Jed64@hotmail.com",
			user_name: "user67e61f3e69cb7eb1c30b70fc",
		},
		{
			_id: "67e61f3e69cb7eb1c30b7100",
			email: "Anna76@hotmail.com",
			user_name: "user67e61f3e69cb7eb1c30b7100",
		},
	];
	const navigate = useNavigate();
	const [value, setValue] = useState("");
	const [toUserId, setToUserId] = useState("");
	useEffect(() => {
		socket.connect();
		socket.auth = {
			_id: profile._id,
		};
		socket.on("chat receiver", (data) => {
			setChats((prevState) => [
				...prevState,
				{
					content: data.content,
				},
			]);
		});
		return () => socket.disconnect();
	}, []);

	const send = (e) => {
		e.preventDefault();
		setValue("");
		socket.emit("chat", {
			content: value,
			from: profile._id,
			to: toUserId,
		});
		setChats((prevState) => [
			...prevState,
			{
				content: value,
				isSender: true,
			},
		]);
	};

	const handleLogout = async () => {
		try {
			const access_token = getAccessTokenFromLS();
			const refresh_token = getRefreshTokenFromLS();
			await axios.post(
				"http://localhost:4000/users/logout",
				{ refresh_token },
				{
					headers: {
						Authorization: `Bearer ${access_token}`, // Gửi access_token trong header
					},
				}
			);
			setAccessTokenToLS("");
			setRefreshTokenToLS("");
			setProfileToLS("");
			setIsAuthenticatedToLS(false);
			navigate("/login");
		} catch (error) {
			console.log(error);
		}
	};

	const handleClickGetId = (user_name) => async () => {
		try {
			const access_token = getAccessTokenFromLS();
			const respone = await axios.get(
				"http://localhost:4000/users/" + user_name,
				{
					headers: {
						Authorization: `Bearer ${access_token}`,
					},
				}
			);
			const userInfo = respone.data.data;
			setToUserId(userInfo._id);
		} catch (error) {
			console.log(error);
		}
	};
	return (
		<div>
			<div>
				<div>Danh sách bạn bè của tôi</div>
				<div>Click vào bạn bè để có thể nhắn tin trực tuyến</div>
				<ul>
					{users
						.filter((user) => user._id !== profile._id)
						.map((user) => (
							<li key={user._id} style={{ cursor: "pointer" }}>
								<span onClick={handleClickGetId(user.user_name)}>
									{user.email}
								</span>
							</li>
						))}
				</ul>
			</div>
			<h1>
				<span>Hello </span>
				<span style={{ textTransform: "lowercase" }}>{profile.email}</span>
			</h1>
			<button onClick={handleLogout}>Đăng xuất</button>
			<br />
			<br />

			<div>
				{chats.map((chat, index) => (
					<div key={index}>
						<div className={chat.isSender ? "chat-r chat" : "chat"}>
							{chat.content}
						</div>
					</div>
				))}
			</div>

			<br />
			<br />

			<form onSubmit={send}>
				<input
					type="text"
					placeholder="Nhập tin nhắn"
					value={value}
					onChange={(e) => setValue(e.target.value)}
				/>
				<button>Gửi</button>
			</form>
		</div>
	);
};

export default Chat;
