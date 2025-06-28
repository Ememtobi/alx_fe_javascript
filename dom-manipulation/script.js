// Array of quote objects
let quotes = [];

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
  filter.value = lastSelected;
}

// Show a random quote, optionally filtered by category
function showRandomQuote(category = null) {
  const quoteDisplay = document.getElementById('quoteDisplay');
  let filteredQuotes = quotes;
  if (category && category !== 'all') {
    filteredQuotes = quotes.filter(q => q.category === category);
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
  const selected = filter.value;
  localStorage.setItem('lastCategoryFilter', selected);
  showRandomQuote(selected);
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
    populateCategories(); // Update dropdown if new category
    filterQuotes(); // Show quote from current filter
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

// Set up event listeners and initial UI
document.addEventListener('DOMContentLoaded', function() {
  loadQuotes();
  populateCategories();
  // Show last viewed quote if available in sessionStorage and filter
  const lastSelected = localStorage.getItem('lastCategoryFilter') || 'all';
  filterQuotes();
  document.getElementById('newQuote').addEventListener('click', function() {
    const filter = document.getElementById('categoryFilter');
    showRandomQuote(filter.value);
  });
  createAddQuoteForm();
  document.getElementById('exportQuotes').addEventListener('click', exportQuotesToJson);
  document.getElementById('importFile').addEventListener('change', importFromJsonFile);
});