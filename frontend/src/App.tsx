import React, { useState, useEffect, useRef } from 'react';
import { Container, Typography, Button, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';
import { backend } from 'declarations/backend';

const VideoPreview = styled('video')({
  width: '100%',
  maxWidth: '640px',
  height: 'auto',
});

const ScannerContainer = styled('div')({
  position: 'relative',
  width: '100%',
  maxWidth: '640px',
  margin: '0 auto',
});

const ScanningIndicator = styled('div')({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  color: 'white',
  fontSize: '24px',
  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
});

function App() {
  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [scannedCodes, setScannedCodes] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetchScannedCodes();
  }, []);

  const fetchScannedCodes = async () => {
    try {
      const codes = await backend.getScannedBarcodes();
      setScannedCodes(codes);
    } catch (error) {
      console.error('Error fetching scanned codes:', error);
    }
  };

  const startScanning = async () => {
    setScanning(true);
    const codeReader = new ZXing.BrowserMultiFormatReader();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      codeReader.decodeFromVideoDevice(undefined, videoRef.current!, (result, err) => {
        if (result) {
          setScannedCode(result.getText());
          saveScannedCode(result.getText());
          stopScanning();
        }
        if (err && !(err instanceof ZXing.NotFoundException)) {
          console.error(err);
          stopScanning();
        }
      });
    } catch (error) {
      console.error('Error accessing camera:', error);
      setScanning(false);
    }
  };

  const stopScanning = () => {
    setScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const saveScannedCode = async (code: string) => {
    setLoading(true);
    try {
      await backend.addBarcode(code);
      await fetchScannedCodes();
    } catch (error) {
      console.error('Error saving scanned code:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleView = () => {
    setShowHistory(!showHistory);
    if (scanning) {
      stopScanning();
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Barcode Scanner
      </Typography>
      <Button variant="contained" color="primary" onClick={toggleView}>
        {showHistory ? 'Scan Barcode' : 'View History'}
      </Button>
      {!showHistory && (
        <ScannerContainer>
          <VideoPreview ref={videoRef} autoPlay playsInline />
          {scanning && <ScanningIndicator>Scanning...</ScanningIndicator>}
          <Button
            variant="contained"
            color="secondary"
            onClick={scanning ? stopScanning : startScanning}
            style={{ marginTop: '16px' }}
          >
            {scanning ? 'Stop Scanning' : 'Start Scanning'}
          </Button>
          {scannedCode && (
            <Typography variant="h6" style={{ marginTop: '16px' }}>
              Scanned Code: {scannedCode}
            </Typography>
          )}
        </ScannerContainer>
      )}
      {showHistory && (
        <>
          <Typography variant="h6" style={{ marginTop: '16px' }}>
            Scan History
          </Typography>
          {loading ? (
            <CircularProgress />
          ) : (
            <List>
              {scannedCodes.map((code, index) => (
                <ListItem key={index}>
                  <ListItemText primary={code} />
                </ListItem>
              ))}
            </List>
          )}
        </>
      )}
    </Container>
  );
}

export default App;