# Mobile-Holographic-Video-Conferencing
Inspired by eye-catching hologram on various stylish applications such as light decorations, product promotions, catering menu, etc, the developing team aspired to expand holographic implementation to video conferencing, which can often been seen from sci-fi movie but rarely encountered in real life.

In this project, we will develop an integrated system to support video conferencing, including the function to locate target user, establish connection, transfer communication data like image, video and text. In addition, the system will support account management to store user profile, communication history and recording. All image and video can be alter between holographic mode and pre-edit version.

# Enabled Tech

1.  TensorFlow.js with Model Body-Pix

Body-Pix is an open source machine learning model which allows person and body-part segmentation in the browser with TensorFlow.js on the device. With default settings, it estimates and renders person and body-part segmentation at 21 fps on an iPhone X. Figure 2 shows the expected result to be display on hologram and Figure 3 demonstrates the body part identification.

2.  WebRTC

WebRTC enables real-time communication of audio, video and data in Web and native apps. The setup would require a signalling server for connection, a media server for data transfer if media data exceed P2P capacity, and a STUN/TURN server to discover public IP address and relay traffic if connection fails. Figure 3 shows the architecture of WebRTC.

3.  Node.js

Node excels in building fast, scalable network applications, as it’s capable of handling a huge number of simultaneous connections with high throughput, making it a great candidate of the streaming application

# System Architecture

<img width="1080" alt="image" src="https://user-images.githubusercontent.com/43875433/122035332-f1fcce00-ce04-11eb-8996-88cfe574c9da.png">

# UI
<img width="284" alt="image" src="https://user-images.githubusercontent.com/43875433/122035532-22dd0300-ce05-11eb-8cd6-3133eb517e2b.png">

Friends can be seen and determine their online status as well as who can be call.

![image](https://user-images.githubusercontent.com/43875433/122035565-2a9ca780-ce05-11eb-801b-8ca49642ba39.jpeg)

Receiver will be notify by any video call invitation.

# Holographical Views

![image](https://user-images.githubusercontent.com/43875433/122035740-5c157300-ce05-11eb-91e7-d7527cd9d851.jpeg)

![image](https://user-images.githubusercontent.com/43875433/122035748-60419080-ce05-11eb-8496-1cc339f6c83d.jpeg)

![image](https://user-images.githubusercontent.com/43875433/122036343-0a211d00-ce06-11eb-86f9-65168d043cb6.jpeg)

# Hardware Components

![image](https://user-images.githubusercontent.com/43875433/122035956-9b43c400-ce05-11eb-9320-a532b141575f.jpeg)

# Future Development
It has been observed that a number of improvements could be appended into the system as the product was being developed, however it was abandoned due to limited resources. This section will discuss those restrictions of the submitted system as well as the possible improvements.

1.  Multiple Person Segmentations
2.	Broadcasting Video Conference
3.	Redesign a Collapsible Stand
