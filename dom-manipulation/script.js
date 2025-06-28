// Array of quote objects
let quotes = [];
let selectedCategory = 'all';

const SERVER_API_URL = 'https://jsonplaceholder.typicode.com/posts'; // Simulated endpoint
let syncInterval = null;
let lastServerSync = null;

// Load quotes from localStorage if available
function loadQuotes() {
  const stored = localStorage.getItem('quotes');
  if (stored) {
    try {
      quotes = JSON.parse(stored);
    } catch (e) {
      quotes = [];
    }
  } else {
    // Default quotes if nothing in storage
    quotes = [
      { text: "The only way to do great work is to love what you do.", category: "Motivation" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" },
      { text: "Success is not in what you have, but who you are.", category: "Success" }
    ];
  }
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Populate categories in the dropdown
function populateCategories() {
  const categorySet = new Set(quotes.map(q => q.category));
  const filter = document.getElementById('categoryFilter');
  const lastSelected = localStorage.getItem('lastCategoryFilter') || 'all';
  filter.innerHTML = '<option value="all">All Categories</option>';
  categorySet.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    filter.appendChild(option);
  });
  selectedCategory = lastSelected;
  filter.value = selectedCategory;
}

// Show a random quote, optionally filtered by category
function showRandomQuote(category = null) {
  const quoteDisplay = document.getElementById('quoteDisplay');
  let filterCat = category !== null ? category : selectedCategory;
  let filteredQuotes = quotes;
  if (filterCat && filterCat !== 'all') {
    filteredQuotes = quotes.filter(q => q.category === filterCat);
  }
  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = '<em>No quotes found for this category.</em>';
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.innerHTML = `
    <blockquote>${quote.text}</blockquote>
    <p><em>Category: ${quote.category}</em></p>
  `;
  // Save last viewed quote index in sessionStorage
  sessionStorage.setItem('lastViewedQuote', quotes.indexOf(quote));
}

// Filter quotes based on selected category
function filterQuotes() {
  const filter = document.getElementById('categoryFilter');
  selectedCategory = filter.value;
  localStorage.setItem('lastCategoryFilter', selectedCategory);
  showRandomQuote(selectedCategory);
}

// Function to create the Add Quote form dynamically
function createAddQuoteForm() {
  const formDiv = document.createElement('div');
  formDiv.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuoteBtn">Add Quote</button>
  `;
  document.body.appendChild(formDiv);

  // Add event listener for the Add Quote button
  document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
}

// Function to add a new quote
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    textInput.value = '';
    categoryInput.value = '';
    populateCategories();
    // If new category, auto-select it
    if (selectedCategory !== category) {
      selectedCategory = category;
      document.getElementById('categoryFilter').value = category;
      localStorage.setItem('lastCategoryFilter', selectedCategory);
    }
    filterQuotes();
  } else {
    alert('Please enter both a quote and a category.');
  }
}

// Export quotes as JSON file
function exportQuotesToJson() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert('Quotes imported successfully!');
      } else {
        alert('Invalid JSON format.');
      }
    } catch (e) {
      alert('Error reading JSON file.');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Fetch quotes from the server (simulate)
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_API_URL);
    if (!response.ok) throw new Error('Server error');
    // Simulate server quotes as an array of objects with text and category
    const serverData = await response.json();
    // We'll use the first 10 posts as quotes for simulation
    const serverQuotes = serverData.slice(0, 10).map(post => ({
      text: post.title,
      category: 'Server'
    }));
    return serverQuotes;
  } catch (e) {
    console.error('Failed to fetch from server:', e);
    return [];
  }
}

// Post a new quote to the server (simulate)
async function postQuoteToServer(quote) {
  try {
    await fetch(SERVER_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quote)
    });
  } catch (e) {
    console.error('Failed to post to server:', e);
  }
}

// Sync local quotes with server
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  if (!serverQuotes.length) return;
  // Conflict resolution: server wins
  let localChanged = false;
  const localQuotesStr = JSON.stringify(quotes);
  const serverQuotesStr = JSON.stringify(serverQuotes);
  if (localQuotesStr !== serverQuotesStr) {
    quotes = serverQuotes;
    saveQuotes();
    populateCategories();
    filterQuotes();
    showNotification('Quotes updated from server. Server data took precedence.');
    localChanged = true;
  } else {
    showNotification('Quotes synced with server!');
  }
  lastServerSync = Date.now();
  return localChanged;
}

// Notification UI
function showNotification(message) {
  let notif = document.getElementById('serverNotification');
  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'serverNotification';
    notif.style.position = 'fixed';
    notif.style.top = '10px';
    notif.style.right = '10px';
    notif.style.background = '#ffd700';
    notif.style.padding = '10px 20px';
    notif.style.border = '1px solid #888';
    notif.style.zIndex = 1000;
    notif.style.borderRadius = '5px';
    document.body.appendChild(notif);
  }
  notif.textContent = message + ' '; // Clear previous
  // Add manual resolve button
  const btn = document.createElement('button');
  btn.textContent = 'Manual Resolve';
  btn.onclick = manualResolveConflict;
  notif.appendChild(btn);
  setTimeout(() => {
    if (notif.parentNode) notif.parentNode.removeChild(notif);
  }, 8000);
}

// Manual conflict resolution UI (simple: alert with choice)
function manualResolveConflict() {
  if (confirm('Keep local quotes instead of server data?')) {
    saveQuotes();
    showNotification('Local quotes kept.');
  } else {
    syncQuotes();
  }
}

// Start periodic sync
function startServerSync() {
  if (syncInterval) clearInterval(syncInterval);
  syncInterval = setInterval(syncQuotes, 30000); // 30 seconds
}

// Set up event listeners and initial UI
document.addEventListener('DOMContentLoaded', function() {
  loadQuotes();
  populateCategories();
  filterQuotes();
  document.getElementById('newQuote').addEventListener('click', function() {
    showRandomQuote();
  });
  createAddQuoteForm();
  document.getElementById('exportQuotes').addEventListener('click', exportQuotesToJson);
  document.getElementById('importFile').addEventListener('change', importFromJsonFile);
  // Initial sync and start periodic sync
  syncQuotes();
  startServerSync();
});