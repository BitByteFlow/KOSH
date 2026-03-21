import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { X, RefreshCw, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@kosh/ui/components/button";

interface ScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    const codeReader = new BrowserMultiFormatReader();

    const startScanner = async () => {
      try {
        if (!videoRef.current) return;
        
        setIsLoading(true);
        setError(null);

        // Try to get the environment (back) camera first
        const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
        const selectedDeviceId = videoInputDevices.length > 0 ? videoInputDevices[0].deviceId : undefined;

        if (!isMounted) return;

        const controls = await codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          (result, err) => {
            if (result && isMounted) {
              onScan(result.getText());
              // Important: We'll let the cleanup function handle the stop
              // but we can call onClose immediately
              onClose();
            }
            // Ignore individual frame errors as they are frequent during scanning
          }
        );

        if (!isMounted) {
          controls.stop();
        } else {
          controlsRef.current = controls;
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Scanner Error:', err);
          setError('Could not access camera. Please check permissions and ensure no other app is using it.');
          setIsLoading(false);
        }
      }
    };

    // Small delay to ensure the video ref is fully settled after animation
    const timeoutId = setTimeout(startScanner, 300);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      
      if (controlsRef.current) {
        try {
          controlsRef.current.stop();
        } catch (e) {
          console.error('Error stopping scanner controls:', e);
        }
      }

      // Fallback: Manually stop all tracks and clear srcObject
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => {
          try {
            track.stop();
          } catch (e) {}
        });
        videoRef.current.srcObject = null;
      }
    };
  }, [onScan, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
    >
      <div className="relative w-full max-w-lg aspect-square sm:aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border-4 border-white/10">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
        />
        
        {/* Overlay scanning effect */}
        <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
          <div className="w-full h-full border-2 border-primary/50 relative">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
            
            <motion.div
              animate={{ top: ['10%', '90%'] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute left-0 right-0 h-0.5 bg-primary/80 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
            />
          </div>
        </div>

        {(isLoading && !error) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 gap-4">
            <RefreshCw className="animate-spin text-primary" size={48} />
            <p className="text-white font-bold tracking-widest uppercase text-xs">Initializing Optics</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 p-8 text-center gap-4">
             <Camera className="text-red-500" size={48} />
             <p className="text-red-400 font-bold text-sm">{error}</p>
             <Button variant="secondary" onClick={onClose} className="mt-4">Close Scanner</Button>
          </div>
        )}
      </div>

      <div className="mt-12 flex flex-col items-center gap-6">
        <div className="text-center space-y-2">
          <h2 className="text-white text-2xl font-black tracking-tight uppercase">Ready to Scan</h2>
          <p className="text-slate-400 text-sm font-medium">Position the barcode within the central frame</p>
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
