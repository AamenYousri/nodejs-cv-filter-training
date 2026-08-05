// candidates-list.js
// Dynamic candidates list with a modifiable array and simple API.

(function () {
  const tbody = document.getElementById('candidates-tbody');

  

  async function updateCandidateStatus(candidateId, accessToken, status) {
  try {
    const response = await fetch(`/api/candidates/${candidateId}/status`, {
      method: "PATCH", // Change to PUT if your route uses PUT
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ "status": status }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update candidate status");
    }
    
    return data;
  } catch (error) {
    console.error("Error updating candidate status:", error);
    throw error;
  }

  
  }


  let candidates = [
    { id: 1, name: 'Ahmed Tarek', title: 'Software Developer', experience: '3 Years', city: 'Alexandria, Egypt', match: 95, status: 'Done', cvLink: '#', email: 'ahmed@example.com' },
    { id: 2, name: 'Mohamed Ahmed', title: 'Software Developer', experience: '2 Years', city: 'Cairo, Egypt', match: 83, status: 'Review', cvLink: '#', email: 'mohamed@example.com' },
    { id: 3, name: 'Aly Mohamed', title: 'Software Engineer', experience: '4 Years', city: 'Cairo, Egypt', match: 50, status: 'Accepted', cvLink: '#', email: 'aly@example.com' },
  ];

  let displayedCandidates = [...candidates];

  async function handleCandidateStatusUpdate(candidateId, status) {
    try {
      await updateCandidateStatus(candidateId, window.TokenStorage?.get(), status);

      candidates = candidates.map((candidate) =>
        candidate.id === candidateId ? { ...candidate, status } : candidate,
      );
      displayedCandidates = displayedCandidates.map((candidate) =>
        candidate.id === candidateId ? { ...candidate, status } : candidate,
      );
      render(displayedCandidates);

      await loadCandidates();
    } catch (error) {
      console.error("Unable to update candidate status:", error);
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

      tr.innerHTML = `
        <td>${escapeHtml(c.name)}</td>
        <td>${escapeHtml(c.title)}</td>
        <td>${escapeHtml(c.experience)}</td>
        <td>${escapeHtml(c.city)}</td>
        <td><span class="badge ${statusClass(c.status)}">${escapeHtml(c.status)}</span></td>
        <td class="actions"></td>
      `;

      const actionsTd = tr.querySelector('.actions');

      // CV button
      const cvBtn = createBtn('cv', 'fa-up-right-from-square', 'CV', () => {
        if (c.cvLink) window.open(c.cvLink, '_blank');
      });
      actionsTd.appendChild(cvBtn);

      // Accept/Reject buttons for review status
      if (c.status === 'Review') {

        const acceptBtn = createBtn('accept', 'fa-check', 'Accept', () => handleCandidateStatusUpdate(c.id, 'Accepted'));
        const rejectBtn = createBtn('reject', 'fa-xmark', 'Reject', () => handleCandidateStatusUpdate(c.id, 'Rejected'));
        actionsTd.appendChild(acceptBtn);
        actionsTd.appendChild(rejectBtn);
      }

      // Email button
      if (c.status !== 'Review' && c.status !== 'Done') {
        const emailBtn = createBtn('email', 'fa-envelope', 'Send Email', () => {
          window.location.href = `mailto:${encodeURIComponent(c.email)}`;
        });
        actionsTd.appendChild(emailBtn);
      }

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
      case 0: // name
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      case 1: // title
        return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
      case 2: // experience (numeric years)
        return parseExperience(a.experience) - parseExperience(b.experience);
      case 3: // city
        return a.city.localeCompare(b.city, undefined, { sensitivity: 'base' });
      case 4: // match (numeric)
        return (a.match || 0) - (b.match || 0);
      case 5: // status
        return a.status.localeCompare(b.status, undefined, { sensitivity: 'base' });
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
    city: candidate.city ?? "N/A",
    title: candidate.job_title ?? "N/A",
    status: candidate.status ?? "",
    file_name: candidate.file_name ?? "",
    file_path: candidate.file_path ?? "",
    experience:
        candidate.years_of_experience == null
            ? ""
            : `${candidate.years_of_experience} Years`,
    cvLink:"/api/" + candidate.file_path
}));
        

        

        displayedCandidates = [...candidates];

        const candidateSkills = candidates.flatMap((candidate) => {
          if (Array.isArray(candidate.skills)) return candidate.skills;
          return String(candidate.skills || "")
            .replace(/^\{?(.+?)\}?$/, "$1")
            .split(",")
            .filter(Boolean);
        });
        window.dispatchEvent(new CustomEvent("candidates-loaded", {
          detail: { skills: candidateSkills },
        }));

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

        // Search
        if (filters.search) {

    const search = filters.search.toLowerCase();

    const matches =
        candidate.name.toLowerCase().includes(search) ||
        candidate.title.toLowerCase().includes(search) ||
        candidate.city.toLowerCase().includes(search);

    if (!matches) {
        return false;
    }
}

        // City
        if (
            filters.city.length &&
            !filters.city.includes(candidate.city)
        ) {
            return false;
        }

        // Job Title
        if (
            filters.jobTitle.length &&
            !filters.jobTitle.includes(candidate.title)
        ) {
            return false;
        }

        // Experience
        if (
            filters.experience.length &&
            !filters.experience.includes(candidate.experience)
        ) {
            return false;
        }

        // Skills
        if (filters.skills.length) {
            const candidateSkills = Array.isArray(candidate.skills)
                ? candidate.skills
                : String(candidate.skills || "")
                    .replace(/^\{?(.+?)\}?$/, "$1")
                    .split(",")
                    .filter(Boolean);

            const normalizeSkill = (skill) => String(skill).trim().toLowerCase();

            const hasAllSkills = filters.skills.every(skill =>
                candidateSkills.some(s =>
                    normalizeSkill(s) === normalizeSkill(skill)
                )
            );

            if (!hasAllSkills) return false;
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


