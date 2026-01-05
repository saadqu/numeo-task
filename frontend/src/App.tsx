import { useRef, useState } from 'react'
import './App.css'

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
    </>
  )
}

export default App
