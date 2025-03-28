import axios from "axios";
import React, { useState } from "react";
import {
	getAccessTokenFromLS,
	getProfileFromLS,
	setAccessTokenToLS,
	setIsAuthenticatedToLS,
	setProfileToLS,
	setRefreshTokenToLS,
} from "./utils/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
	const navigate = useNavigate();
	const initFormData = { email: "", password: "" };
	const [formData, setFormData] = useState(initFormData);
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};
	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			// Gửi yêu cầu đăng nhập
			const response = await axios.post(
				"http://localhost:4000/users/login",
				formData
			);
			const { access_token, refresh_token } = response.data.data;

			// Sau khi đăng nhập thành công, gọi API /me và set access_token và refresh_token vào localStorage và chuyển hướng đến trang chat
			setAccessTokenToLS(access_token);
			setRefreshTokenToLS(refresh_token);

			const accessTokenFromLS = getAccessTokenFromLS();
			const profile = await axios.get("http://localhost:4000/users/me", {
				headers: {
					Authorization: `Bearer ${accessTokenFromLS}`,
				},
			});
			setProfileToLS(profile.data.data);
			setIsAuthenticatedToLS(true);
			navigate("/chat");
		} catch (error) {
			console.log(error);
		}
	};
	return (
		<div>
			<h1>Đăng nhập</h1>
			<form onSubmit={handleSubmit}>
				<input
					type="email"
					name="email"
					value={formData.email}
					onChange={handleChange}
					placeholder="Email"
				/>
				<br />
				<input
					type="text"
					name="password"
					value={formData.password}
					onChange={handleChange}
					placeholder="Password"
				/>
				<br />
				<br />
				<button>Login</button>
			</form>
		</div>
	);
};

export default Login;
