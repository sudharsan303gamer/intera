// app.js
import config from './config.js';

// Initialize Supabase client
const supabaseUrl = config.SUPABASE_URL;
const supabaseKey = config.SUPABASE_KEY;
const supabase = Supabase.createClient(supabaseUrl, supabaseKey);

// Gemini AI setup (placeholder for now)
const GEMINI_API_KEY = config.GEMINI_API_KEY;
// const geminiClient = new Gemini.Client(GEMINI_API_KEY); // Assuming a Gemini JS SDK

// DOM Elements
const themeRadios = document.querySelectorAll('input[name="theme"]');
const roomRadios = document.querySelectorAll('input[name="room"]');
const furnitureCheckboxes = document.querySelectorAll('input[name="furniture"]');
const generateImageButton = document.getElementById('generate-image');
const saveDesignButton = document.getElementById('save-design');
const loadDesignButton = document.getElementById('load-design');
const designImage = document.getElementById('design-image');
const loadingOverlay = document.getElementById('loading-overlay');
const chatWindow = document.getElementById('chat-window');
const chatInput = document.getElementById('chat-input');
const sendChatButton = document.getElementById('send-chat');

// --- Helper Functions ---

// Function to show loading animation
function showLoading() {
    loadingOverlay.classList.add('active');
}

// Function to hide loading animation
function hideLoading() {
    loadingOverlay.classList.remove('active');
}

// Function to get selected options
function getSelectedOptions() {
    const selectedTheme = Array.from(themeRadios).find(radio => radio.checked)?.value || '';
    const selectedRoom = Array.from(roomRadios).find(radio => radio.checked)?.value || '';
    const selectedFurniture = Array.from(furnitureCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
    
    return { selectedTheme, selectedRoom, selectedFurniture };
}

// Function to display chat message
function displayMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    messageElement.innerHTML = `<p>${message}</p>`;
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight; // Scroll to bottom
}

// --- Main Functionality ---

// Placeholder for image generation (will be replaced with actual AI call)
async function generateDesignImage() {
    showLoading();
    const { selectedTheme, selectedRoom, selectedFurniture } = getSelectedOptions();
    const prompt = `Generate an interior design image for a ${selectedRoom} in a ${selectedTheme} style with ${selectedFurniture.join(', ') || 'no specific furniture'}.`;
    
    console.log("Image generation prompt:", prompt);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 3000)); 
    
    // Placeholder image based on selections (replace with actual image generation result)
    const imageUrl = `https://via.placeholder.com/600x400?text=${selectedTheme}+${selectedRoom}+Design`;
    designImage.src = imageUrl;
    hideLoading();
    displayMessage("Your design has been generated!", "ai");
}

// Function to send message to Gemini AI
async function sendChatToGemini(message) {
    displayMessage(message, "user");
    chatInput.value = ''; // Clear input

    // Simulate AI response
    displayMessage("Thinking...", "ai");

    // In a real app, you would send the message to your backend
    // which then calls the Gemini API.
    // For this example, we'll provide a dummy response.
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    const dummyResponses = [
        "That's a great choice! What kind of mood are you trying to create?",
        "Interesting! Tell me more about your preferences for colors and materials.",
        "I can help with that. Are there any specific elements you'd like to include or exclude?"
    ];
    const aiResponse = dummyResponses[Math.floor(Math.random() * dummyResponses.length)];
    
    const lastAiMessage = chatWindow.querySelector('.ai-message:last-child p');
    if (lastAiMessage && lastAiMessage.textContent === "Thinking...") {
        lastAiMessage.textContent = aiResponse;
    } else {
        displayMessage(aiResponse, "ai");
    }
}

// Function to save design to Supabase
async function saveDesign() {
    showLoading();
    const { selectedTheme, selectedRoom, selectedFurniture } = getSelectedOptions();
    const imageUrl = designImage.src;

    try {
        const { data, error } = await supabase
            .from('designs')
            .insert([{ theme: selectedTheme, room: selectedRoom, furniture: selectedFurniture, image_url: imageUrl }]);

        if (error) throw error;
        console.log('Design saved:', data);
        alert('Design saved successfully!');
    } catch (error) {
        console.error('Error saving design:', error.message);
        alert('Error saving design.');
    } finally {
        hideLoading();
    }
}

// Function to load design from Supabase
async function loadDesign() {
    showLoading();
    try {
        const { data, error } = await supabase
            .from('designs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
            const latestDesign = data[0];
            // Set the UI based on loaded design
            themeRadios.forEach(radio => radio.checked = (radio.value === latestDesign.theme));
            roomRadios.forEach(radio => radio.checked = (radio.value === latestDesign.room));
            furnitureCheckboxes.forEach(checkbox => {
                checkbox.checked = latestDesign.furniture.includes(checkbox.value);
            });
            designImage.src = latestDesign.image_url;
            alert('Latest design loaded successfully!');
        } else {
            alert('No designs found.');
        }
    } catch (error) {
        console.error('Error loading design:', error.message);
        alert('Error loading design.');
    } finally {
        hideLoading();
    }
}

// --- Event Listeners ---
generateImageButton.addEventListener('click', generateDesignImage);
saveDesignButton.addEventListener('click', saveDesign);
loadDesignButton.addEventListener('click', loadDesign);
sendChatButton.addEventListener('click', () => sendChatToGemini(chatInput.value));
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendChatToGemini(chatInput.value);
    }
});
