import { useEffect, useRef, useState } from 'react'
import { RecordingsList } from './components/RecordingsList';
import { RecorderCard } from './components/RecorderCard';
import { SocketProvider, useSocket } from './context/SocketContext';
import './App.css'

function SpeechAnalyzer() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [recordings, setRecordings] = useState<any[]>([]);

  const { socket, isConnected } = useSocket();

  useEffect(() => {
    socket.on('audio_parsed', (data) => {
      setRecordings((prevRecordings) => {
        const updatedRecordings = [...prevRecordings];
        const recordingIndex = updatedRecordings.findIndex(r => r.id === data.id);
        if (recordingIndex !== -1) {
          updatedRecordings[recordingIndex].text = data.text;
        }
        return updatedRecordings;
      });
    });

    // Cleanup on component unmount
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket, mediaRecorderRef]);

  const startRecording = async () => {
    try {
      setIsRecording(true);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('getUserMedia not supported on your browser!');
        setIsRecording(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.start();

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });

        const audioUrl = URL.createObjectURL(audioBlob);
        // Here you can handle the audioBlob, e.g., upload it to the server

        const newRecording = { id: Date.now(), url: audioUrl, text: 'Parsing in progress...' };
        setRecordings((prevRecordings) => [...prevRecordings, newRecording]);

        // Send the audio blob to the server via socket
        if (socket) {
          socket.emit('upload_file', { id: newRecording.id, size: audioBlob.size, blob: audioBlob });
        } else {
          console.error('Socket not connected');
        }

        stream.getTracks().forEach(track => track.stop());
      }


    } catch (error) {
      console.error('The following error occurred: ' + error);
    }
  }

  const stopRecording = () => {

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }

  return (
    <>
      <SocketProvider>
        <h1 className="text-3xl font-bold underline">   Numeo Speech to Text System  </h1>

        <p>Socket Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
        <RecorderCard isRecording={isRecording} startRecording={startRecording} stopRecording={stopRecording} />

        <RecordingsList recordings={recordings} />
      </SocketProvider>
    </>
  )
}

function App() {
  return (
    <SocketProvider>
      <SpeechAnalyzer />
    </SocketProvider>
  );
}

export default App
