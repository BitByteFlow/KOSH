import Logo from "../../public/logo.svg";

interface LoadingProps {
	variant?: "page" | "modal";
}

const Loading = ({ variant = "page" }: LoadingProps) => {
	if (variant === "modal") {
		return (
			<output
				className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
				aria-label="Loading"
			>
				<div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl">
					<img
						src={Logo}
						alt="KOSH POS Logo"
						className="w-24 h-24 animate-pulse"
					/>
				</div>
			</output>
		);
	}

	return (
		<output
			className="w-full h-full flex items-center justify-center bg-slate-50"
			aria-label="Loading application"
		>
			<img
				src={Logo}
				alt="KOSH POS Logo"
				className="w-40 h-40 animate-pulse"
			/>
		</output>
	);
};

export default Loading;
