// QRScanner.js

// Main component function - this is where everything starts
const QRScanner = () => {
    // React's useState hook lets us store and update data
    // [variable, functionToUpdateVariable] = React.useState(defaultValue)
    const [scanning, setScanning] = React.useState(false);  // Tracks if we're currently scanning
    const [scannedCodes, setScannedCodes] = React.useState([]); // Array to store all scanned codes
    const [error, setError] = React.useState(null);  // Stores any error messages
    const [stream, setStream] = React.useState(null);  // Stores the camera stream

    // useEffect hook runs code when the component mounts/unmounts
    // This is like a cleanup function - it runs when the component is removed from the page
    React.useEffect(() => {
        // Return a cleanup function that stops the camera when we're done
        return () => {
            if (stream) {
                // Stop all tracks (camera) if they're running
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]); // Only run this effect when 'stream' changes

    // Function to start the QR code scanning process
    const startScanning = async () => {
        try {
            setError(null); // Clear any previous errors
            // Request access to the camera (will prompt user for permission)
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } // Use back camera if available
            });
            setStream(mediaStream);
            setScanning(true);

            // Create a video element to display the camera feed
            const video = document.createElement('video');
            video.srcObject = mediaStream;
            await video.play();

            // Create new QR scanner instance
            // This uses the QrScanner library we loaded in index.html
            const qrScanner = new QrScanner(
                video,  // Pass the video element
                result => {  // This function runs when a QR code is detected
                    if (result) {
                        // Create a new entry for the scanned code
                        const newCode = {
                            data: result.data,  // The QR code content
                            timestamp: new Date().toLocaleString()  // When it was scanned
                        };
                        // Add the new code to our list (keeping all previous codes)
                        setScannedCodes(prev => [...prev, newCode]);
                        stopScanning();  // Stop scanning after successful scan
                    }
                },
                { returnDetailedScanResult: true }  // Get detailed scan results
            );
            qrScanner.start();  // Start the scanner

        } catch (err) {
            // If anything goes wrong (like user denies camera access)
            setError('Error accessing camera: ' + err.message);
            setScanning(false);
        }
    };

    // Function to stop the QR scanner
    const stopScanning = () => {
        if (stream) {
            // Stop all camera tracks
            stream.getTracks().forEach(track => track.stop());
        }
        setStream(null);
        setScanning(false);
    };

    // Function to clear all scanned codes from history
    const clearScannedCodes = () => {
        setScannedCodes([]);
    };

    // The JSX (HTML-like code) that gets rendered to the page
    return (
        // Main container with max width and padding
        <div className="max-w-2xl mx-auto p-4">
            {/* Card container with white background and shadow */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header section */}
                <div className="p-4 border-b">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <span className="lucide lucide-camera" /> QR Code Scanner
                    </h1>
                </div>

                {/* Main content section */}
                <div className="p-4">
                    {/* Show error message if there is one */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Control buttons */}
                        <div className="flex gap-2">
                            <button 
                                onClick={scanning ? stopScanning : startScanning}
                                className={`px-4 py-2 rounded font-medium ${scanning ? 
                                    'bg-red-500 text-white' : // Red when scanning
                                    'bg-blue-500 text-white'  // Blue when not scanning
                                }`}
                            >
                                {scanning ? 'Stop Scanning' : 'Start Scanning'}
                            </button>

                            {/* Only show clear history button if we have scanned codes */}
                            {scannedCodes.length > 0 && (
                                <button 
                                    onClick={clearScannedCodes}
                                    className="px-4 py-2 rounded font-medium border border-gray-300"
                                >
                                    Clear History
                                </button>
                            )}
                        </div>

                        {/* Camera view - only shown when scanning */}
                        {scanning && (
                            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                <video 
                                    id="qr-video" 
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Scanned codes history - only shown if we have scanned codes */}
                        {scannedCodes.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold mb-2">Scan History</h3>
                                <div className="space-y-2">
                                    {/* Map through all scanned codes and display them */}
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
