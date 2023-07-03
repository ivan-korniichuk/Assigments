const previousRequests = localStorage.getItem("previousRequests") ? 
JSON.parse(localStorage.getItem("previousRequests")) :
[];
console.log(previousRequests);
displayPreviousRequests();

document.querySelector("#start-date").addEventListener("input", () => {
    if(validDate(document.querySelector("#start-date").value)){
        document.querySelector("#end-date").disabled = false;
        document.querySelector("#end-date").min = document.querySelector("#start-date").value;
        document.querySelector("#add-week").classList.remove("isDisabled");
        document.querySelector("#add-month").classList.remove("isDisabled");
    }
    else{
        document.querySelector("#end-date").disabled = true;
        document.querySelector("#add-week").classList.add("isDisabled");
        document.querySelector("#add-month").classList.add("isDisabled");
    }
});

for(let preset of document.querySelectorAll("a.preset")){
    preset.addEventListener("click", () => {
        document.querySelector("#end-date").value = dateFromPresset(document.querySelector("#start-date").value, preset.getAttribute("data-preset"));
    });
}

document.querySelector(".date-counter-form").addEventListener("submit", (event) => {
    const startDate = document.querySelector("#start-date").value;
    const endDate = document.querySelector("#end-date").value;
    const result = getDuration(
        startDate,
        endDate,
        getRadioValue(document.getElementsByName("time-units")),
        getRadioValue(document.getElementsByName("included-days"))
        );

    event.preventDefault();

    if (document.querySelector(".date-counter-form").checkValidity())  {
        createSavedCounter(startDate, endDate, result);
    }
});

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
    }
    else if (days < 7) {
        if (startDate < endDate) {
            if (startDate === 0) {
                return 1;
            } else {
                return 0;
            }
        } 
    }

    if (startDate === 0) {
        result += 1;
    }

    if (endDate === 0) {
        result += 1;
    } else {
        result += 2;
    }

    days -= 7 - startDate + endDate;

    result += days / 7 * 2;

    return result;
}

function createSavedCounter(startDate, endDate, result) {
    previousRequests.push({
        startDate: startDate,
        endDate: endDate,
        result: result,
    });
    while(previousRequests.length > 10){
        previousRequests.shift();
    }
    localStorage.setItem("previousRequests", JSON.stringify(previousRequests));
    console.clear();
    console.log(JSON.parse(localStorage.getItem("previousRequests")));
    displayPreviousRequests();
    //location.reload;
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

function displayPreviousRequests(){
    let items = "";
    for(previousRequest of previousRequests){
        items += `
        <div class="previous-request">
            <div class="previous-data">Start date: ${previousRequest.startDate}</div>
            <div class="previous-data">End date: ${previousRequest.endDate}</div>
            <div class="previous-data">Result: ${previousRequest.result}</div>
        </div>
        `
    }

    document.querySelector(".previous-requests").innerHTML = items;
}