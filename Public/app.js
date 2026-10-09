const form = document.querySelector("#watch-form");
const msg = document.querySelector("#form-message");
const tripInputs = [...document.querySelectorAll('input[name="tripType"]')];
const returnField = document.querySelector("#return-field");
const returnInput = document.querySelector("#returnDate");
const originInput = document.querySelector("#origin");
const destinationInput = document.querySelector("#destination");
const departureInput = document.querySelector("#departureDate");

const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0");
const dd = String(today.getDate()).padStart(2, "0");
departureInput.min = `${yyyy}-${mm}-${dd}`;
returnInput.min = departureInput.min;

function selectedTripType() {
  return tripInputs.find((input) => input.checked)?.value || "roundtrip";
}
function updateTripType() {
  const oneWay = selectedTripType() === "oneway";
  returnField.hidden = oneWay;
  returnInput.required = !oneWay;
  updatePreview();
}
function formatDate(value) {
  if (!value) return "";
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
function updatePreview() {
  const origin = originInput.value.toUpperCase() || "FROM";
  const destination = destinationInput.value.toUpperCase() || "---";
  document.querySelector("#preview-origin").textContent = origin;
  document.querySelector("#preview-destination").textContent = destination;
  const depart = formatDate(departureInput.value);
  const ret = formatDate(returnInput.value);
  document.querySelector("#preview-dates").textContent = depart ? (selectedTripType() === "oneway" ? depart + " · One way" : (ret ? `${depart} — ${ret}` : `${depart} · Choose return date`)) : "Choose your travel dates";
  const duration = Number(document.querySelector("#durationDays").value);
  document.querySelector("#preview-duration").textContent = duration === 1 ? "24 hours" : `${duration} days`;
  const frequency = Number(document.querySelector("#frequencyHours").value);
  document.querySelector("#preview-frequency").textContent = frequency === 24 ? "Daily" : `Every ${frequency} hours`;
  const drop = Number(document.querySelector("#dropPercent").value);
  document.querySelector("#preview-drop").textContent = drop === 0 ? "Any decrease" : `${drop}% or more`;
}
[...tripInputs, originInput, destinationInput, departureInput, returnInput,
  document.querySelector("#durationDays"), document.querySelector("#frequencyHours"),
  document.querySelector("#dropPercent")].forEach((element) => element.addEventListener("change", updatePreview));
[originInput, destinationInput].forEach((element) => element.addEventListener("input", () => {
  element.value = element.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3);
  updatePreview();
}));
departureInput.addEventListener("change", () => {
  returnInput.min = departureInput.value || departureInput.min;
  if (returnInput.value && returnInput.value < departureInput.value) returnInput.value = "";
  updatePreview();
});
tripInputs.forEach((input) => input.addEventListener("change", updateTripType));

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  msg.hidden = true;
  const button = form.querySelector("button[type=submit]");
  button.disabled = true;
  button.textContent = "Saving watch…";
  const data = {
    tripType: selectedTripType(),
    origin: originInput.value,
    destination: destinationInput.value,
    departureDate: departureInput.value,
    returnDate: returnInput.value,
    durationDays: Number(document.querySelector("#durationDays").value),
    frequencyHours: Number(document.querySelector("#frequencyHours").value),
    dropPercent: Number(document.querySelector("#dropPercent").value),
    targetPrice: document.querySelector("#targetPrice").value,
    email: document.querySelector("#email").value
  };
  try {
    const response = await fetch("/api/watches", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not save your watch.");
    msg.className = "form-message success";
    msg.textContent = `${result.message} Watch ID: ${result.id.slice(0, 8)}.`;
    msg.hidden = false;
    form.reset();
    departureInput.min = `${yyyy}-${mm}-${dd}`;
    returnInput.min = departureInput.min;
    updateTripType();
  } catch (error) {
    msg.className = "form-message error";
    msg.textContent = error.message || "Unable to reach the server. Please try again.";
    msg.hidden = false;
  } finally {
    button.disabled = false;
    button.innerHTML = 'Save my flight watch <span>↗</span>';
  }
});
updateTripType();
