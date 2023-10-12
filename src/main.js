import { initializeChat } from './chat.js';

let textBoxNode;
let loaderNode;

function appendImageToChat(base64Image) {
    const imgNode = document.createElement('img');
    imgNode.src = `data:image/jpeg;base64,${base64Image}`;
    imgNode.alt = "Uploaded Image";
    imgNode.className = "chat-image"; // Optional: Add a class for styling

    textBoxNode.appendChild(imgNode);
}

function getImageDataFromImage(original) {
    // Helper function to get image data from image element
    const canvas = document.createElement('canvas');
    canvas.width = original.naturalWidth;
    canvas.height = original.naturalHeight;
  
    const ctx = canvas.getContext('2d');
  
    // Optional: You can adjust these canvas context properties to tweak the rendering quality
    // ctx.patternQuality = 'bilinear';
    // ctx.quality = 'bilinear';
    // ctx.antialias = 'default';
    // ctx.imageSmoothingQuality = 'high';
  
    ctx.drawImage(original, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL();
  }
  

document.addEventListener('DOMContentLoaded', () => {
    textBoxNode = document.getElementById('textbox');
    loaderNode = document.getElementById('loader');
    
    const worker = new Worker('./worker.js', { type: 'module' });

    worker.onmessage = (event) => {
        const data = event.data;

        if (data.type === 'result' && data.task === 'image-to-text') {
            const extractedText = data.data;
            textBoxNode.innerHTML += `<div class="message received">Extracted from image: ${extractedText}</div>`;
            loaderNode.style.display = 'none'; // hide the loader
            
            // Now, use the extracted text to interact with the GPT chatbot
            initializeChat(extractedText);
        }
    };

    const processImageBtn = document.getElementById("process-image");
    const imageUpload = document.getElementById("image-upload");

    processImageBtn.addEventListener('click', async () => {
        if (imageUpload.files.length > 0) {
            loaderNode.style.display = 'block'; // show loader
    
            const image = imageUpload.files[0];
            const reader = new FileReader();
    
            reader.onload = () => {
                const imageElement = new Image();
                imageElement.onload = () => {
                    const base64Image = getImageDataFromImage(imageElement).split(',')[1];
    
                    // Append the image to chat before sending it to the worker
                    appendImageToChat(base64Image);
    
                    worker.postMessage({
                        task: 'image-to-text',
                        image: base64Image
                    });
                };
                imageElement.src = reader.result;
            };
    
            reader.readAsDataURL(image);
        }
    });    
    

    initializeChat();
});