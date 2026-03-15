"use client"

import { useRef, useState } from "react"
import { BrowserMultiFormatReader } from "@zxing/browser"

export default function BarcodeScanner() {
	const videoRef = useRef<HTMLVideoElement | null>(null)
	const codeReader = useRef<BrowserMultiFormatReader | null>(null)

	const [scanning, setScanning] = useState(false)
	const [result, setResult] = useState<string | null>(null)
	const startScanning = async () => {
		setResult(null)
		setScanning(true)

		try {
			codeReader.current = new BrowserMultiFormatReader()

			await codeReader.current.decodeFromConstraints(
				{
					video: {
						facingMode: { ideal: "environment" }
					}
				},
				videoRef.current!,
				(res, err) => {
					if (res) {
						setResult(res.getText())
						stopScanning()
					}
				}
			)
		} catch (error) {
			console.error(error)
			alert("Camera access failed")
			stopScanning()
		}
	}


	const stopScanning = () => {
		// codeReader.current.()
		videoRef.current?.pause()
		setScanning(false)
	}

	return (
		<div style={{ maxWidth: 400 }}>
			{!scanning && (
				<button onClick={startScanning}>
					Scan Barcode
				</button>
			)}

			{scanning && (
				<div>
					<video
						ref={videoRef}
						style={{ width: "100%", borderRadius: 8 }}
					/>
					<button onClick={stopScanning}>
						Cancel
					</button>
				</div>
			)}

			{result && (
				<div style={{ marginTop: 20 }}>
					<strong>Scanned Data:</strong>
					<p>{result}</p>
				</div>
			)}
		</div>
	)
}