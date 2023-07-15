const endDateInput = document.getElementById("end-date");
const startDateInput = document.getElementById("start-date");
const addWeekPreset = document.getElementById("add-week");
const addMonthPreset = document.getElementById("add-month");
const form = document.querySelector(".date-counter-form");
const timeRadios = document.getElementsByName("time-units");
const daysRadios = document.getElementsByName("included-days");
const previousRequestElements = document.querySelector(".previous-requests")

renderPreviousRequests();

startDateInput.addEventListener("input", enableEndInputOnValid);
form.addEventListener("submit", trySubmitForm);

addWeekPreset.addEventListener("click", (event) => {
    event.preventDefault();
    endDateInput.value = dateFromPresset(startDateInput.value, addWeekPreset.getAttribute("data-preset"));
});

addMonthPreset.addEventListener("click", (event) => {
    event.preventDefault();
    endDateInput.value = dateFromPresset(startDateInput.value, addMonthPreset.getAttribute("data-preset"));
});

function setRequestsToLocalStorage(previousRequests) {
    localStorage.setItem("previousRequests", JSON.stringify(previousRequests));
}

function getRequestsFromLocalStorage() {
    return localStorage.getItem("previousRequests") !== null ? JSON.parse(localStorage.getItem("previousRequests")) : [];
}

function addNewRequestToLocalStorage(startDate, endDate, result) {
    let previousRequests = getRequestsFromLocalStorage();

    previousRequests.push({
        startDate: convertDate(startDate),
        endDate: convertDate(endDate),
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

function convertDate(date) {
    date = new Date(Date.parse(date));

    return String(date.getDate()).padStart(2, '0') + "/" +
    String(date.getMonth() + 1).padStart(2, '0') + "/" +
    date.getFullYear();
}

function getDuration(startDate, endDate, units = "days", type = "all days"){
    function convertDaysInto(time) {
        switch (units) {
            case "days":
                time = time;
                break;
            case "hours":
                time = time*24;
                break;
            case "minutes":
                time = time*60*24;
                break;
            case "seconds":
                time = time*3600*24;
                break;
        }
        return time;
    }

    const durationInDays = getDurationInDays(endDate, startDate);
    let result;
    
    switch (type) {
        case "all days":
            result = convertDaysInto(durationInDays);
            break;
        case "working days":
            result = convertDaysInto(durationInDays - getWeekendDays(startDate, endDate)) + " working";
            break;
        case "weekend days":
            result = convertDaysInto(getWeekendDays(startDate, endDate)) + " weekend"
            break;
    }
    result += " " + units;
    return result;
}

function getDurationInDays(endDate, startDate) {
    return (Date.parse(endDate) - Date.parse(startDate))/1000/3600/24;
}

function getWeekendDays(startDate, endDate){
    let days = getDurationInDays(endDate, startDate);
    let result = 0;
    startDate = new Date(Date.parse(startDate)).getDay();
    endDate = new Date(Date.parse(endDate)).getDay();

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

function renderPreviousRequests() {
    const previousRequests = getRequestsFromLocalStorage();
    let items = "";

    for(let previousRequest of previousRequests){
        items += `
        <div class="previous-request">
            <div class="previous-data">Start date: ${previousRequest.startDate}</div>
            <div class="previous-data">End date: ${previousRequest.endDate}</div>
            <div class="previous-data">Result: ${previousRequest.result}</div>
        </div>
        `
    }
    previousRequestElements.innerHTML = items;
}