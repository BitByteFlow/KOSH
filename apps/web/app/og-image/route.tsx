import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
	return new ImageResponse(
		(
			<div
				style={{
					height: "100%",
					width: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: "#0f172a",
					backgroundImage:
						"radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)",
				}}
			>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<div
						style={{
							fontSize: 120,
							fontWeight: 800,
							backgroundImage: "linear-gradient(to right, #60a5fa, #a78bfa)",
							WebkitBackgroundClip: "text",
							color: "transparent",
							marginBottom: 20,
							letterSpacing: "-0.02em",
						}}
					>
						Kosh
					</div>
					<div
						style={{
							fontSize: 40,
							fontWeight: 400,
							color: "#94a3b8",
							textAlign: "center",
							maxWidth: "800px",
							lineHeight: 1.4,
							letterSpacing: "-0.01em",
						}}
					>
						Modern POS & Business Management Platform
					</div>
					<div
						style={{
							marginTop: 60,
							display: "flex",
							gap: 30,
							fontSize: 24,
							color: "#64748b",
						}}
					>
						<span>Sales Tracking</span>
						<span>•</span>
						<span>Inventory</span>
						<span>•</span>
						<span>Analytics</span>
					</div>
				</div>
			</div>
		),
		{
			width: 1200,
			height: 630,
		},
	);
}


