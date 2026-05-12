import Image from "next/image";

const Loading = () => {
	return (
		<div className="min-h-screen w-full h-full flex items-center justify-center">
			<Image
				src="/logo.svg"
				alt="Logo"
				width={160}
				height={160}
				className="w-40 h-40 animate-pulse"
				loading="eager"
				priority
			/>
		</div>
	);
};

export default Loading;
