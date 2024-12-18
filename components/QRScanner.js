// QRScanner.js

const QRScanner = () => {
    // State variables
    const [scanning, setScanning] = React.useState(false);
    const [scannedCodes, setScannedCodes] = React.useState([]);
    const [error, setError] = React.useState(null);
    
    // References to maintain state between renders
    const videoRef = React.useRef(null);  // Reference to video element
    const qrScannerRef = React.useRef(null);  // Reference to QR scanner instance

    // Function to start the QR code scanning process
    const startScanning = async () => {
        try {
            setError(null);
            
            // Create new QR scanner instance
            if (!qrScannerRef.current) {
                qrScannerRef.current = new QrScanner(
                    videoRef.current,  // Use the video element from our ref
                    result => {  // Success callback
                        const newCode = {
                            data: result.data,
                            timestamp: new Date().toLocaleString()
                        };
                        setScannedCodes(prev => [...prev, newCode]);
                        // Don't stop scanning automatically - let user decide
                    },
                    {
                        returnDetailedScanResult: true,
                        highlightScanRegion: true,  // Show scanning region
                        highlightCodeOutline: true, // Show detected QR code outline
                    }
                );
            }

            await qrScannerRef.current.start();
            setScanning(true);

        } catch (err) {
            console.error('Scanning error:', err);
            setError('Error accessing camera: ' + err.message);
            setScanning(false);
        }
    };

    // Function to stop the QR scanner
    const stopScanning = () => {
        if (qrScannerRef.current) {
            qrScannerRef.current.stop();
        }
        setScanning(false);
    };

    // Cleanup when component unmounts
    React.useEffect(() => {
        return () => {
            if (qrScannerRef.current) {
                qrScannerRef.current.stop();
            }
        };
    }, []);

    // Function to clear all scanned codes from history
    const clearScannedCodes = () => {
        setScannedCodes([]);
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 border-b">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <span className="lucide lucide-camera" /> QR Code Scanner
                    </h1>
                </div>

                <div className="p-4">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <button 
                                onClick={scanning ? stopScanning : startScanning}
                                className={`px-4 py-2 rounded font-medium ${scanning ? 
                                    'bg-red-500 text-white' : 
                                    'bg-blue-500 text-white'}`}
                            >
                                {scanning ? 'Stop Scanning' : 'Start Scanning'}
                            </button>
                            {scannedCodes.length > 0 && (
                                <button 
                                    onClick={clearScannedCodes}
                                    className="px-4 py-2 rounded font-medium border border-gray-300"
                                >
                                    Clear History
                                </button>
                            )}
                        </div>

                        {/* Camera view - always present but hidden when not scanning */}
                        <div className={`relative aspect-video bg-gray-100 rounded-lg overflow-hidden ${!scanning ? 'hidden' : ''}`}>
                            <video 
                                ref={videoRef}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </div>

                        {scannedCodes.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold mb-2">Scan History</h3>
                                <div className="space-y-2">
                                    {scannedCodes.map((code, index) => (
                                        <div 
                                            key={index}
                                            className="p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div className="font-medium">{code.data}</div>
                                            <div className="text-sm text-gray-500">{code.timestamp}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
