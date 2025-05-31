// Function to open a modal
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

// Function to close a modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    // Clear content and show loader again for next time
    if (modalId === 'benefitModal') {
        document.getElementById('benefitContent').innerHTML = '<div class="loader" id="benefitLoader"></div>';
    }
}

// Close modals when clicking outside of them
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        // Clear content and show loader again for next time
        if (event.target.id === 'benefitModal') {
            document.getElementById('benefitContent').innerHTML = '<div class="loader" id="benefitLoader"></div>';
        }
    }
}

// Function to call Gemini API for benefit expansion
async function openBenefitModal(benefitType) {
    openModal('benefitModal');
    const benefitTitle = document.getElementById('benefitTitle');
    const benefitContentDiv = document.getElementById('benefitContent');
    const benefitLoader = document.getElementById('benefitLoader');

    benefitTitle.textContent = `Exploring ${benefitType}`;
    benefitContentDiv.innerHTML = ''; // Clear previous content
    benefitLoader.style.display = 'block'; // Show loader

    const prompt = `Provide a detailed explanation of the "${benefitType}" benefit of saffron. Elaborate on how saffron contributes to this benefit and give specific examples or traditional uses. Keep the explanation concise but informative, suitable for a website section.`;
    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
    const payload = { contents: chatHistory };
    const apiKey = ""; // API key will be provided by Canvas runtime
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            benefitContentDiv.innerHTML = formatTextAsHtml(text); // Display generated benefit info
        } else {
            benefitContentDiv.innerHTML = '<p class="text-red-500">Failed to retrieve benefit information. Please try again.</p>';
        }
    } catch (error) {
        console.error('Error generating benefit:', error);
        benefitContentDiv.innerHTML = '<p class="text-red-500">An error occurred while fetching benefit information. Please check your network connection.</p>';
    } finally {
        benefitLoader.style.display = 'none'; // Hide loader
    }
}

// Helper function to format plain text with newlines into HTML paragraphs
function formatTextAsHtml(text) {
    // Replace double newlines with paragraph tags
    let formattedText = text.replace(/\n\n/g, '</p><p>');
    // Replace single newlines with <br> for line breaks within paragraphs
    formattedText = formattedText.replace(/\n/g, '<br>');
    // Wrap the whole thing in a paragraph if it's not already
    if (!formattedText.startsWith('<p>') && !formattedText.startsWith('<h')) {
        formattedText = '<p>' + formattedText + '</p>';
    }
    // Basic markdown-like formatting for headings and lists
    formattedText = formattedText.replace(/### (.*)/g, '<h3>$1</h3>');
    formattedText = formattedText.replace(/## (.*)/g, '<h2>$1</h2>');
    formattedText = formattedText.replace(/# (.*)/g, '<h1>$1</h1>');
    formattedText = formattedText.replace(/\* (.*)/g, '<li>$1</li>'); // For unordered lists
    return formattedText;
}