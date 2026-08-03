const filters = document.querySelectorAll(".multi-filter");

const selectedFilters = {
  city: [],
  jobTitle: [],
  experience: [],
  skills: [],
};

const candidateSearch = document.getElementById("candidateSearch");

function getTableCellValueByFilter(filterName, row) {
  if (!row) return "";

  const cells = row.querySelectorAll("td");

  switch (filterName) {
    case "city":
      return cells[3]?.textContent?.trim() || "";
    case "jobTitle":
      return cells[1]?.textContent?.trim() || "";
    case "experience":
      return cells[2]?.textContent?.trim() || "";
    default:
      return "";
  }
}

function getAvailableFilterValues(filterName) {
  const rows = document.querySelectorAll("#candidates-tbody tr");
  const values = [];

  rows.forEach((row) => {
    const value = getTableCellValueByFilter(filterName, row);
    if (value && !values.includes(value)) {
      values.push(value);
    }
  });

  return values.sort((a, b) => a.localeCompare(b));
}

function renderFilterOptionsFromRows() {
  filters.forEach((filter) => {
    const filterName = filter.dataset.filter;
    const optionsList = filter.querySelector(".options-list");

    if (!optionsList) return;

    if (filterName === "skills") {
      optionsList.innerHTML = "";
      return;
    }

    const selected = selectedFilters[filterName] || [];
    const availableValues = getAvailableFilterValues(filterName);
    const values = [...new Set([...availableValues, ...selected])].sort((a, b) =>
      a.localeCompare(b),
    );

    optionsList.innerHTML = "";

    if (!values.length) {
      const message = document.createElement("div");
      message.className = "no-results";
      message.textContent = "No available values";
      optionsList.appendChild(message);
      return;
    }

    values.forEach((value) => {
      const option = document.createElement("div");
      option.className = "option";
      option.textContent = value;

      if (selected.some((item) => item.toLowerCase() === value.toLowerCase())) {
        option.classList.add("selected");
      }

      option.addEventListener("click", (event) => {
        event.stopPropagation();
        addValue(filterName, value, filter);

        const dropdownSearch = filter.querySelector(".dropdown-search input");
        if (dropdownSearch) {
          dropdownSearch.value = "";
        }

        filterOptions(filter, "");
      });

      optionsList.appendChild(option);
    });
  });
}

function addValue(filterName, value, filter) {
  if (!selectedFilters[filterName]) {
    selectedFilters[filterName] = [];
  }

  const alreadyExists = selectedFilters[filterName].some(
    (item) => item.toLowerCase() === value.toLowerCase(),
  );

  if (alreadyExists) return;

  selectedFilters[filterName].push(value);
  renderSelectedValues(filterName, filter);

  if (filterName !== "skills") {
    renderFilterOptionsFromRows();
  }
}

function renderSelectedValues(filterName, filter) {
  const container = filter.querySelector(".selected-items");
  if (!container) return;

  container.innerHTML = "";

  (selectedFilters[filterName] || []).forEach((value) => {
    const tag = document.createElement("div");
    tag.className = "selected-tag";
    tag.innerHTML = `
      <span>${value}</span>
      <button type="button" class="remove-tag" title="Remove ${value}">×</button>
    `;

    const removeButton = tag.querySelector(".remove-tag");
    removeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      removeValue(filterName, value, filter);
    });

    container.appendChild(tag);
  });

  updateSelectedOptions(filterName, filter);
}

function removeValue(filterName, value, filter) {
  selectedFilters[filterName] = (selectedFilters[filterName] || []).filter(
    (item) => item.toLowerCase() !== value.toLowerCase(),
  );

  renderSelectedValues(filterName, filter);

  if (filterName !== "skills") {
    renderFilterOptionsFromRows();
  }
}

function updateSelectedOptions(filterName, filter) {
  const options = filter.querySelectorAll(".option");

  options.forEach((option) => {
    const value = option.textContent.trim();
    const isSelected = (selectedFilters[filterName] || []).some(
      (item) => item.toLowerCase() === value.toLowerCase(),
    );

    option.classList.toggle("selected", isSelected);
  });
}

