
interface Recording {
  id: number;
  url: string;
  text: string;
}

interface RecordingsListProps {
  recordings: Recording[];
}

export function RecordingsList({ recordings }: RecordingsListProps) {
  return (
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
  );
}