const books = []
const RENDER_EVENT = 'render-book';
const STORAGE_KEY = 'BOOKS_APP';
const SAVED_EVENT = 'saved-book';


function generateId() {
    return +new Date()
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete,
    }
}

//cek apakah local storage compatible dengan browser yang di gunakan
function isStorageExist() { // boolean
    if (typeof Storage === undefined) {
        alert('Mohon Maaf Browser yang kamu pakai tidak mendukung local Storage')
        return false
    }
    return true
}

function saveBook() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books)
        localStorage.setItem(STORAGE_KEY, parsed)
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function loadDataFromStorage() {
    const serializedData /* string */ = localStorage.getItem(STORAGE_KEY);
    let dataBooks = JSON.parse(serializedData);

    if (dataBooks !== null) {
        for (const book of dataBooks) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function findBook(bookId) {
    for (const bookItem of books) {
        // mengecek jika bookItem yang ada di dalam book sama dengan parameter bookId maka ...
        if (bookItem.id === bookId) {
            return bookItem
        }
    }
    return null
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id == bookId) { // jika indeks book.id sama dengan param bookId akan return value index nya
            return index
        }
    }
    // jika tidak ada akan return -1 
    return -1
}

//addReadComplete
function addReadComplete(id) {
    const bookTarget = findBook(id)
    if (bookTarget == null) return;
    bookTarget.isComplete = true;
    // melakukan render ulang dan juga menjalankan saveBook agar data yang di localStorage juga terupdate
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveBook()
}

// undoReadComplete
function undoReadComplete(id) {
    // rubah status isComplete menjadi false agar masuk lagi ke dalam belum selesai di baca
    const bookTarget = findBook(id)
    if (bookTarget == null) return;

    bookTarget.isComplete = false
    // melakukan render ulang dan juga menjalankan saveBook agar data yang di localStorage juga terupdate
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveBook()
}

// handleDeleteBook
function handleDeleteBook(bookId) {
    const bookTarget = findBookIndex(bookId)
    if (bookTarget == -1) return;

    books.splice(bookTarget, 1) // menghapus splice(index ke, jumlah yang di hapus)
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveBook()
}

// membuat element untuk menampung book
function makeBook(bookObj) {
    const { id, title, author, year, isComplete } = bookObj

    const textTitle = document.createElement('h3')
    textTitle.innerText = title
    const textAuthor = document.createElement('p')
    textAuthor.innerText = author
    const textYear = document.createElement('p')
    textYear.innerText = year

    const statsAction = document.createElement('div')
    statsAction.classList.add('action')
    // button di dalam div
    const finishedReading = document.createElement('button')
    finishedReading.classList.add('green')
    const deleteBook = document.createElement('button')
    deleteBook.innerText = 'Hapus buku'
    deleteBook.classList.add('red')
    statsAction.append(finishedReading, deleteBook)

    const article = document.createElement('article')
    article.classList.add('book_item');
    article.append(textTitle, textAuthor, textYear, statsAction)
    // memberikan attribute id dengan value book-id <- ini berguna untuk mengetahui element tersebut jika di lakukan action nantinya
    article.setAttribute('id', `book-${id}`);

    // Mendapatkan elemen modal dan tombol-tombol di dalam modal di luar event listener makeBook
    const modal = document.getElementById('deleteModal');
    const confirmButton = document.getElementById('confirmDelete');
    const cancelButton = document.getElementById('cancelDelete');

    // Dalam fungsi makeBook, saat tombol "Hapus buku" diklik
    deleteBook.addEventListener('click', () => {
        modal.style.display = 'flex';

        // Tambahkan event listener untuk tombol "Ya" di modal
        confirmButton.addEventListener('click', () => {
            // Lakukan penghapusan buku di sini
            handleDeleteBook(id);
            // Tutup modal setelah penghapusan selesai
            modal.style.display = 'none';
        });

        // Tambahkan event listener untuk tombol "Tidak" di modal
        cancelButton.addEventListener('click', () => {
            // Tutup modal tanpa melakukan penghapusan
            modal.style.display = 'none';
        });
    });


    if (isComplete) {
        finishedReading.innerText = 'Belum selesai di Baca'
        finishedReading.addEventListener('click', () => {
            undoReadComplete(id)
        })
    } else {
        finishedReading.innerText = 'Selesai dibaca'
        finishedReading.addEventListener('click', () => {
            addReadComplete(id)
        })
    }
    return article
}


