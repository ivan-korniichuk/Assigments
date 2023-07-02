const previousRequests = localStorage.getItem("previousRequests") ? 
JSON.parse(localStorage.getItem("previousRequests")) :
[];
console.log(previousRequests);
displayPreviousRequests();

//localStorage.setItem("previousRequests", JSON.stringify([])); //to clear

// function initCheckboxesValidation(){
//     const checkboxes = document.querySelectorAll(".time-units > fieldset > input[type=checkbox]");
//     for(checkbox of checkboxes){
//         checkbox.addEventListener("click", checkValidity);
//     }

//     function isChecked(){
//         for (checkbox of checkboxes){
//             if (checkbox.checked) return true;
//         }

//         return false;
//     }

//     function checkValidity() {
//         const errorMessage = !isChecked() ? 'At least one checkbox must be selected.' : '';
//         checkboxes[0].setCustomValidity(errorMessage);
//     }
// };

// initCheckboxesValidation();

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
    const result = countDuration(startDate, endDate, getRadioValue(document.getElementsByName("time-units")));

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

function countDuration(startDate, endDate, unit = "days"/*units = ["days", "hours", "minutes", "seconds"]*/) {
    let duration = (Date.parse(endDate) - Date.parse(startDate))/1000;
    //let durationInUnits = "";
    let time = 0;
    //const defaultUnits = ["days", "hours", "minutes", "seconds"];

    // for(let defaultUnit of defaultUnits){
    //     for(let unit of units){
    //         if(unit === defaultUnit){
    //             switch (unit) {
    //                 case "days":
    //                     time = duration/3600/24;
    //                     duration -= time*3600*24;
    //                     break;
    //                 case "hours":
    //                     time = duration/3600;
    //                     duration -= time*3600;
    //                     break;
    //                 case "minutes":
    //                     time = duration/60;
    //                     duration -= time*60;
    //                     break;
    //                 case "seconds":
    //                     time = duration;
    //                     duration -= time*3600*24;
    //                     break;
    //             }
    //             durationInUnits += time + " " + unit + " ";
    //         }
    //     }
    // }

    switch (unit) {
        case "days":
            time = duration/3600/24;
            duration -= time*3600*24;
            break;
        case "hours":
            time = duration/3600;
            duration -= time*3600;
            break;
        case "minutes":
            time = duration/60;
            duration -= time*60;
            break;
        case "seconds":
            time = duration;
            duration -= time*3600*24;
            break;
    }
    return time + " " + unit;
}

function createSavedCounter(startDate, endDate, result){
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