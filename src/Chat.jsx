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
import InfiniteScroll from "react-infinite-scroll-component";

// Fake users from mongoseDB
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
const profile = getProfileFromLS();
const PAGE = 1;
const LIMIT = 10;

const Chat = () => {
	const [conversations, setConversations] = useState([]);
	const navigate = useNavigate();
	const [value, setValue] = useState("");
	const [receiverId, setReceiverId] = useState("");
	const [pagination, setPagination] = useState({
		page: PAGE,
		total_page: 0,
	});

	useEffect(() => {
		socket.on("receiver_message", (data) => {
			const { payload } = data;
			setConversations((prevState) => [payload, ...prevState]);
		});
		socket.on("connect_error", (err) => {
			console.log(err);
		});
		socket.on("disconnect", (reason) => {
			console.log(reason);
		});
		return () => socket.disconnect();
	}, []);

	useEffect(() => {
		if (receiverId) {
			const access_token = getAccessTokenFromLS();
			axios
				.get("http://localhost:4000/conversations/receiver/" + receiverId, {
					headers: {
						Authorization: `Bearer ${access_token}`,
					},
					params: {
						page: PAGE,
						limit: LIMIT,
					},
				})
				.then((res) => {
					const { page, total_page } = res.data.data;
					const conversations = res.data.data.data;
					setConversations(conversations);
					setPagination({ page, total_page });
				})
				.catch((err) => {
					console.log(err);
				});
		}
	}, [receiverId]);

	const fetchMoreConversations = () => {
		if (receiverId && pagination.page < pagination.total_page) {
			const access_token = getAccessTokenFromLS();
			axios
				.get("http://localhost:4000/conversations/receiver/" + receiverId, {
					headers: {
						Authorization: `Bearer ${access_token}`,
					},
					params: {
						page: pagination.page + 1,
						limit: LIMIT,
					},
				})
				.then((res) => {
					const { page, total_page } = res.data.data;
					const conversations = res.data.data.data;
					setConversations((prevState) => [...prevState, ...conversations]);
					setPagination({ page, total_page });
				})
				.catch((err) => {
					console.log(err);
				});
		}
	};

	const send = (e) => {
		e.preventDefault();
		setValue("");
		const conversation = {
			content: value,
			sender_id: profile._id,
			receiver_id: receiverId,
		};
		socket.emit("sender_message", {
			payload: conversation,
		});
		setConversations((prevState) => [conversation, ...prevState]);
	};

	const handleLogout = () => {
		const access_token = getAccessTokenFromLS();
		const refresh_token = getRefreshTokenFromLS();
		axios
			.post(
				"http://localhost:4000/users/logout",
				{ refresh_token },
				{
					headers: {
						Authorization: `Bearer ${access_token}`, // Gửi access_token trong header
					},
				}
			)
			.then(() => {
				setAccessTokenToLS("");
				setRefreshTokenToLS("");
				setProfileToLS("");
				setIsAuthenticatedToLS(false);
				navigate("/login");
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const handleClickGetId = (user_name) => () => {
		const access_token = getAccessTokenFromLS();
		axios
			.get("http://localhost:4000/users/" + user_name, {
				headers: {
					Authorization: `Bearer ${access_token}`,
				},
			})
			.then((res) => {
				const userInfo = res.data.data;
				alert("Bạn muốn chat với " + userInfo.email);
				setReceiverId(userInfo._id);
			})
			.catch((err) => {
				console.log(err);
			});
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

			<div
				id="scrollableDiv"
				style={{
					height: 300,
					overflow: "auto",
					display: "flex",
					flexDirection: "column-reverse",
				}}
			>
				<InfiniteScroll
					dataLength={conversations.length}
					next={fetchMoreConversations}
					inverse={true}
					hasMore={pagination.page < pagination.total_page}
					style={{ display: "flex", flexDirection: "column-reverse" }}
					loader={<h4>Loading...</h4>}
					scrollableTarget="scrollableDiv"
				>
					{conversations.map((conversation, index) => (
						<div key={index}>
							<div
								className={
									conversation.sender_id === profile._id
										? "chat-r chat"
										: "chat"
								}
							>
								{conversation.content}
							</div>
						</div>
					))}
				</InfiniteScroll>
			</div>

			<br />
			<br />

			<form className="chat-form" onSubmit={send}>
				<input
					className="chat-input"
					type="text"
					placeholder="Nhập tin nhắn"
					value={value}
					onChange={(e) => setValue(e.target.value)}
				/>
				<button className="chat-btn">Gửi</button>
			</form>
		</div>
	);
};

export default Chat;
