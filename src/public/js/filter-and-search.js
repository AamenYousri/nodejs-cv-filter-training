/* ==========================================
   GET ALL FILTERS
========================================== */

const filters = document.querySelectorAll(".multi-filter");

/* ==========================================
   SELECTED FILTERS
========================================== */

const selectedFilters = {
  city: [],

  jobTitle: [],

  experience: [],

  skills: [],
};

/* ==========================================
   CANDIDATE SEARCH
========================================== */

const candidateSearch = document.getElementById("candidateSearch");

/* ==========================================
   INITIALIZE FILTERS
========================================== */

filters.forEach((filter) => {
  const filterName = filter.dataset.filter;

  const filterInput = filter.querySelector(".filter-input");

  const mainInput = filter.querySelector(".multi-input");

  const dropdownSearch = filter.querySelector(".dropdown-search input");

  const options = filter.querySelectorAll(".option");

  /* ======================================
       OPEN DROPDOWN
    ====================================== */

  filterInput.addEventListener("click", function (event) {
    event.stopPropagation();

    /* Close other dropdowns */

    filters.forEach((otherFilter) => {
      if (otherFilter !== filter) {
        otherFilter.classList.remove("open");
      }
    });

    /* Open current dropdown */

    filter.classList.add("open");
  });

  /* ======================================
       WRITE CUSTOM VALUE

       Value DOES NOT have to exist
       in the predefined list.
    ====================================== */

  mainInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();

      const value = mainInput.value.trim();

      /* Add ANY value */

      if (value !== "") {
        addValue(filterName, value, filter);
      }

      /* Clear input */

      mainInput.value = "";
    }
  });

  /* ======================================
       SELECT FROM LIST
    ====================================== */

  options.forEach((option) => {
    option.addEventListener("click", function (event) {
      event.stopPropagation();

      const value = option.textContent.trim();

      addValue(filterName, value, filter);

      /* Clear dropdown search */

      dropdownSearch.value = "";

      /* Show all options */

      filterOptions(filter, "");
    });
  });

  /* ======================================
       SEARCH INSIDE DROPDOWN
    ====================================== */

  dropdownSearch.addEventListener("input", function () {
    const searchValue = this.value.toLowerCase().trim();

    filterOptions(filter, searchValue);
  });
});

/* ==========================================
   ADD VALUE
========================================== */

function addValue(filterName, value, filter) {
  /* Prevent duplicate values */

  const alreadyExists = selectedFilters[filterName].some(
    (item) => item.toLowerCase() === value.toLowerCase(),
  );

  if (alreadyExists) {
    return;
  }

  /* Add value */

  selectedFilters[filterName].push(value);

  /* Update UI */

  renderSelectedValues(filterName, filter);

  console.log("Selected Filters:", selectedFilters);
}

/* ==========================================
   RENDER SELECTED VALUES
========================================== */

function renderSelectedValues(filterName, filter) {
  const container = filter.querySelector(".selected-items");

  /* Clear tags */

  container.innerHTML = "";

  /* Create tags */

  selectedFilters[filterName].forEach((value) => {
    const tag = document.createElement("div");

    tag.className = "selected-tag";

    tag.innerHTML = `

                <span>
                    ${value}
                </span>

                <button
                    type="button"
                    class="remove-tag"
                    title="Remove ${value}"
                >
                    ×
                </button>

            `;

    /* Remove button */

    const removeButton = tag.querySelector(".remove-tag");

    removeButton.addEventListener("click", function (event) {
      event.stopPropagation();

      removeValue(filterName, value, filter);
    });

    /* Add tag */

    container.appendChild(tag);
  });

  /* Update predefined options */

  updateSelectedOptions(filterName, filter);
}

/* ==========================================
   REMOVE VALUE
========================================== */

function removeValue(filterName, value, filter) {
  selectedFilters[filterName] = selectedFilters[filterName].filter(
    (item) => item.toLowerCase() !== value.toLowerCase(),
  );

  /* Re-render */

  renderSelectedValues(filterName, filter);

  console.log("Removed:", value);
}

/* ==========================================
   UPDATE SELECTED OPTIONS
========================================== */

function updateSelectedOptions(filterName, filter) {
  const options = filter.querySelectorAll(".option");

  options.forEach((option) => {
    const value = option.textContent.trim();

    const isSelected = selectedFilters[filterName].some(
      (item) => item.toLowerCase() === value.toLowerCase(),
    );

    if (isSelected) {
      option.classList.add("selected");
    } else {
      option.classList.remove("selected");
    }
  });
}

/* ==========================================
   FILTER DROPDOWN OPTIONS
========================================== */

function filterOptions(filter, searchValue) {
  const options = filter.querySelectorAll(".option");

  let found = false;

  options.forEach((option) => {
    const value = option.textContent.trim().toLowerCase();

    if (value.includes(searchValue)) {
      option.style.display = "block";

      found = true;
    } else {
      option.style.display = "none";
    }
  });

  /* Remove old message */

  const oldMessage = filter.querySelector(".no-results");

  if (oldMessage) {
    oldMessage.remove();
  }

  /* Show no results */

  if (!found) {
    const message = document.createElement("div");

    message.className = "no-results";

    message.textContent = "No results found";

    filter.querySelector(".options-list").appendChild(message);
  }
}

/* ==========================================
   CLOSE DROPDOWNS
========================================== */

document.addEventListener("click", function (event) {
  filters.forEach((filter) => {
    if (!filter.contains(event.target)) {
      filter.classList.remove("open");
    }
  });
});

/* ==========================================
   APPLY FILTER BUTTON
========================================== */

const applyFilterBtn = document.getElementById("applyFilterBtn");

applyFilterBtn.addEventListener("click", function () {
  /* Get search text */

  const searchValue = candidateSearch.value.trim();

  /* Create final filter object */

  const filtersToApply = {
    search: searchValue,

    city: [...selectedFilters.city],

    jobTitle: [...selectedFilters.jobTitle],

    experience: [...selectedFilters.experience],

    skills: [...selectedFilters.skills],
  };

  /* =================================
           RESULT
        ================================= */

  console.log("==============================");

  console.log("APPLY FILTER");

  console.log(filtersToApply);

  console.log("==============================");

  /*
            Later connect this object
            to your Fuse.js function.

            Example:

            filterCandidates(
                filtersToApply
            );
        */
});

/* ==========================================
   CLEAR ALL FILTERS
========================================== */

const clearFilterBtn = document.getElementById("clearFilterBtn");

clearFilterBtn.addEventListener("click", function () {
  /* Clear selected filters */

  selectedFilters.city = [];

  selectedFilters.jobTitle = [];

  selectedFilters.experience = [];

  selectedFilters.skills = [];

  /* Clear candidate search */

  candidateSearch.value = "";

  /* Reset all filters */

  filters.forEach((filter) => {
    const filterName = filter.dataset.filter;

    /* Re-render */

    renderSelectedValues(filterName, filter);

    /* Clear main input */

    const mainInput = filter.querySelector(".multi-input");

    mainInput.value = "";

    /* Clear dropdown search */

    const dropdownSearch = filter.querySelector(".dropdown-search input");

    dropdownSearch.value = "";

    /* Show all options */

    filterOptions(filter, "");

    /* Close dropdown */

    filter.classList.remove("open");
  });

  console.log("All filters cleared");
});

/* ==========================================
   CANDIDATE SEARCH
========================================== */

candidateSearch.addEventListener("input", function () {
  const searchValue = this.value.trim();

  console.log("Candidate Search:", searchValue);
});
