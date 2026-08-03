// cv-library.js
// Dynamic CV library list with a modifiable array and simple API.

(function () {
  const tbody = document.getElementById('library-tbody');

  // Updated array with documentType added to match your 6 HTML columns
  let library = [
    { id: 1, name: 'Ahmed Tarek', filename: 'cv_ahmed_tarek.pdf', documentType: 'PDF', status: 'Done', date: '12/01/2026', cvLink: '#' },
    { id: 2, name: 'Mohamed Ahmed', filename: 'cv_mohamed_ahmed.pdf', documentType: 'PDF', status: 'Review', date: '12/01/2026', cvLink: '#' },
    { id: 3, name: 'Aly Mohamed', filename: 'cv_aly_mohamed.pdf', documentType: 'PDF', status: 'Accepted', date: '12/01/2026', cvLink: '#' },
  ];

  function render() {
    if (!tbody) return;
    tbody.innerHTML = '';

    library.forEach((c) => {
      const tr = document.createElement('tr');

      // Now generating 6 <td> elements to match the 6 <th> elements
      tr.innerHTML = `
        <td>${escapeHtml(c.name)}</td>
        <td>${escapeHtml(c.filename)}</td>
        <td><strong>${escapeHtml(c.documentType)}</strong></td>
        <td><span class="badge ${statusClass(c.status)}">${escapeHtml(c.status)}</span></td>
        <td>${escapeHtml(c.date)}</td>
        <td class="actions"></td>
      `;

      const actionsTd = tr.querySelector('.actions');

      // CV button
      const cvBtn = createBtn('cv', 'fa-up-right-from-square', 'CV', () => {
        if (c.cvLink) window.open(c.cvLink, '_blank');
      });
      actionsTd.appendChild(cvBtn);

      // Delete button
      const deleteBtn = createBtn('delete', 'fa-trash', 'Delete', () => {
        // Simple delete logic to remove from array and re-render
        library = library.filter(item => item.id !== c.id);
        render();
      });
      actionsTd.appendChild(deleteBtn);

      tbody.appendChild(tr);
    });
  }

  function createBtn(cls, icon, text, onClick) {
    const btn = document.createElement('button');
    btn.className = `btn ${cls}`;
    btn.innerHTML = `<i class="fa-solid ${icon}"></i> ${text}`;
    btn.addEventListener('click', onClick);
    return btn;
  }

  function statusClass(status) {
    const map = {
      Review: 'review',
      Accepted: 'accepted',
      Rejected: 'rejected',
      Done: 'done',
    };
    return map[status] || 'status';
  }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str).replace(/[&<>"']/g, function (s) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[s];
    });
  }

  // Sorting state and helpers
  const sortState = { index: null, direction: 'asc' };

  function compareByIndex(a, b, index) {
    switch (index) {
      case 0: // name
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      case 1: // filename
        return a.filename.localeCompare(b.filename, undefined, { sensitivity: 'base' });
      case 2: // document type
        return a.documentType.localeCompare(b.documentType, undefined, { sensitivity: 'base' });
      case 3: // status
        return a.status.localeCompare(b.status, undefined, { sensitivity: 'base' });
      case 4: // date  
        return a.date.localeCompare(b.date, undefined, { sensitivity: 'base' });
      default:
        return 0;
    }
  }

  function updateSortIcons(selectedIndex, direction) {
    const ths = document.querySelectorAll('table thead th');
    ths.forEach((th, i) => {
      const icon = th.querySelector('i');
      if (!icon) return;
      icon.classList.remove('fa-chevron-up', 'fa-chevron-down');
      if (i === selectedIndex) {
        icon.classList.add(direction === 'asc' ? 'fa-chevron-up' : 'fa-chevron-down');
        th.classList.add('sorted');
      } else {
        icon.classList.add('fa-chevron-down');
        th.classList.remove('sorted');
      }
    });
  }

  function sortByColumn(index) {
    if (sortState.index === index) {
      sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
      sortState.index = index;
      sortState.direction = 'asc';
    }

    // FIXED: changed candidates.sort to library.sort
    library.sort((a, b) => {
      const res = compareByIndex(a, b, index);
      return sortState.direction === 'asc' ? res : -res;
    });

    updateSortIcons(sortState.index, sortState.direction);
    render();
  }

  function attachSortHandlers() {
    const ths = document.querySelectorAll('table thead th');
    ths.forEach((th, i) => {
      const icon = th.querySelector('i');
      if (!icon) return;
      icon.style.cursor = 'pointer';
      icon.addEventListener('click', (e) => {
        e.preventDefault();
        sortByColumn(i);
      });
    });
  }

  function init() {
    attachSortHandlers();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();