function filterOptions(filter, searchValue) {
  const options = filter.querySelectorAll(".option");
  let found = false;

  options.forEach((option) => {
    const value = option.textContent.trim().toLowerCase();
    const shouldShow = value.includes(searchValue);
    option.style.display = shouldShow ? "block" : "none";
    if (shouldShow) found = true;
  });

  const oldMessage = filter.querySelector(".no-results");
  if (oldMessage) oldMessage.remove();

  if (!found) {
    const message = document.createElement("div");
    message.className = "no-results";
    message.textContent = "No results found";
    filter.querySelector(".options-list").appendChild(message);
  }
}

filters.forEach((filter) => {
  const filterName = filter.dataset.filter;
  const filterInput = filter.querySelector(".filter-input");
  const mainInput = filter.querySelector(".multi-input");
  const dropdownSearch = filter.querySelector(".dropdown-search input");
  const optionsList = filter.querySelector(".options-list");

  filterInput.addEventListener("click", (event) => {
    event.stopPropagation();

    filters.forEach((otherFilter) => {
      if (otherFilter !== filter) {
        otherFilter.classList.remove("open");
      }
    });

    filter.classList.add("open");
  });

  if (filterName === "skills") {
  mainInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;

    event.preventDefault();

    const value = mainInput.value.trim();

    if (!value) return;

    addValue(filterName, value, filter);

    mainInput.value = "";
  });
} else {
    mainInput.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;

      event.preventDefault();

      const value = mainInput.value.trim();
      const validValues = getAvailableFilterValues(filterName);

      if (value && validValues.some((item) => item.toLowerCase() === value.toLowerCase())) {
        addValue(filterName, value, filter);
      }

      mainInput.value = "";
    });
  }

  dropdownSearch.addEventListener("input", function () {
    const searchValue = this.value.toLowerCase().trim();
    filterOptions(filter, searchValue);
  });

  if (filterName === "skills") {
    optionsList.innerHTML = "";
  }
});

const candidatesTableBody = document.getElementById("candidates-tbody");
if (candidatesTableBody) {
  const observer = new MutationObserver(() => {
    renderFilterOptionsFromRows();
  });

  observer.observe(candidatesTableBody, {
    childList: true,
    subtree: true,
  });
}

document.addEventListener("click", (event) => {
  filters.forEach((filter) => {
    if (!filter.contains(event.target)) {
      filter.classList.remove("open");
    }
  });
});

const applyFilterBtn = document.getElementById("applyFilterBtn");
if (applyFilterBtn) {
  applyFilterBtn.addEventListener("click", function () {
    const filtersToApply = {
      search: candidateSearch ? candidateSearch.value.trim() : "",
      city: [...selectedFilters.city],
      jobTitle: [...selectedFilters.jobTitle],
      experience: [...selectedFilters.experience],
      skills: [...selectedFilters.skills],
    };

    console.log("==============================");
    console.log("APPLY FILTER");
    const filtered = window.filterCandidates(filtersToApply);

    window.renderCandidates(filtered);
    console.log("==============================");
  });
}

const clearFilterBtn = document.getElementById("clearFilterBtn");
if (clearFilterBtn) {
  clearFilterBtn.addEventListener("click", function () {
    selectedFilters.city = [];
    selectedFilters.jobTitle = [];
    selectedFilters.experience = [];
    selectedFilters.skills = [];

    if (candidateSearch) {
      candidateSearch.value = "";
    }

    filters.forEach((filter) => {
      const filterName = filter.dataset.filter;
      renderSelectedValues(filterName, filter);

      const mainInput = filter.querySelector(".multi-input");
      if (mainInput) {
        mainInput.value = "";
      }

      const dropdownSearch = filter.querySelector(".dropdown-search input");
      if (dropdownSearch) {
        dropdownSearch.value = "";
      }

      if (filterName !== "skills") {
        renderFilterOptionsFromRows();
      }

      filter.classList.remove("open");
    });

    
    window.resetCandidates();

  });
}

if (candidateSearch) {
  candidateSearch.addEventListener("input", function () {
    console.log("Candidate Search:", this.value.trim());
  });
}

renderFilterOptionsFromRows();
window.renderFilterOptionsFromRows = renderFilterOptionsFromRows;