/*
{
  id: string | number,
  title: string,
  author: string,
  timestamp: number,
  isComplete: boolean,
}
*/
// buat DomContentLoaded terlebih dahulu
const books = []
const RENDER_EVENT = 'render-book';
const STORAGE_KEY = 'BOOKS_APP';
const SAVED_EVENT = 'saved-book';


function generateId() {
    return +new Date()
}

function generateBookObject(id, title, author, timestamp, isComplete) {
    return {
        id,
        title,
        author,
        timestamp,
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

// membuat element untuk menampung book
function makeBook(bookObj) {
    const { id, title, author, timestamp, isComplete } = bookObj

    const textTitle = document.createElement('h3')
    textTitle.innerText = title
    const textAuthor = document.createElement('p')
    textAuthor.innerText = author
    const textTimestamp = document.createElement('p')
    textTimestamp.innerText = timestamp

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
    article.append(textTitle, textAuthor, textTimestamp, statsAction)
    // memberikan attribute id dengan value book-id <- ini berguna untuk mengetahui element tersebut jika di lakukan action nantinya
    article.setAttribute('id', `book-${id}`);

    deleteBook.addEventListener('click', () => {
        handleDeleteBook(id)
    })

    if (isComplete) {
        finishedReading.innerText = 'Belum selesai di Baca'
        finishedReading.addEventListener('click', () => {
            undoReadComplete(id)
        })
    } else {
        finishedReading.innerText = 'Selesai dibaca'
        finishedReading.addEventListener('click', () => {
            // fungsi untuk mengembalikan belum selesai di baca
            addReadComplete(id)
        })
    }
    return article
}

function addBook() {
    const inputBookTitle = document.getElementById('inputBookTitle').value
    const inputBookAuthor = document.getElementById('inputBookAuthor').value
    const inputBookTimestamp = document.getElementById('inputBookYear').value
    const inputBookIsComplete = document.getElementById('inputBookIsComplete').checked

    const generateID = generateId()
    // memasukan value ke dalam function generateBookObject
    const bookObject = generateBookObject(generateID, inputBookTitle, inputBookAuthor, inputBookTimestamp, inputBookIsComplete)
    books.push(bookObject)

    // memanggil custom event untuk di render ulang
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook()
}

document.addEventListener('DOMContentLoaded', function () {
    // buat handler submit
    const submitForm = document.getElementById('inputBook')
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault()
        addBook()
        // console.log(books)
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
