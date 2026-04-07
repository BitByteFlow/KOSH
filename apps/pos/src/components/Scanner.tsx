import React, { useEffect, useRef, useState, useCallback } from "react";
import {
	BrowserMultiFormatReader,
	type IScannerControls,
} from "@zxing/browser";
import { X, RefreshCw, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@kosh/ui/components/button";

interface ScannerProps {
	onScan: (result: string) => void;
	onClose: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScan, onClose }) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const controlsRef = useRef<IScannerControls | null>(null);
	const isScanningRef = useRef(false);

	const handleScan = useCallback(
		(result: string) => {
			if (isScanningRef.current) return;
			isScanningRef.current = true;
			console.log("✅ Barcode scanned:", result);
			onScan(result);
			setTimeout(() => onClose(), 100);
		},
		[onScan, onClose],
	);

	useEffect(() => {
		let isMounted = true;
		const codeReader = new BrowserMultiFormatReader();
		let videoElement: HTMLVideoElement | null = null;

		const startScanner = async () => {
			try {
				videoElement = videoRef.current;
				if (!videoElement) {
					console.error("❌ Video ref is null");
					return;
				}

				setIsLoading(true);
				setError(null);

				console.log("📷 Starting camera...");

				try {
					const stream = await navigator.mediaDevices.getUserMedia({
						video: {
							facingMode: "environment",
							width: { ideal: 1280 },
							height: { ideal: 720 },
						},
					});

					if (!isMounted) {
						for (const t of stream.getTracks()) {
							t.stop();
						}
						return;
					}

					videoElement.srcObject = stream;
					await videoElement.play();
					console.log("📹 Camera stream active");
				} catch (camErr) {
					console.error("❌ Camera access error:", camErr);
					setError(
						`Camera access denied: ${camErr instanceof Error ? camErr.message : "Unknown error"}`,
					);
					setIsLoading(false);
					return;
				}

				const devices = await BrowserMultiFormatReader.listVideoInputDevices();
				console.log("📹 Available cameras:", devices.length);
				if (!isMounted) return;

				if (devices.length === 0) {
					setError("No camera devices found");
					setIsLoading(false);
					return;
				}

				const backCamera = devices.find(
					(d) =>
						d.label.toLowerCase().includes("back") ||
						d.label.toLowerCase().includes("environment"),
				);
				const selectedDeviceId = backCamera?.deviceId || devices[0].deviceId;
				console.log("🎯 Using camera:", backCamera ? "back" : "front");

				const controls = await codeReader.decodeFromVideoDevice(
					selectedDeviceId,
					videoElement,
					(result, err) => {
						if (result?.getText()) {
							const text = result.getText();
							console.log("📦 Detected barcode:", text);
							console.log(
								" Barcode format:",
								result.getBarcodeFormat()?.toString(),
							);
							console.log("📏 Length:", text.length);
							console.log("🔢 Is numeric:", /^\d+$/.test(text));
							handleScan(text);
						}
						if (err) {
							// Only log occasional errors to avoid spam
							if (Math.random() < 0.01) {
								console.log(
									"⚠️ Decode attempt failed (normal during scanning)",
								);
							}
						}
					},
				);

				if (!isMounted) {
					controls.stop();
				} else {
					controlsRef.current = controls;
					setIsLoading(false);
					console.log("✅ Scanner ready - try scanning a barcode now");
				}
			} catch (err) {
				if (!isMounted) return;
				console.error("❌ Scanner Error:", err);
				const message = err instanceof Error ? err.message : "Unknown error";
				setError(`Could not access camera: ${message}`);
				setIsLoading(false);
			}
		};

		startScanner();

		return () => {
			isMounted = false;
			isScanningRef.current = false;

			if (controlsRef.current) {
				try {
					controlsRef.current.stop();
				} catch (e) {
					console.error("Error stopping scanner:", e);
				}
				controlsRef.current = null;
			}

			if (videoElement?.srcObject) {
				const stream = videoElement.srcObject as MediaStream;
				const tracks = stream.getTracks();
				for (const track of tracks) {
					track.stop();
				}
				videoElement.srcObject = null;
			}
		};
	}, [handleScan]);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 z-100 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
		>
			<div className="relative w-full max-w-lg aspect-square sm:aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border-4 border-white/10">
				<video
					ref={videoRef}
					className="w-full h-full object-cover"
					muted
					playsInline
				/>

				<div className="absolute inset-0 border-40 border-black/40 pointer-events-none">
					<div className="w-full h-full border-2 border-primary/50 relative">
						<div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
						<div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
						<div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
						<div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />

						<motion.div
							animate={{ top: ["10%", "90%"] }}
							transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
							className="absolute left-0 right-0 h-0.5 bg-primary/80 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
						/>
					</div>
				</div>

				{isLoading && !error && (
					<div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 gap-4">
						<RefreshCw
							className="animate-spin text-primary"
							size={48}
						/>
						<p className="text-white font-bold tracking-widest uppercase text-xs">
							Initializing Optics
						</p>
					</div>
				)}

				{error && (
					<div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 p-8 text-center gap-4">
						<Camera
							className="text-red-500"
							size={48}
						/>
						<p className="text-red-400 font-bold text-sm">{error}</p>
						<Button
							variant="secondary"
							onClick={onClose}
							className="mt-4"
						>
							Close Scanner
						</Button>
					</div>
				)}
			</div>

			<div className="mt-12 flex flex-col items-center gap-6 w-full max-w-md px-4">
				<div className="text-center space-y-2">
					<h2 className="text-white text-2xl font-black tracking-tight ">
						Ready to Scan
					</h2>
					<p className="text-slate-400 text-sm font-medium">
						Position the barcode within the central frame
					</p>
				</div>

				<Button
					size="icon"
					variant="outline"
					onClick={onClose}
					className="w-16 h-16 rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-110 active:scale-95 transition-all shadow-xl"
				>
					<X size={32} />
				</Button>
			</div>
		</motion.div>
	);
};

export default Scanner;
