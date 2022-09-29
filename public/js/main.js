document.querySelector("body").addEventListener("click", (e) => {
  if (e.target.classList.contains("clearCart")) {
    const result = confirm("Clear Cart?");
    if (!result) {
      e.preventDefault();
      return false;
    }
  }
});