function addBook() {
    const inputBookTitle = document.getElementById('inputBookTitle').value
    const inputBookAuthor = document.getElementById('inputBookAuthor').value
    const inputBookYear = document.getElementById('inputBookYear').value
    const inputBookIsComplete = document.getElementById('inputBookIsComplete').checked
    const parsingYear = parseInt(inputBookYear)

    const generateID = generateId()
    // memasukan value ke dalam function generateBookObject
    const bookObject = generateBookObject(generateID, inputBookTitle, inputBookAuthor, parsingYear, inputBookIsComplete)
    books.push(bookObject)

    // memanggil custom event untuk di render ulang
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook()
}

//fungsi searchBook
function searchBook(title) {
    title = title.toLowerCase(); // Mengonversi judul pencarian ke huruf kecil agar pencarian menjadi case-insensitive
    const searchResults = books.filter(book => book.title.toLowerCase().includes(title));

    return searchResults;
}


document.addEventListener('DOMContentLoaded', function () {
    const inputBookTitle = document.getElementById('inputBookTitle');
    const inputBookAuthor = document.getElementById('inputBookAuthor');
    const inputBookYear = document.getElementById('inputBookYear');
    const inputBookIsComplete = document.getElementById('inputBookIsComplete');

    const formSearch = document.getElementById('searchBook');
    const inputSearch = document.getElementById('searchBookTitle');

    formSearch.addEventListener('submit', function (event) {
        event.preventDefault();
        const searchTerm = inputSearch.value.trim(); // trim untuk menghilankgan spasi di awal dan akhir kata
        if (searchTerm !== '') {
            const results = searchBook(searchTerm);
            renderSearchResults(results);
        } else {
            // Jika input pencarian kosong, render data buku tidak selesai dan selesai seperti biasa.
            document.dispatchEvent(new Event(RENDER_EVENT));
        }
    });

    // fungsi untuk menampilkan sesuai judul yang di cari
    function renderSearchResults(results) {
        const uncompleteBookshelfList = document.getElementById('uncompleteBookshelfList');
        const completeBookshelfList = document.getElementById('completeBookshelfList');

        uncompleteBookshelfList.innerHTML = '';
        completeBookshelfList.innerHTML = '';

        results.forEach(result => {
            const resultElement = makeBook(result);
            if (result.isComplete) {
                completeBookshelfList.appendChild(resultElement);
            } else {
                uncompleteBookshelfList.appendChild(resultElement);
            }
        });
    }
    // buat handler submit
    const submitForm = document.getElementById('inputBook')
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault()
        addBook()
        // Setel nilai input ke kosong
        inputBookTitle.value = '';
        inputBookAuthor.value = '';
        inputBookYear.value = '';
        inputBookIsComplete.checked = false;
    })

    if (isStorageExist()) {
        loadDataFromStorage();
    }
})


// menambahkan event listener render event
document.addEventListener(RENDER_EVENT, () => {
    const uncompleteBookshelfList = document.getElementById('uncompleteBookshelfList')
    const completeBookshelfList = document.getElementById('completeBookshelfList')

    // clearing list item
    uncompleteBookshelfList.innerHTML = '';
    completeBookshelfList.innerHTML = '';

    // menampilkan value yang ada di dalam book dan di tamppilkan ke dalam element unComplete/completed
    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (bookItem.isComplete) {
            completeBookshelfList.append(bookElement)
        } else {
            uncompleteBookshelfList.append(bookElement)
        }
    }
})
