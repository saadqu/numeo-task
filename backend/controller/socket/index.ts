import { Socket } from "socket.io";

export function socketController(socket: Socket) {
  // Socket controller logic here

  socket.on("upload_file", (data) => {
    console.log("File uploaded:", data.size);
    // Handle file upload logic

    setTimeout(() => {
      socket.emit("audio_parsed", { id: data.id, text: "Transcription complete: Hello world!" });
      console.log("File processed and response sent to client");
    }, 3000); // Simulate processing delay
  });
  
}