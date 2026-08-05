// cv-list.js
// Dynamic CV list with a modifiable array and simple API.



(function () {
  const tbody = document.getElementById('candidates-tbody');

  function showLibraryMessage(text, type = 'success') {
    let messageEl = document.getElementById('library-message');
    if (!messageEl) {
      messageEl = document.createElement('p');
      messageEl.id = 'library-message';
      messageEl.className = 'library-message';
      messageEl.setAttribute('role', 'status');
      messageEl.setAttribute('aria-live', 'polite');
      tbody?.closest('.dashboard-candidate-table-container')?.prepend(messageEl);
    }

    messageEl.textContent = text;
    messageEl.className = `library-message ${type}`;
  }

  
  

  async function deleteCand(candidateId, accessToken, status) {
  try {
    const response = await fetch(`/api/candidates/${candidateId}/`, {
      method: "DELETE", // Change to PUT if your route uses PUT
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ "status": status }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete candidate");
    }

    return data;
  } catch (error) {
    console.error("Error deleting candidate:", error);
    throw error;
  }

  
  }


  let candidates = [
    { id: 1, name: 'Ahmed Tarek', title: 'Software Developer', experience: '3 Years', city: 'Alexandria, Egypt', match: 95, status: 'Done', cvLink: '#', email: 'ahmed@example.com' },
    { id: 2, name: 'Mohamed Ahmed', title: 'Software Developer', experience: '2 Years', city: 'Cairo, Egypt', match: 83, status: 'Review', cvLink: '#', email: 'mohamed@example.com' },
    { id: 3, name: 'Aly Mohamed', title: 'Software Engineer', experience: '4 Years', city: 'Cairo, Egypt', match: 50, status: 'Accepted', cvLink: '#', email: 'aly@example.com' },
  ];

  let displayedCandidates = [...candidates];

  
  async function deleteCandidate(candidateId, status) {
    const candidate = candidates.find((item) => item.id === candidateId);
    const candidateName = candidate?.name || 'this candidate';

    if (!window.confirm(`Are you sure you want to delete ${candidateName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteCand(candidateId, window.TokenStorage?.get(), status);

      candidates = candidates.filter((candidate) => candidate.id !== candidateId);
      displayedCandidates = displayedCandidates.filter((candidate) => candidate.id !== candidateId);
      render(displayedCandidates);
      showLibraryMessage(`${candidateName} was deleted successfully.`);
    } catch (error) {
      console.error("Unable to update candidate status:", error);
      showLibraryMessage(error.message || 'Unable to delete this candidate. Please try again.', 'error');
    }
  }


  function matchClass(score) {
    if (score >= 90) return 'excellent';
    return 'average';
  }

  function render(data = displayedCandidates) {
    if (!tbody) return;
    tbody.innerHTML = '';

    displayedCandidates = [...data]

    displayedCandidates.forEach((c) => {
      const tr = document.createElement('tr');

      const doctype = c.file_name.slice(c.file_name.lastIndexOf("."));
      console.log(doctype)
      tr.innerHTML = `
        <td>${escapeHtml(c.name)}</td>
        <td>${escapeHtml(c.file_name)}</td>
        <td>${escapeHtml(doctype)}</td>
        <td>${escapeHtml((c.uploaded_at || "").slice(0, 10))}</td>
        <td><span class="badge ${statusClass(c.status)}">${escapeHtml(c.status)}</span></td>
        <td class="actions"></td>
      `;

      const actionsTd = tr.querySelector('.actions');

      // CV button
      const cvBtn = createBtn('cv', 'fa-up-right-from-square', 'CV', () => {
        if (c.cvLink) window.open(c.cvLink, '_blank');
      });
      actionsTd.appendChild(cvBtn);

      
      
      
      // Email button
      if (c.status !== 'Review' && c.status !== 'Done') {
        const emailBtn = createBtn('email', 'fa-envelope', 'Send Email', () => {
          window.location.href = `mailto:${encodeURIComponent(c.email)}`;
        });
        actionsTd.appendChild(emailBtn);
      }

      const rejectBtn = createBtn('reject', 'fa-xmark', 'Delete', () => deleteCandidate(c.id));
        actionsTd.appendChild(rejectBtn);

      tbody.appendChild(tr);
    });

    // Rebuild filter dropdowns after rendering the table
  if (window.renderFilterOptionsFromRows) {
    window.renderFilterOptionsFromRows();
  }

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
  const sortState = { index: null, direction: 'asc' }; // direction: 'asc' or 'desc'

  function parseExperience(expStr) {
    if (!expStr) return 0;
    const m = String(expStr).match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  }

  function compareByIndex(a, b, index) {
    switch (index) {
        case 0: // Name
            return a.name.localeCompare(b.name);

        case 1: // Filename
            return a.file_name.localeCompare(b.file_name);

        case 2: // File type
            return a.file_name
                .slice(a.file_name.lastIndexOf("."))
                .localeCompare(
                    b.file_name.slice(b.file_name.lastIndexOf("."))
                );

        case 3: // Upload date
            return new Date(a.uploaded_at) - new Date(b.uploaded_at);

        case 4: // Status
            return a.status.localeCompare(b.status);

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

    displayedCandidates.sort((a, b) => {
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

  async function loadCandidates() {
    try {
        const response = await fetch("/api/candidates");

        if (!response.ok) {
            throw new Error("Failed to fetch candidates");
        }

        candidates = await response.json();
        candidates = candidates.candidates.map(candidate => ({
    ...candidate,

    name: candidate.name ?? "N/A",
    email: candidate.email ?? "N/A",
    status: candidate.status ?? "",
    file_name: candidate.file_name ?? "",
    file_path: candidate.file_path ?? "",
    uploaded_at: candidate.uploaded_at ?? "",
    cvLink: "/api/" + candidate.file_path
}));
        

        

        displayedCandidates = [...candidates];

        console.log(candidates)

        render(displayedCandidates);

    } catch (err) {
        console.error(err);
    }
}

  // Initial render and attach sort handlers
  document.addEventListener("DOMContentLoaded", async () => {
    attachSortHandlers();
    await loadCandidates();
});

  function filterCandidates(filters) {
    return candidates.filter(candidate => {

        if (filters.search) {
            const search = filters.search.toLowerCase();

            const matches =
                candidate.name.toLowerCase().includes(search) ||
                candidate.file_name.toLowerCase().includes(search);

            if (!matches) return false;
        }

        if (
            filters.date.length &&
            !filters.date.includes((candidate.uploaded_at || "").slice(0, 10))
        ) {
            return false;
        }

        if (
            filters.status.length &&
            !filters.status.includes(candidate.status)
        ) {
            return false;
        }

        return true;
    });
}

window.filterCandidates = filterCandidates;
window.renderCandidates = render;
window.loadCandidates = loadCandidates;

function resetCandidates() {
    displayedCandidates = [...candidates];

    sortState.index = null;
    sortState.direction = "asc";

    updateSortIcons(-1, "asc");

    render(displayedCandidates);
}

window.resetCandidates = resetCandidates;

})();


