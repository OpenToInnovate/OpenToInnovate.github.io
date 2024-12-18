// QRScanner.js

const QRScanner = () => {
    // State variables
    const [scanning, setScanning] = React.useState(false);
    const [scannedCodes, setScannedCodes] = React.useState([]);
    const [error, setError] = React.useState(null);
    const [debug, setDebug] = React.useState(''); // Add debug info
    
    // Reference to our video element
    const videoRef = React.useRef(null);

    // Function to start the QR code scanning process
    const startScanning = async () => {
        try {
            setError(null);
            setDebug('Starting camera...');
            
            // Request camera access explicitly first
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' }
            });
            
            // Ensure we have a video element
            if (!videoRef.current) {
                setError('No video element found!');
                return;
            }

            // Connect the stream to the video element
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            
            setDebug('Camera started, initializing QR scanner...');
            
            // Create and start QR scanner
            const qrScanner = new QrScanner(
                videoRef.current,
                result => {
                    setDebug('QR Code detected: ' + result.data);
                    const newCode = {
                        data: result.data,
                        timestamp: new Date().toLocaleString()
                    };
                    setScannedCodes(prev => [...prev, newCode]);
                },
                {
                    returnDetailedScanResult: true,
                    highlightScanRegion: true,
                    highlightCodeOutline: true,
                }
            );

            await qrScanner.start();
            setDebug('QR scanner started');
            setScanning(true);

        } catch (err) {
            console.error('Scanner error:', err);
            setError('Error: ' + err.message);
            setDebug('Error occurred: ' + err.message);
            setScanning(false);
        }
    };

    // Function to stop the QR scanner
    const stopScanning = () => {
        try {
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
            setScanning(false);
            setDebug('Scanning stopped');
        } catch (err) {
            setError('Error stopping scanner: ' + err.message);
        }
    };

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            if (scanning) {
                stopScanning();
            }
        };
    }, [scanning]);

    return (
        <div className="max-w-2xl mx-auto p-4">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 border-b">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <span className="lucide lucide-camera" /> QR Code Scanner
                    </h1>
                </div>

                <div className="p-4">
                    {/* Debug info */}
                    <div className="mb-4 p-2 bg-gray-100 text-sm">
                        Status: {scanning ? 'Active' : 'Inactive'}<br />
                        Debug: {debug}
                    </div>

                    {/* Error display */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    {/* Camera controls */}
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <button 
                                onClick={scanning ? stopScanning : startScanning}
                                className={`px-4 py-2 rounded font-medium ${
                                    scanning ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                                }`}
                            >
                                {scanning ? 'Stop Camera' : 'Start Camera'}
                            </button>
                        </div>

                        {/* Camera view - using explicit dimensions and border */}
                        <div className="relative border-2 border-blue-500 bg-gray-100 rounded-lg overflow-hidden" 
                             style={{height: '300px'}}>
                            <video 
                                ref={videoRef}
                                className="absolute inset-0 w-full h-full object-cover"
                                playsInline
                                muted
                                autoPlay
                            />
                        </div>

                        {/* Scan history */}
                        {scannedCodes.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold mb-2">Scan History</h3>
                                <button 
                                    onClick={() => setScannedCodes([])}
                                    className="px-4 py-2 rounded font-medium border border-gray-300 mb-2"
                                >
                                    Clear History
                                </button>
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
