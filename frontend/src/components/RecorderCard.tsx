
interface RecorderCardProps {
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
}

export function RecorderCard({
  isRecording,
  startRecording,
  stopRecording,
}: RecorderCardProps) {
  return (
    <div>
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
    </div>
  );
}