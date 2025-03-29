import React from "react";
import viteLogo from "../public/vite.svg";
import reactLogo from "./assets/react.svg";
import { Link } from "react-router-dom";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
	defaultLayoutIcons,
	DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";

const getGoogleOAuthUrl = () => {
	const url = "https://accounts.google.com/o/oauth2/v2/auth";
	const { VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_REDIRECT_URI } = import.meta.env;
	const query = {
		client_id: VITE_GOOGLE_CLIENT_ID,
		redirect_uri: VITE_GOOGLE_REDIRECT_URI,
		response_type: "code",
		scope: [
			"https://www.googleapis.com/auth/userinfo.profile",
			"https://www.googleapis.com/auth/userinfo.email",
		].join(" "),
		prompt: "consent",
		access_type: "offline",
	};
	const queryString = new URLSearchParams(query).toString();
	return `${url}?${queryString}`;
};
const urlGoogleOAuth = getGoogleOAuthUrl();

const Home = () => {
	return (
		<>
			<div>
				<a href="https://vite.dev" target="_blank">
					<img src={viteLogo} className="logo" alt="Vite logo" />
				</a>
				<a href="https://react.dev" target="_blank">
					<img src={reactLogo} className="logo react" alt="React logo" />
				</a>
			</div>
			<h1>Login With Google OAuth2</h1>
			<Link to={urlGoogleOAuth} className="read-the-docs">
				Đăng Nhập
			</Link>
			<br />
			<br />
			<video controls width={500}>
				<source
					src="http://localhost:4000/static/video/82772d20717dc89c988588201.mp4"
					type="video/mp4"
				/>
			</video>
			<div>
				<h3>Video Streaming</h3>
				<video width="500" controls>
					<source src="" type="video/mp4"></source>
				</video>
			</div>
			{/* <div>
				<h3>Video HLS</h3>
				<MediaPlayer title="Sprite Fight" src="">
					<MediaProvider />
					<DefaultVideoLayout
						thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt"
						icons={defaultLayoutIcons}
					/>
				</MediaPlayer>
			</div> */}
		</>
	);
};

export default Home;
