if (document.querySelector("textarea#editor")) {
  ClassicEditor.create(document.querySelector("textarea#editor")).catch(
    (error) => {
      console.error(error);
    }
  );
}

document.querySelector("body").addEventListener("click", (e) => {
  if (e.target.className === "confirmDelete") {
    const result = confirm("Want to delete?");
    if (!result) {
      e.preventDefault();
      return false;
    }
  }
  if (e.target.className === "clearCart") {
    console("clear btn clicked");
    const result = confirm("Clear Cart?");
    if (!result) {
      e.preventDefault();
      return false;
    }
  }
});
