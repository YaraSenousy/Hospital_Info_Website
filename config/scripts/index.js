document.addEventListener('DOMContentLoaded', function() {
    console.log("Script loaded");
    
    const searchForm = document.querySelector('form[role="search"]');
    console.log("Search form found:", searchForm);
    
    searchForm.addEventListener('submit', function(e) {
        console.log("Search submitted");
        e.preventDefault();
        
        const searchInput = this.querySelector('input[type="search"]');
        const searchTerm = searchInput.value.toLowerCase().trim();
        console.log("Search term:", searchTerm);
        
        if (!searchTerm) {
            // If search is empty, show everything
            resetSearch();
            return;
        }

        // Get all text nodes in the body (excluding scripts and styles)
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // Skip script and style tags
                    if (node.parentElement.tagName === 'SCRIPT' || 
                        node.parentElement.tagName === 'STYLE' ||
                        node.parentElement.tagName === 'NOSCRIPT') {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        let found = false;
        let node;
        
        // Reset previous search
        resetSearch();

        // Search through all text nodes
        while (node = walker.nextNode()) {
            const text = node.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                found = true;
                highlightText(node, searchTerm);
                scrollToFirstMatch();
            }
        }

        if (!found) {
            alert('No matches found');
        }
    });

    // Get all nav links
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Add click handler to each link
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // If this is a dropdown item, also activate its parent
            if (this.closest('.dropdown-menu')) {
                const parentDropdown = this.closest('.dropdown').querySelector('.nav-link');
                parentDropdown.classList.add('active');
            }
        });
    });
});

function resetSearch() {
    // Remove all highlights
    const highlights = document.querySelectorAll('mark');
    highlights.forEach(highlight => {
        const parent = highlight.parentNode;
        parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
        parent.normalize();
    });
}

function highlightText(node, searchTerm) {
    const text = node.textContent;
    const regex = new RegExp(searchTerm, 'gi');
    const newText = text.replace(regex, match => `<mark>${match}</mark>`);
    
    const span = document.createElement('span');
    span.innerHTML = newText;
    node.parentNode.replaceChild(span, node);
}

function scrollToFirstMatch() {
    const firstMatch = document.querySelector('mark');
    if (firstMatch) {
        firstMatch.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}
