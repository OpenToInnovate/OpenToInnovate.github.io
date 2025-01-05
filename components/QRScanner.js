const QRScanner = () => {
    // State variables
    const [scanning, setScanning] = React.useState(false);
    const [scannedCodes, setScannedCodes] = React.useState([]);
    const [error, setError] = React.useState(null);
    const [debug, setDebug] = React.useState('');
    const [selectedCode, setSelectedCode] = React.useState(null);
    
    // Reference to video element
    const videoRef = React.useRef(null);
    const qrScannerRef = React.useRef(null);

    // Load saved codes from localStorage when component mounts
    React.useEffect(() => {
        const savedCodes = localStorage.getItem('scannedCodes');
        if (savedCodes) {
            setScannedCodes(JSON.parse(savedCodes));
        }
    }, []);

    // Function to save codes to localStorage
    const saveToLocalStorage = (codes) => {
        localStorage.setItem('scannedCodes', JSON.stringify(codes));
    };

    // Function to add new scan, preventing duplicates
    const addNewScan = (newCode) => {
        setScannedCodes(prevCodes => {
            // Check if code already exists
            const isDuplicate = prevCodes.some(code => code.data === newCode.data);
            if (isDuplicate) {
                setDebug('Code already scanned!');
                return prevCodes;
            }
            
            // Add new code
            const updatedCodes = [...prevCodes, newCode];
            saveToLocalStorage(updatedCodes);
            return updatedCodes;
        });
    };

    // Function to start scanning
    const startScanning = async () => {
        try {
            setError(null);
            setDebug('Starting camera...');
            
            if (!videoRef.current) {
                setError('No video element found!');
                return;
            }

            // Create and start QR scanner
            qrScannerRef.current = new QrScanner(
                videoRef.current,
                result => {
                    setDebug('Code detected: ' + result.data);
                    const newCode = {
                        id: Date.now(), // Unique ID for each scan
                        data: result.data,
                        timestamp: new Date().toLocaleString(),
                        type: 'qr' // or 'barcode' if detected
                    };
                    addNewScan(newCode);
                },
                {
                    returnDetailedScanResult: true,
                    highlightScanRegion: true,
                    highlightCodeOutline: true,
                }
            );

            await qrScannerRef.current.start();
            setDebug('Scanner started');
            setScanning(true);

        } catch (err) {
            console.error('Scanner error:', err);
            setError('Error: ' + err.message);
            setDebug('Error occurred: ' + err.message);
            setScanning(false);
        }
    };

    // Function to stop scanning
    const stopScanning = () => {
        if (qrScannerRef.current) {
            qrScannerRef.current.stop();
        }
        setScanning(false);
        setDebug('Scanning stopped');
    };

    // Function to delete a saved code
    const deleteCode = (idToDelete) => {
        setScannedCodes(prevCodes => {
            const updatedCodes = prevCodes.filter(code => code.id !== idToDelete);
            saveToLocalStorage(updatedCodes);
            return updatedCodes;
        });
        if (selectedCode?.id === idToDelete) {
            setSelectedCode(null);
        }
    };

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            if (qrScannerRef.current) {
                qrScannerRef.current.stop();
            }
        };
    }, []);

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

                    {/* Camera controls and view */}
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

                        {/* Camera view */}
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

                        {/* Selected code display */}
                        {selectedCode && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">Selected Code</h3>
                                <div className="font-medium">{selectedCode.data}</div>
                                <div className="text-sm text-gray-500">
                                    Scanned: {selectedCode.timestamp}
                                </div>
                            </div>
                        )}

                        {/* Scan history */}
                        {scannedCodes.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold mb-2">Saved Codes</h3>
                                <div className="space-y-2">
                                    {scannedCodes.map((code) => (
                                        <div 
                                            key={code.id}
                                            className={`p-3 rounded-lg cursor-pointer ${
                                                selectedCode?.id === code.id 
                                                    ? 'bg-blue-100 border-2 border-blue-500' 
                                                    : 'bg-gray-50 hover:bg-gray-100'
                                            }`}
                                            onClick={() => setSelectedCode(code)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-medium">{code.data}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {code.timestamp}
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteCode(code.id);
                                                    }}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    Delete
                                                </button>
                                            </div>
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
