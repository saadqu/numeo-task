import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client';
import './App.css'
const BASE_URL: string = import.meta.env.VITE_BASE_URL || 'http://localhost:3001';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [recordings, setRecordings] = useState<any[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {

    console.log('Connecting to socket server at', BASE_URL);
    socketRef.current = io(BASE_URL);

    socketRef.current.on('connect', () => {
      console.log('Connected to socket server with id:', socketRef.current?.id);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    socketRef.current.on('audio_parsed', (data) => {
      console.log('Message received from server:', data);
      setRecordings((prevRecordings) => {
        const updatedRecordings = [...prevRecordings];
        // console.log('Updating recordings with data:', data);
        const recordingIndex = updatedRecordings.findIndex(r => r.id === data.id);
        console.log('Recording index to update:', recordingIndex);
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
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

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
        console.log('Data available:', event.data);
        audioChunksRef.current.push(event.data);
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        console.log('Recording stopped. Audio Blob:', audioBlob);

        const audioUrl = URL.createObjectURL(audioBlob);
        // Here you can handle the audioBlob, e.g., upload it to the server

        const newRecording = { id: Date.now(), url: audioUrl, text: 'Parsing in progress...' };
        setRecordings((prevRecordings) => [...prevRecordings, newRecording]);

        // Send the audio blob to the server via socket
        if (socketRef.current) {
          socketRef.current.emit('upload_file', { id: newRecording.id, size: audioBlob.size, blob: audioBlob });
          console.log('Audio blob sent to server via socket');
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
      <h1 className="text-3xl font-bold underline">   Numeo Speech to Text System  </h1>

      <div>
        {!isRecording ? (
          <button
            className="mt-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={startRecording}
          >
            Record
          </button>
        ) : (
          <button
            className="mt-5 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={stopRecording}
          >
            Stop
          </button>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold mt-5">Recordings:</h2>
        <ul>
          {recordings.map((recording, index) => (
            <li key={index}>
              <audio controls src={recording.url}></audio>
              <p className='text-left'>{recording.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default App
