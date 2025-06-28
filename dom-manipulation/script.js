// Array of quote objects
let quotes = [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not in what you have, but who you are.", category: "Success" }
];

// Function to display a random quote
function showRandomQuote() {
  const quoteDisplay = document.getElementById('quoteDisplay');
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.innerHTML = `
    <blockquote>${quote.text}</blockquote>
    <p><em>Category: ${quote.category}</em></p>
  `;
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
    textInput.value = '';
    categoryInput.value = '';
    showRandomQuote();
  } else {
    alert('Please enter both a quote and a category.');
  }
}

// Set up event listeners and initial UI
document.addEventListener('DOMContentLoaded', function() {
  showRandomQuote();
  document.getElementById('newQuote').addEventListener('click', showRandomQuote);
  createAddQuoteForm();
});