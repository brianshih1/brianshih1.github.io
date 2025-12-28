(function() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTOC);
  } else {
    initTOC();
  }

  function initTOC() {
    const tocContainer = document.getElementById('floatingTOC');
    const tocList = document.getElementById('tocList');
    
    if (!tocContainer || !tocList) return;

    // Find the post content container
    const postContent = document.querySelector('.post-content') || 
                       document.querySelector('article') || 
                       document.querySelector('main') ||
                       document.body;

    // Extract all headings (h2 through h6)
    const headings = postContent.querySelectorAll('h2, h3, h4, h5, h6');
    
    if (headings.length === 0) {
      tocContainer.classList.add('hidden');
      return;
    }

    // Build nested TOC structure
    let tocItems = [];
    let currentStack = []; // Stack to track current nesting level

    headings.forEach((heading, index) => {
      // Create ID if it doesn't exist
      let id = heading.id;
      if (!id) {
        id = 'heading-' + index;
        heading.id = id;
      }

      const level = parseInt(heading.tagName.charAt(1)); // Get number from H2, H3, etc.
      
      // Create TOC item
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#' + id;
      a.textContent = heading.textContent.trim();
      a.dataset.headingId = id;
      
      // Add class for level
      li.classList.add('toc-level-' + level);
      li.classList.add('toc-item');
      
      li.appendChild(a);
      
      // Handle nesting
      while (currentStack.length > 0 && currentStack[currentStack.length - 1].level >= level) {
        currentStack.pop();
      }
      
      if (currentStack.length === 0) {
        // Top level item
        tocList.appendChild(li);
      } else {
        // Nested item - find or create parent ul
        let parentLi = currentStack[currentStack.length - 1].li;
        let parentUl = parentLi.querySelector('ul');
        if (!parentUl) {
          parentUl = document.createElement('ul');
          parentUl.classList.add('toc-nested');
          parentLi.appendChild(parentUl);
        }
        parentUl.appendChild(li);
      }
      
      currentStack.push({ level: level, li: li });
      
      tocItems.push({
        id: id,
        element: heading,
        link: a,
        level: level
      });
    });

    // Scroll tracking and highlighting
    let currentActive = null;

    function updateActiveHeading() {
      const scrollPos = window.scrollY + 100; // Offset for better UX
      
      // Find the heading that's currently in view
      let activeHeading = null;
      
      for (let i = tocItems.length - 1; i >= 0; i--) {
        const item = tocItems[i];
        const rect = item.element.getBoundingClientRect();
        const elementTop = rect.top + window.scrollY;
        
        if (elementTop <= scrollPos) {
          activeHeading = item;
          break;
        }
      }

      // Update active state
      if (activeHeading && activeHeading !== currentActive) {
        // Remove previous active from all items
        tocItems.forEach(item => {
          item.link.classList.remove('active');
        });
        
        // Add new active
        activeHeading.link.classList.add('active');
        currentActive = activeHeading;
        
        // Scroll TOC to show active item
        const tocRect = tocContainer.getBoundingClientRect();
        const linkRect = activeHeading.link.getBoundingClientRect();
        const linkTop = linkRect.top + tocContainer.scrollTop;
        
        if (linkTop < tocContainer.scrollTop || 
            linkTop + linkRect.height > tocContainer.scrollTop + tocRect.height) {
          tocContainer.scrollTo({
            top: linkTop - tocRect.height / 2 + linkRect.height / 2,
            behavior: 'smooth'
          });
        }
      }
    }

    // Throttle scroll events for performance
    let ticking = false;
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActiveHeading();
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll);
    
    // Initial update
    updateActiveHeading();

    // Handle click events for smooth scrolling
    tocList.addEventListener('click', function(e) {
      if (e.target.tagName === 'A') {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          const offset = 80;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  }
})();

