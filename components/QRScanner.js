// QRScanner.js

// Main QR Scanner component
const QRScanner = () => {
    // State management using React hooks
    const [scanning, setScanning] = React.useState(false);
    const [scannedCodes, setScannedCodes] = React.useState([]);
    const [selectedCode, setSelectedCode] = React.useState(null);
    const [error, setError] = React.useState(null);

    // Load saved codes when component mounts
    React.useEffect(() => {
        loadSavedCodes();
    }, []);

    // Function to load codes from localStorage
    const loadSavedCodes = () => {
        try {
            const savedCodes = localStorage.getItem('qrCodes');
            if (savedCodes) {
                setScannedCodes(JSON.parse(savedCodes));
            }
        } catch (err) {
            setError('Failed to load saved codes');
            console.error('Load error:', err);
        }
    };

    // Function to save codes to localStorage
    const saveCode = (codes) => {
        try {
            localStorage.setItem('qrCodes', JSON.stringify(codes));
        } catch (err) {
            setError('Failed to save code');
            console.error('Save error:', err);
        }
    };

    // Start QR code scanning
    const startScanning = () => {
        try {
            const scanner = new Html5QrcodeScanner(
                "qr-reader",
                { 
                    fps: 10, 
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                }
            );

            scanner.render((decodedText) => {
                // Success callback
                handleSuccessfulScan(decodedText);
            }, (errorMessage) => {
                // Error callback
                console.log(errorMessage);
            });

            setScanning(true);
        } catch (err) {
            setError('Failed to start scanner');
            console.error('Scanner error:', err);
        }
    };

    // Handle successful QR code scan
    const handleSuccessfulScan = (decodedText) => {
        setScannedCodes(prevCodes => {
            // Check if code already exists
            if (prevCodes.some(code => code.data === decodedText)) {
                return prevCodes; // Skip duplicates
            }

            // Create new code entry
            const newCode = {
                id: Date.now(),
                data: decodedText,
                timestamp: new Date().toLocaleString()
            };

            // Update codes array
            const updatedCodes = [...prevCodes, newCode];
            saveCode(updatedCodes); // Save to localStorage
            return updatedCodes;
        });
    };

    // Delete a saved code
    const deleteCode = (idToDelete) => {
        setScannedCodes(prevCodes => {
            const updatedCodes = prevCodes.filter(code => code.id !== idToDelete);
            saveCode(updatedCodes);
            return updatedCodes;
        });

        if (selectedCode?.id === idToDelete) {
            setSelectedCode(null);
        }
    };

    // Render the component
    return (
        <div className="max-w-2xl mx-auto p-4">
            <div className="bg-white rounded-lg shadow-lg p-4">
                {/* Header */}
                <div className="mb-4">
                    <h1 className="text-2xl font-bold">QR Code Scanner</h1>
                    <p className="text-gray-600">Scan and store QR codes</p>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                        {error}
                        <button 
                            onClick={() => setError(null)}
                            className="ml-2 text-sm underline"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Scanner Controls */}
                {!scanning && (
                    <button 
                        onClick={startScanning}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Start Scanning
                    </button>
                )}

                {/* Scanner View */}
                <div id="qr-reader" className="mt-4"></div>

                {/* Selected Code Display */}
                {selectedCode && (
                    <div className="mt-4 p-4 bg-blue-50 rounded">
                        <h3 className="font-bold">Selected Code</h3>
                        <p>{selectedCode.data}</p>
                        <p className="text-sm text-gray-600">{selectedCode.timestamp}</p>
                    </div>
                )}

                {/* Scanned Codes List */}
                {scannedCodes.length > 0 && (
                    <div className="mt-4">
                        <h2 className="text-xl font-bold mb-2">Saved Codes</h2>
                        <div className="space-y-2">
                            {scannedCodes.map((code) => (
                                <div 
                                    key={code.id}
                                    className={`p-3 rounded cursor-pointer ${
                                        selectedCode?.id === code.id 
                                            ? 'bg-blue-100' 
                                            : 'bg-gray-100'
                                    }`}
                                    onClick={() => setSelectedCode(code)}
                                >
                                    <div className="flex justify-between">
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
    );
};

// Export the component for use
export default QRScanner;
