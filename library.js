const books = [
  { title:'Great Expectations', author:'Charles Dickens', pages:296, file:'great-expectations', year:'1861' },
  { title:'War and Peace', author:'Leo Tolstoy', pages:1016, file:'war-and-peace', year:'1869' },
  { title:'The Odyssey', author:'Homer', pages:177, file:'the-odyssey', year:'c. 700 BC' },
  { title:'The Brothers Karamazov', author:'Fyodor Dostoyevsky', pages:533, file:'the-brothers-karamazov', year:'1880' },
  { title:'The Old Man and the Sea', author:'Ernest Hemingway', pages:138, file:'the-old-man-and-the-sea', year:'1952' },
  { title:'Don Quixote', author:'Miguel de Cervantes', pages:900, file:'don-quixote', year:'1605' },
  { title:'The Trial', author:'Franz Kafka', pages:254, file:'the-trial', year:'1925' },
  { title:'Pride and Prejudice', author:'Jane Austen', pages:262, file:'pride-and-prejudice', year:'1813' }
];

const grid = document.querySelector('#bookGrid');
const search = document.querySelector('#searchInput');
const sort = document.querySelector('#sortSelect');

function render() {
  const term = search.value.trim().toLowerCase();
  let visible = books.filter(book => `${book.title} ${book.author}`.toLowerCase().includes(term));
  if (sort.value === 'title') visible.sort((a,b) => a.title.localeCompare(b.title));
  if (sort.value === 'author') visible.sort((a,b) => a.author.localeCompare(b.author));
  if (sort.value === 'pages') visible.sort((a,b) => a.pages-b.pages);
  grid.innerHTML = visible.map(book => {
    const n = String(books.indexOf(book)+1).padStart(2,'0');
    return `<article class="book-card">
      <a class="cover-link" href="assets/books/${book.file}.pdf" target="_blank" aria-label="Open ${book.title} by ${book.author}">
        <img src="assets/covers/${book.file}.jpg" alt="Cover of ${book.title}">
        <span class="cover-overlay"><span>OPEN BOOK</span><span>↗</span></span>
      </a>
      <div class="book-info"><span class="book-index">${n} · ${book.year}</span><h3>${book.title}</h3><p><span>${book.author}</span><span>${book.pages.toLocaleString()} pages</span></p></div>
    </article>`;
  }).join('');
  document.querySelector('#emptyState').hidden = visible.length > 0;
}

document.querySelector('#searchToggle').addEventListener('click', () => {
  document.querySelector('#searchBox').classList.toggle('open');
  search.focus();
});
search.addEventListener('input', render);
sort.addEventListener('change', render);
render();
