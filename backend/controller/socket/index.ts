import { Socket } from "socket.io";

export function socketController(socket: Socket) {
  // Socket controller logic here

  socket.on("upload_file", (data) => {
    console.log("File uploaded:", data);
    // Handle file upload logic
  });
  
}