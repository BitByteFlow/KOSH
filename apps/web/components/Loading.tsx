import Logo from "public/logo.svg";
const Loading = () => {
	return (
		<div className="w-full h-full flex items-center justify-center">
			<Logo className="w-40 h-40 animate-pulse" />
		</div>
	);
};

export default Loading;