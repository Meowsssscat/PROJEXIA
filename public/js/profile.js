document.addEventListener("DOMContentLoaded", () => {
  const modals = {
    editModal: document.getElementById("editProfileModal"),
    editWarningModal: document.getElementById("warningModal"),
    submitWarningModal: document.getElementById("submitWarningModal"),
    noChangesModal: document.getElementById("noChangesModal"),
  };

  const zBase = 1000; // base z-index for modals

  // Function to bring a modal to front
  function bringToFront(modal) {
    // reset z-index for all modals
    Object.values(modals).forEach(m => m.style.zIndex = zBase);
    // bring the specified modal to front
    modal.style.zIndex = zBase + 100;
  }

  const editBtn = document.getElementById("editProfileBtn");
  const closeEditModal = document.getElementById("closeEditModal");

  const editWarningMessage = document.getElementById("warningMessage");
  const cancelEdit = document.getElementById("cancelEdit");
  const proceedEdit = document.getElementById("proceedEdit");

  const editForm = document.querySelector(".edit-profile-form");
  const cancelSubmit = document.getElementById("cancelSubmit");
  const confirmSubmit = document.getElementById("confirmSubmit");
  const closeNoChanges = document.getElementById("closeNoChanges");

  // Original data
  const originalFullName = document.getElementById("editFullName").value;
  const originalProgram = document.getElementById("editProgram").value;
  const originalYear = document.getElementById("editYear").value;

  const lastEdit = new Date(editBtn.dataset.lastEdit);

  // --- Click Edit Button ---
  editBtn.addEventListener("click", () => {
    const now = new Date();
    const diffDays = Math.floor((now - lastEdit) / (1000 * 60 * 60 * 24));

    if (isNaN(lastEdit.getTime())) {
      modals.editModal.style.display = "flex";
      bringToFront(modals.editModal);
      return;
    }

    if (diffDays < 30) {
      editWarningMessage.textContent = `You can only edit your profile every 30 days. Remaining days: ${30 - diffDays}`;
      proceedEdit.style.display = "none";
      modals.editWarningModal.style.display = "flex";
      bringToFront(modals.editWarningModal);
      return;
    }

    editWarningMessage.textContent = "You can only edit your profile once every 30 days. Do you want to proceed?";
    proceedEdit.style.display = "inline-block";
    modals.editWarningModal.style.display = "flex";
    bringToFront(modals.editWarningModal);
  });

  cancelEdit.addEventListener("click", () => {
    modals.editWarningModal.style.display = "none";
  });

  proceedEdit.addEventListener("click", () => {
    modals.editWarningModal.style.display = "none";
    modals.editModal.style.display = "flex";
    bringToFront(modals.editModal);
  });

  // --- Submit Form ---
  editForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const newFullName = document.getElementById("editFullName").value.trim();
    const newProgram = document.getElementById("editProgram").value;
    const newYear = document.getElementById("editYear").value;

    if (
      newFullName === originalFullName &&
      newProgram === originalProgram &&
      newYear === originalYear
    ) {
      modals.noChangesModal.style.display = "flex";
      bringToFront(modals.noChangesModal);
      return;
    }

    modals.submitWarningModal.style.display = "flex";
    bringToFront(modals.submitWarningModal);
  });

  cancelSubmit.addEventListener("click", () => {
    modals.submitWarningModal.style.display = "none";
  });

  confirmSubmit.addEventListener("click", () => {
    modals.submitWarningModal.style.display = "none";
    editForm.submit();
  });

  closeNoChanges.addEventListener("click", () => {
    modals.noChangesModal.style.display = "none";
  });

  closeEditModal.addEventListener("click", () => {
    modals.editModal.style.display = "none";
  });

  // Close modals on outside click
  window.addEventListener("click", (e) => {
    Object.values(modals).forEach(modal => {
      if (e.target === modal) modal.style.display = "none";
    });
  });
});
