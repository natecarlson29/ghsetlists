// Nate's GH Hub - Application Logic

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const songList = document.getElementById('song-list');
    const songCount = document.getElementById('song-count');
    const filterButtons = document.getElementById('filter-buttons');
    const sortSelect = document.getElementById('sort-select');

    // Current state
    let currentGameFilter = 'ALL';
    let currentSort = 'artist';

    // Render songs to the DOM
    function renderSongs(songsToRender) {
        if (songsToRender.length === 0) {
            songList.innerHTML = `
                <div class="no-results">
                    <h3>No Songs Found</h3>
                    <p>Try a different search term or filter</p>
                </div>
            `;
            songCount.textContent = '0 songs';
            return;
        }

        songList.innerHTML = songsToRender.map(song => `
            <div class="song-row" data-game="${song.game}">
                <div class="song-badge">
                    <span class="badge badge-${song.game.toLowerCase()}">${song.game}</span>
                </div>
                <div class="song-info">
                    <div class="song-title">${escapeHtml(song.title)}</div>
                    <div class="song-artist">${escapeHtml(song.artist)}</div>
                </div>
            </div>
        `).join('');

        songCount.textContent = `${songsToRender.length} song${songsToRender.length !== 1 ? 's' : ''}`;
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Filter songs based on search query
    function filterBySearch(songsArray, query) {
        const searchTerm = query.toLowerCase().trim();

        if (!searchTerm) {
            return songsArray;
        }

        return songsArray.filter(song => {
            const titleMatch = song.title.toLowerCase().includes(searchTerm);
            const artistMatch = song.artist.toLowerCase().includes(searchTerm);
            const gameMatch = song.game.toLowerCase().includes(searchTerm);

            // Also match full game names
            const gameNames = {
                'gh': ['guitar hero', 'guitarhero'],
                'rb': ['rock band', 'rockband'],
                'rb2': ['rock band 2', 'rockband2', 'rock band ii'],
                'gh2': ['guitar hero 2', 'guitar hero ii', 'guitarhero2'],
                'gh3': ['guitar hero 3', 'guitar hero iii', 'guitarhero3', 'legends of rock'],
                'ghwt': ['guitar hero world tour', 'world tour', 'guitarheroworld']
            };

            let fullGameMatch = false;
            const gameLower = song.game.toLowerCase();
            if (gameNames[gameLower]) {
                fullGameMatch = gameNames[gameLower].some(name => name.includes(searchTerm) || searchTerm.includes(name));
            }

            return titleMatch || artistMatch || gameMatch || fullGameMatch;
        });
    }

    // Filter songs by game
    function filterByGame(songsArray, game) {
        if (game === 'ALL') {
            return songsArray;
        }
        return songsArray.filter(song => song.game === game);
    }

    // Sort songs
    function sortSongs(songsArray, sortBy) {
        return [...songsArray].sort((a, b) => {
            if (sortBy === 'artist') {
                // Sort by artist, then by title
                const artistCompare = a.artist.localeCompare(b.artist);
                if (artistCompare !== 0) return artistCompare;
                return a.title.localeCompare(b.title);
            } else {
                // Sort by title, then by artist
                const titleCompare = a.title.localeCompare(b.title);
                if (titleCompare !== 0) return titleCompare;
                return a.artist.localeCompare(b.artist);
            }
        });
    }

    // Apply all filters and sorting, then render
    function updateDisplay() {
        let result = [...songs];

        // Apply game filter
        result = filterByGame(result, currentGameFilter);

        // Apply search filter
        result = filterBySearch(result, searchInput.value);

        // Apply sorting
        result = sortSongs(result, currentSort);

        renderSongs(result);
    }

    // Handle filter button clicks
    filterButtons.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            // Remove active class from all buttons
            filterButtons.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // Add active class to clicked button
            e.target.classList.add('active');

            // Update current filter
            currentGameFilter = e.target.dataset.game;

            // Update display
            updateDisplay();
        }
    });

    // Handle sort select change
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        updateDisplay();
    });

    // Handle search input
    searchInput.addEventListener('input', () => {
        updateDisplay();
    });

    // Initial render
    updateDisplay();

    // Focus search on page load
    searchInput.focus();
});
