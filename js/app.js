// NextGen Library Hub - Complete Frontend Solution
class LibrarySystem {
    constructor() {
        this.books = JSON.parse(localStorage.getItem('nextgenLibraryBooks')) || [];
        this.init();
    }

    init() {
        // Load books and check overdue status
        this.checkOverdueBooks();
        this.renderBooks();
        
        // Setup event listeners
        document.getElementById('search-input').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') this.searchBooks();
        });
        
        document.getElementById('status-filter').addEventListener('change', () => {
            this.filterBooks();
        });
        
        document.getElementById('rfid-input').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') this.simulateRFID();
        });
        
        // Import file handler
        document.getElementById('import-file').addEventListener('change', (e) => {
            this.importData(e);
        });
        
        // Check for overdue books daily
        setInterval(() => {
            this.checkOverdueBooks();
            this.renderBooks();
        }, 86400000); // 24 hours
    }

    // Add a new book to the library
    addBook() {
        const title = document.getElementById('book-title').value.trim();
        const author = document.getElementById('book-author').value.trim();
        const isbn = document.getElementById('book-isbn').value.trim();

        if (!title || !author) {
            this.showAlert('Please enter at least title and author', 'warning');
            return;
        }

        const newBook = {
            id: Date.now().toString(),
            title,
            author,
            isbn: isbn || 'N/A',
            status: 'available',
            dueDate: null,
            dateAdded: new Date().toISOString().split('T')[0],
            overdue: false
        };

        this.books.unshift(newBook);
        this.saveToLocalStorage();
        this.renderBooks();
        
        // Clear form
        document.getElementById('book-title').value = '';
        document.getElementById('book-author').value = '';
        document.getElementById('book-isbn').value = '';
        
        this.showAlert(`"${title}" has been added to the library!`, 'success');
    }

    // Edit book details
    editBook(id) {
        const book = this.books.find(book => book.id === id);
        if (!book) return;

        document.getElementById('edit-id').value = book.id;
        document.getElementById('edit-title').value = book.title;
        document.getElementById('edit-author').value = book.author;
        document.getElementById('edit-isbn').value = book.isbn;
        
        document.getElementById('edit-modal').style.display = 'block';
    }

    // Update book after editing
    updateBook() {
        const id = document.getElementById('edit-id').value;
        const title = document.getElementById('edit-title').value.trim();
        const author = document.getElementById('edit-author').value.trim();
        const isbn = document.getElementById('edit-isbn').value.trim();

        if (!title || !author) {
            this.showAlert('Please enter at least title and author', 'warning');
            return;
        }

        const bookIndex = this.books.findIndex(book => book.id === id);
        if (bookIndex !== -1) {
            this.books[bookIndex].title = title;
            this.books[bookIndex].author = author;
            this.books[bookIndex].isbn = isbn || 'N/A';
            
            this.saveToLocalStorage();
            this.renderBooks();
            
            document.getElementById('edit-modal').style.display = 'none';
            this.showAlert('Book details updated successfully!', 'success');
        }
    }

    // Checkout a book
    checkoutBook(id) {
        const book = this.books.find(book => book.id === id);
        if (!book || book.status !== 'available') return;

        if (confirm(`Check out "${book.title}"?`)) {
            book.status = 'checked-out';
            // Set due date 14 days from now
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 14);
            book.dueDate = dueDate.toISOString().split('T')[0];
            book.overdue = false;
            
            this.saveToLocalStorage();
            this.renderBooks();
            this.showAlert(`"${book.title}" has been checked out. Due date: ${book.dueDate}`, 'success');
        }
    }

    // Return a book
    returnBook(id) {
        const book = this.books.find(book => book.id === id);
        if (!book || book.status !== 'checked-out') return;

        if (confirm(`Return "${book.title}"?`)) {
            book.status = 'available';
            book.dueDate = null;
            book.overdue = false;
            
            this.saveToLocalStorage();
            this.renderBooks();
            this.showAlert(`"${book.title}" has been returned. Thank you!`, 'success');
        }
    }

    // Delete a book
    deleteBook(id) {
        const book = this.books.find(book => book.id === id);
        if (!book) return;

        if (confirm(`Permanently delete "${book.title}" from the library?`)) {
            this.books = this.books.filter(book => book.id !== id);
            this.saveToLocalStorage();
            this.renderBooks();
            this.showAlert(`"${book.title}" has been removed from the library.`, 'info');
        }
    }

    // Search books by title, author or ISBN
    searchBooks() {
        const query = document.getElementById('search-input').value.toLowerCase();
        if (!query) {
            this.renderBooks();
            return;
        }

        const results = this.books.filter(book => 
            book.title.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query) ||
            book.isbn.toLowerCase().includes(query)
        );
        
        this.renderBooks(results);
    }

    // Filter books by status
    filterBooks() {
        const status = document.getElementById('status-filter').value;
        if (status === 'all') {
            this.renderBooks();
        } else if (status === 'overdue') {
            const filtered = this.books.filter(book => book.overdue);
            this.renderBooks(filtered);
        } else {
            const filtered = this.books.filter(book => book.status === status);
            this.renderBooks(filtered);
        }
    }

    // Simulate RFID scanning
    simulateRFID() {
        const isbn = document.getElementById('rfid-input').value.trim();
        if (!isbn) {
            this.showAlert('Please enter an ISBN to scan', 'warning');
            return;
        }

        // Add scanning animation
        const scannerBtn = document.querySelector('.rfid-simulator button');
        scannerBtn.classList.add('scan-animation');
        setTimeout(() => scannerBtn.classList.remove('scan-animation'), 1000);

        const book = this.books.find(book => book.isbn === isbn);
        if (book) {
            // Scroll to the book in the list
            const bookElement = document.querySelector(`[data-id="${book.id}"]`);
            if (bookElement) {
                bookElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                bookElement.classList.add('highlight');
                setTimeout(() => bookElement.classList.remove('highlight'), 2000);
            }
            
            // Show book info
            let statusMsg = book.status === 'available' 
                ? 'Available for checkout' 
                : `Checked Out (Due: ${book.dueDate})`;
            
            if (book.overdue) {
                statusMsg += ' - OVERDUE!';
            }
            
            this.showAlert(
                `RFID Scan Result:<br><br>
                <strong>Title:</strong> ${book.title}<br>
                <strong>Author:</strong> ${book.author}<br>
                <strong>Status:</strong> ${statusMsg}`,
                'info',
                5000
            );
        } else {
            this.showAlert('No book found with that ISBN/RFID tag', 'danger');
        }
        
        document.getElementById('rfid-input').value = '';
    }

    // Check for overdue books
    checkOverdueBooks() {
        const today = new Date().toISOString().split('T')[0];
        let overdueCount = 0;
        
        this.books.forEach(book => {
            if (book.status === 'checked-out' && book.dueDate && book.dueDate < today) {
                book.overdue = true;
                overdueCount++;
            } else {
                book.overdue = false;
            }
        });
        
        if (overdueCount > 0) {
            console.log(`Found ${overdueCount} overdue books`);
        }
        
        this.saveToLocalStorage();
    }

    // Get simple recommendations
    getRecommendations() {
        if (this.books.length < 3) return [];
        
        // Simple logic: recommend books from same author or popular ones
        const lastCheckedOut = this.books
            .filter(b => b.status === 'checked-out')
            .slice(0, 3);
            
        if (lastCheckedOut.length === 0) return [];
        
        const authors = [...new Set(lastCheckedOut.map(b => b.author))];
        return this.books
            .filter(b => 
                (authors.includes(b.author) || 
                (b.status === 'available' && !lastCheckedOut.some(lc => lc.id === b.id)))
            )
            .slice(0, 5);
    }

    // Export library data
    exportData() {
        const data = JSON.stringify(this.books, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `nextgen-library-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        this.showAlert('Library data exported successfully!', 'success');
    }

    // Import library data
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedBooks = JSON.parse(e.target.result);
                if (!Array.isArray(importedBooks)) {
                    throw new Error('Invalid data format');
                }
                
                if (confirm(`Import ${importedBooks.length} books? This will replace current data.`)) {
                    this.books = importedBooks;
                    this.checkOverdueBooks();
                    this.saveToLocalStorage();
                    this.renderBooks();
                    this.showAlert('Library data imported successfully!', 'success');
                }
            } catch (error) {
                this.showAlert('Invalid file format. Please import a valid JSON backup.', 'danger');
                console.error('Import error:', error);
            }
            
            // Reset file input
            event.target.value = '';
        };
        reader.readAsText(file);
    }

    // Save books to localStorage
    saveToLocalStorage() {
        localStorage.setItem('nextgenLibraryBooks', JSON.stringify(this.books));
    }

    // Render books to the page
    renderBooks(booksToRender = this.books) {
        const bookList = document.getElementById('book-list');
        bookList.innerHTML = '';

        if (booksToRender.length === 0) {
            bookList.innerHTML = '<p class="no-books">No books found matching your criteria.</p>';
            document.getElementById('book-counter').textContent = '0 books found';
            return;
        }

        booksToRender.forEach(book => {
            const bookElement = document.createElement('div');
            bookElement.className = 'book-card';
            bookElement.dataset.id = book.id;
            
            let statusClass = `status-${book.status.replace('-', '')}`;
            if (book.overdue) statusClass = 'status-overdue';
            
            bookElement.innerHTML = `
                <h3>${book.title}</h3>
                <p class="book-meta">By ${book.author}</p>
                ${book.isbn !== 'N/A' ? `<p class="book-meta">ISBN: ${book.isbn}</p>` : ''}
                <div class="book-status ${statusClass}">
                    ${book.status === 'available' ? 'Available' : 'Checked Out'}
                    ${book.overdue ? ' - OVERDUE!' : ''}
                </div>
                ${book.dueDate ? `<div class="due-date">Due: ${book.dueDate}</div>` : ''}
                <div class="book-actions">
                    <button class="edit-btn" onclick="library.editBook('${book.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${book.status === 'available' ? 
                        `<button class="checkout-btn" onclick="library.checkoutBook('${book.id}')" title="Check Out">
                            <i class="fas fa-bookmark"></i>
                        </button>` : 
                        `<button class="return-btn" onclick="library.returnBook('${book.id}')" title="Return">
                            <i class="fas fa-undo"></i>
                        </button>`}
                    <button class="delete-btn" onclick="library.deleteBook('${book.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            bookList.appendChild(bookElement);
        });

        document.getElementById('book-counter').textContent = 
            `${booksToRender.length} ${booksToRender.length === 1 ? 'book' : 'books'} found`;
            
        this.renderRecommendations();
    }

    // Render recommendations
    renderRecommendations() {
        const recommendations = this.getRecommendations();
        const container = document.getElementById('recommendations');
        
        if (recommendations.length === 0) {
            container.innerHTML = '';
            return;
        }
        
        container.innerHTML = `
            <div class="recommendations">
                <h3><i class="fas fa-lightbulb"></i> Recommended For You</h3>
                ${recommendations.map(book => `
                    <div class="rec-book" onclick="library.simulateRFIDScan('${book.isbn}')">
                        <strong>${book.title}</strong> by ${book.author}
                        ${book.isbn !== 'N/A' ? `<small>(ISBN: ${book.isbn})</small>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Show alert message
    showAlert(message, type = 'info', duration = 3000) {
        // Remove existing alert if any
        const existingAlert = document.querySelector('.custom-alert');
        if (existingAlert) existingAlert.remove();
        
        const alert = document.createElement('div');
        alert.className = `custom-alert alert-${type}`;
        alert.innerHTML = `
            <div class="alert-content">
                <i class="fas fa-${this.getAlertIcon(type)}"></i>
                <div>${message}</div>
            </div>
        `;
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.classList.add('fade-out');
            setTimeout(() => alert.remove(), 500);
        }, duration);
    }

    getAlertIcon(type) {
        const icons = {
            'success': 'check-circle',
            'danger': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Initialize the library system when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Create library instance
    window.library = new LibrarySystem();
});

// Global functions for HTML onclick handlers
function addBook() { library.addBook(); }
function searchBooks() { library.searchBooks(); }
function simulateRFID() { library.simulateRFID(); }
function updateBook() { library.updateBook(); }
function exportData() { library.exportData(); }

// Add some basic styling for alerts
const alertStyles = document.createElement('style');
alertStyles.textContent = `
.custom-alert {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    max-width: 400px;
    transform: translateY(20px);
    opacity: 0;
    animation: alertFadeIn 0.3s forwards;
    display: flex;
    align-items: center;
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255,255,255,0.1);
}

.alert-success {
    background-color: rgba(52, 168, 83, 0.2);
    color: white;
    border-left: 4px solid #34a853;
}

.alert-danger {
    background-color: rgba(234, 67, 53, 0.2);
    color: white;
    border-left: 4px solid #ea4335;
}

.alert-warning {
    background-color: rgba(251, 188, 5, 0.2);
    color: white;
    border-left: 4px solid #fbbc05;
}

.alert-info {
    background-color: rgba(66, 133, 244, 0.2);
    color: white;
    border-left: 4px solid #4285f4;
}

.alert-content {
    display: flex;
    align-items: flex-start;
    gap: 10px;
}

.alert-content i {
    font-size: 1.2rem;
    margin-top: 2px;
}

.fade-out {
    animation: alertFadeOut 0.5s forwards;
}

@keyframes alertFadeIn {
    to { transform: translateY(0); opacity: 1; }
}

@keyframes alertFadeOut {
    to { transform: translateY(20px); opacity: 0; }
}
`;
document.head.appendChild(alertStyles);