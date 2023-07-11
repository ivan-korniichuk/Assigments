const endDateInput = document.getElementById("end-date");
const startDateInput = document.getElementById("start-date");
const addWeekPreset = document.getElementById("add-week");
const addMonthPreset = document.getElementById("add-month");
const form = document.querySelector(".date-counter-form");
const presets = document.querySelectorAll("a.preset");
const timeRadios = document.getElementsByName("time-units");
const daysRadios = document.getElementsByName("included-days");
const previousRequestElements = document.querySelector(".previous-requests")

renderPreviousRequests();

startDateInput.addEventListener("input", enableEndInputOnValid);
form.addEventListener("submit", trySubmitForm);

for(let preset of presets) {
    preset.addEventListener("click", () => {
        endDateInput.value = dateFromPresset(startDateInput.value, preset.getAttribute("data-preset"));
    });
}

function setRequestsToLocalStorage(previousRequests) {
    localStorage.setItem("previousRequests", JSON.stringify(previousRequests));
}

function getRequestsFromLocalStorage() {
    return localStorage.getItem("previousRequests") !== null ? JSON.parse(localStorage.getItem("previousRequests")) : [];
}

function addNewRequestToLocalStorage(startDate, endDate, result) {
    let previousRequests = getRequestsFromLocalStorage();

    previousRequests.push({
        startDate: startDate,
        endDate: endDate,
        result: result,
    });

    while(previousRequests.length > 10){
        previousRequests.shift();
    }

    setRequestsToLocalStorage(previousRequests);

    renderPreviousRequests();
}

function enableEndInputOnValid() {
    if(validDate(startDateInput.value)){
        endDateInput.disabled = false;
        endDateInput.min = startDateInput.value;
        addWeekPreset.classList.remove("isDisabled");
        addMonthPreset.classList.remove("isDisabled");
    }
    else{
        endDateInput.disabled = true;
        addWeekPreset.classList.add("isDisabled");
        addMonthPreset.classList.add("isDisabled");
    }
}

function trySubmitForm (event) {
    event.preventDefault();

    if (form.checkValidity()) {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        const result = getDuration(
            startDate,
            endDate,
            getRadioValue(timeRadios),
            getRadioValue(daysRadios)
        );

        addNewRequestToLocalStorage(startDate, endDate, result);
    }
}

function dateFromPresset(date, preset = "week"){
    let newDate;
    switch (preset){
        case "month":
            newDate = new Date(new Date(date).setMonth(new Date(date).getMonth() + 1))
            break;
        case "week":
            newDate = new Date(new Date(date).setDate(new Date(date).getDate() + 7))
            break;
    }
    return newDate.getFullYear() + "-" + String(newDate.getMonth() + 1).padStart(2, '0') + "-" + String(newDate.getDate()).padStart(2, '0');
}

function getDuration(startDate, endDate, units = "days", type = "all days"){
    const duration = convertTime((Date.parse(endDate) - Date.parse(startDate)), "milliseconds", units)
    let result = "";
    
    switch (type) {
        case "all days":
            result += duration;
            break;
        case "working days":
            result += duration - convertTime(getWeekendDays(startDate, endDate), "days", units) + " working";
            break;
        case "weekend days":
            result += convertTime(getWeekendDays(startDate, endDate), "days", units) + " weekend"
            break;
    }
    result += " " + units;
    return result;
}

function convertTime(time, unit = "days", newUnit = "days") {
    switch (unit) {
        case "days":
            time = time*1000*3600*24;
            break;
        case "hours":
            time = time*1000*3600
            break;
        case "minutes":
            time = time*1000*60;
            break;
        case "seconds":
            time = time*1000;
            break;
        case "milliseconds":
            time = time;
            break;
    }
    switch (newUnit) {
        case "days":
            time = time/1000/3600/24;
            break;
        case "hours":
            time = time/1000/3600
            break;
        case "minutes":
            time = time/1000/60;
            break;
        case "seconds":
            time = time/1000;
            break;
        case "milliseconds":
            time = time;
            break;
    }
    return time;
}

function getWeekendDays(startDate, endDate){
    let days = convertTime((Date.parse(endDate) - Date.parse(startDate)), "milliseconds", "days")
    let result = 0;
    startDate = new Date(Date.parse(startDate)).getDay();
    endDate = new Date(Date.parse(endDate)).getDay();

    if (days === 0) {
        console.log("days === 0");
        return 0;
    } else if (days < 7) {
        if (startDate < endDate) {
            if (startDate === 0) {
                return 1;
            } else {
                return 0;
            }
        } 
    }

    if (startDate === 0) result += 1;

    if (endDate === 0) {
        result += 1;
    } else {
        result += 2;
    }

    days -= 7 - startDate + endDate;
    result += days / 7 * 2;
    return result;
}

function validDate(date){
    return !isNaN(new Date(date));
}

function getRadioValue(elements){
    for(let element of elements){
        if(element.checked){
            return element.value;
        }
    }
    return false;
}

function renderPreviousRequests(){
    const previousRequests = getRequestsFromLocalStorage();
    let items = "";

    for(let previousRequest of previousRequests){
        items += `
        <div class="previous-request">
            <span class="previous-data">Start date: ${previousRequest.startDate}</span>
            <span class="previous-data">End date: ${previousRequest.endDate}</span>
            <span class="previous-data">Result: ${previousRequest.result}</span>
        </div>
        `
    }
    previousRequestElements.innerHTML = items;
}